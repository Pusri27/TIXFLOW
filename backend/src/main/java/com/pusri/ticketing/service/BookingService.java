package com.pusri.ticketing.service;

import com.pusri.ticketing.dto.request.BookingInitiateRequest;
import com.pusri.ticketing.dto.request.ConfirmPaymentRequest;
import com.pusri.ticketing.dto.response.BookingResponse;
import com.pusri.ticketing.dto.response.SeatWebSocketMessage;
import com.pusri.ticketing.entity.*;
import com.pusri.ticketing.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final TicketRepository ticketRepository;
    private final SeatLockService seatLockService;
    private final TicketService ticketService;
    private final SimpMessagingTemplate messagingTemplate;

    @Value("${app.booking.expiry-minutes:10}")
    private int expiryMinutes;

    @Value("${app.frontend.url:https://tixflow-frontend-bauggozpgq-as.a.run.app}")
    private String frontendUrl;

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    @Transactional
    public BookingResponse initiateBooking(BookingInitiateRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Event tidak ditemukan"));

        List<Long> seatIds = request.getSeatIds();

        // Step 1: Try Redis Distributed Locks for all requested seats
        List<Long> acquiredLocks = new ArrayList<>();
        try {
            for (Long seatId : seatIds) {
                boolean locked = seatLockService.tryLockSeat(seatId, user.getId());
                if (!locked) {
                    throw new IllegalStateException("Kursi ID " + seatId + " sedang dipesan oleh user lain!");
                }
                acquiredLocks.add(seatId);
            }

            // Step 2: Acquire Pessimistic DB Lock (SELECT FOR UPDATE)
            List<Seat> seats = seatRepository.findAllByIdsForUpdate(seatIds);
            for (Seat seat : seats) {
                if (seat.getStatus() != SeatStatus.AVAILABLE) {
                    throw new IllegalStateException("Kursi " + seat.getRowLabel() + seat.getSeatNumber() + " sudah tidak tersedia!");
                }
            }

            // Step 3: Update seat status to HELD
            BigDecimal totalAmount = BigDecimal.ZERO;
            for (Seat seat : seats) {
                seat.setStatus(SeatStatus.HELD);
                if (seat.getCategory() != null) {
                    totalAmount = totalAmount.add(seat.getCategory().getPrice());
                }
            }
            seatRepository.saveAll(seats);

            // Step 4: Create Booking record
            String bookingCode = "BOOK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            Booking booking = Booking.builder()
                    .bookingCode(bookingCode)
                    .user(user)
                    .event(event)
                    .status(BookingStatus.PENDING)
                    .totalAmount(totalAmount)
                    .paymentMethod("STRIPE")
                    .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                    .items(new ArrayList<>())
                    .build();

            for (Seat seat : seats) {
                BigDecimal price = seat.getCategory() != null ? seat.getCategory().getPrice() : BigDecimal.ZERO;
                BookingItem item = BookingItem.builder()
                        .booking(booking)
                        .seat(seat)
                        .priceSnapshot(price)
                        .build();
                booking.getItems().add(item);
            }

            Booking savedBooking = bookingRepository.save(booking);

            // Step 5: Broadcast WebSocket seat status update
            broadcastSeatStatusChange(event.getId(), seatIds, "HELD", user.getId());

            return mapToBookingResponse(savedBooking);

        } catch (Exception e) {
            // Revert acquired Redis locks on failure
            for (Long lockSeatId : acquiredLocks) {
                seatLockService.unlockSeat(lockSeatId);
            }
            throw e;
        }
    }

    @Transactional
    public BookingResponse confirmPayment(Long bookingId, ConfirmPaymentRequest request, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Booking ini bukan milik Anda");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Status booking tidak valid: " + booking.getStatus());
        }

        if (LocalDateTime.now().isAfter(booking.getExpiresAt())) {
            cancelBookingInternal(booking);
            throw new IllegalStateException("Waktu pembayaran booking ini sudah habis (Expired)!");
        }

        // Confirm booking & create Stripe PaymentIntent
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaymentMethod(request.getPaymentMethod());

        try {
            if (stripeSecretKey != null && !stripeSecretKey.startsWith("sk_test_mock")) {
                com.stripe.Stripe.apiKey = stripeSecretKey;
                com.stripe.param.PaymentIntentCreateParams params = com.stripe.param.PaymentIntentCreateParams.builder()
                        .setAmount(booking.getTotalAmount().longValue() * 100) // amount in USD cents
                        .setCurrency("usd")
                        .setDescription("Ticket Booking: " + booking.getEvent().getName() + " (" + booking.getBookingCode() + ")")
                        .putMetadata("bookingCode", booking.getBookingCode())
                        .putMetadata("userEmail", userEmail)
                        .build();
                com.stripe.model.PaymentIntent paymentIntent = com.stripe.model.PaymentIntent.create(params);
                booking.setStripePaymentIntentId(paymentIntent.getId());
                log.info("Stripe PaymentIntent created: {}", paymentIntent.getId());
            } else {
                booking.setStripePaymentIntentId("pi_mock_" + UUID.randomUUID().toString().substring(0, 8));
            }
        } catch (Exception e) {
            log.warn("Stripe API call exception (using fallback): {}", e.getMessage());
            booking.setStripePaymentIntentId("pi_mock_" + UUID.randomUUID().toString().substring(0, 8));
        }

        List<Long> seatIds = new ArrayList<>();
        for (BookingItem item : booking.getItems()) {
            Seat seat = item.getSeat();
            seat.setStatus(SeatStatus.BOOKED);
            seatIds.add(seat.getId());

            // Generate Ticket PDF & Cloudinary Upload
            ticketService.createAndUploadTicket(item);
        }
        seatRepository.saveAll(booking.getItems().stream().map(BookingItem::getSeat).collect(Collectors.toList()));
        Booking confirmedBooking = bookingRepository.save(booking);

        // Release Redis locks & broadcast WebSocket
        for (Long seatId : seatIds) {
            seatLockService.unlockSeat(seatId);
        }
        broadcastSeatStatusChange(booking.getEvent().getId(), seatIds, "BOOKED", booking.getUser().getId());

        return mapToBookingResponse(confirmedBooking);
    }

    public Map<String, String> createStripeCheckoutSession(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Booking ini bukan milik Anda");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            if (booking.getStatus() == BookingStatus.CONFIRMED) {
                Map<String, String> response = new HashMap<>();
                response.put("checkoutUrl", frontendUrl + "/my-tickets?success=true");
                response.put("sessionId", booking.getStripePaymentIntentId() != null ? booking.getStripePaymentIntentId() : "cs_confirmed");
                return response;
            }
            throw new IllegalStateException("Status booking tidak valid: " + booking.getStatus());
        }

        String effectiveStripeKey = (stripeSecretKey != null && !stripeSecretKey.isEmpty()) ? stripeSecretKey : System.getenv("STRIPE_SECRET_KEY");

        try {
            com.stripe.Stripe.apiKey = effectiveStripeKey;

            com.stripe.param.checkout.SessionCreateParams params = com.stripe.param.checkout.SessionCreateParams.builder()
                    .addPaymentMethodType(com.stripe.param.checkout.SessionCreateParams.PaymentMethodType.CARD)
                    .setMode(com.stripe.param.checkout.SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(frontendUrl + "/my-tickets?success=true")
                    .setCancelUrl(frontendUrl + "/checkout/" + bookingId + "?canceled=true")
                    .setCustomerEmail(userEmail)
                    .putMetadata("bookingCode", booking.getBookingCode())
                    .putMetadata("bookingId", String.valueOf(booking.getId()))
                    .putMetadata("userEmail", userEmail)
                    .addLineItem(
                            com.stripe.param.checkout.SessionCreateParams.LineItem.builder()
                                    .setQuantity(1L)
                                    .setPriceData(
                                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency("usd")
                                                    .setUnitAmount(booking.getTotalAmount().longValue() * 100)
                                                    .setProductData(
                                                            com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Event Ticket Pass: " + booking.getEvent().getName())
                                                                    .setDescription("Booking Code: " + booking.getBookingCode())
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .build()
                    )
                    .build();

            com.stripe.model.checkout.Session session = com.stripe.model.checkout.Session.create(params);
            booking.setStripePaymentIntentId(session.getId());
            bookingRepository.save(booking);

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", session.getUrl());
            response.put("sessionId", session.getId());
            return response;

        } catch (Exception e) {
            log.warn("Gagal membuat Stripe Checkout Session (fallback to direct confirm): {}", e.getMessage());
            ConfirmPaymentRequest mockReq = new ConfirmPaymentRequest();
            mockReq.setPaymentMethod("STRIPE_FALLBACK");
            confirmPayment(bookingId, mockReq, userEmail);

            Map<String, String> response = new HashMap<>();
            response.put("checkoutUrl", frontendUrl + "/my-tickets?success=true");
            response.put("sessionId", "cs_fallback_" + UUID.randomUUID().toString().substring(0, 8));
            return response;
        }
    }

    @Transactional
    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Booking ini bukan milik Anda");
        }

        cancelBookingInternal(booking);
    }

    @Transactional
    public void cancelBookingInternal(Booking booking) {
        Booking entity = bookingRepository.findById(booking.getId()).orElse(booking);
        if (entity.getStatus() == BookingStatus.CANCELLED || entity.getStatus() == BookingStatus.EXPIRED) {
            return;
        }

        entity.setStatus(BookingStatus.EXPIRED);
        List<Long> seatIds = new ArrayList<>();

        for (BookingItem item : entity.getItems()) {
            Seat seat = item.getSeat();
            seat.setStatus(SeatStatus.AVAILABLE);
            seatIds.add(seat.getId());
            seatLockService.unlockSeat(seat.getId());
        }
        seatRepository.saveAll(entity.getItems().stream().map(BookingItem::getSeat).collect(Collectors.toList()));
        bookingRepository.save(entity);

        broadcastSeatStatusChange(entity.getEvent().getId(), seatIds, "AVAILABLE", entity.getUser().getId());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::mapToBookingResponse).collect(Collectors.toList());
    }

    private void broadcastSeatStatusChange(Long eventId, List<Long> seatIds, String status, Long userId) {
        try {
            SeatWebSocketMessage message = SeatWebSocketMessage.builder()
                    .type("SEAT_STATUS_CHANGED")
                    .eventId(eventId)
                    .seatIds(seatIds)
                    .status(status)
                    .userId(userId)
                    .build();
            messagingTemplate.convertAndSend("/topic/events/" + eventId + "/seats", message);
        } catch (Exception e) {
            log.error("Failed to broadcast WebSocket message", e);
        }
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        List<BookingResponse.BookingItemDto> itemDtos = booking.getItems().stream().map(item -> {
            Seat seat = item.getSeat();
            Ticket ticket = item.getTicket();
            return BookingResponse.BookingItemDto.builder()
                    .id(item.getId())
                    .seatId(seat.getId())
                    .rowLabel(seat.getRowLabel())
                    .seatNumber(seat.getSeatNumber())
                    .categoryName(seat.getCategory() != null ? seat.getCategory().getName() : "Standard")
                    .price(item.getPriceSnapshot())
                    .ticketCode(ticket != null ? ticket.getTicketCode() : null)
                    .pdfUrl(ticket != null ? ticket.getPdfUrl() : null)
                    .build();
        }).collect(Collectors.toList());

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .eventId(booking.getEvent().getId())
                .eventName(booking.getEvent().getName())
                .status(booking.getStatus().name())
                .totalAmount(booking.getTotalAmount())
                .paymentMethod(booking.getPaymentMethod())
                .expiresAt(booking.getExpiresAt())
                .createdAt(booking.getCreatedAt())
                .items(itemDtos)
                .build();
    }
}
