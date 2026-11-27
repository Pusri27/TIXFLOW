package com.pusri.ticketing.service;

import com.pusri.ticketing.dto.response.TicketResponse;
import com.pusri.ticketing.entity.*;
import com.pusri.ticketing.repository.BookingRepository;
import com.pusri.ticketing.repository.SeatRepository;
import com.pusri.ticketing.repository.TicketRepository;
import com.pusri.ticketing.repository.UserRepository;
import com.pusri.ticketing.util.PdfTicketGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final SeatLockService seatLockService;
    private final PdfTicketGenerator pdfTicketGenerator;
    private final CloudinaryService cloudinaryService;
    private final DynamicQrService dynamicQrService;

    @Value("${app.stripe.secret-key:}")
    private String stripeSecretKey;

    @Transactional
    public Ticket createAndUploadTicket(BookingItem item) {
        String ticketCode = "TIX-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();

        Ticket ticket = Ticket.builder()
                .bookingItem(item)
                .ticketCode(ticketCode)
                .build();

        ticket = ticketRepository.save(ticket);
        item.setTicket(ticket);

        try {
            byte[] pdfBytes = pdfTicketGenerator.generateTicketPdf(ticket);
            String pdfUrl = cloudinaryService.uploadPdf(pdfBytes, ticketCode);
            ticket.setPdfUrl(pdfUrl);
            ticket = ticketRepository.save(ticket);
            log.info("Ticket generated: {}", ticketCode);
        } catch (Exception e) {
            log.warn("PDF pre-upload skipped for {} (served dynamically via /api/tickets/{}/pdf)", ticketCode, ticketCode);
        }

        return ticket;
    }

    @Transactional(readOnly = true)
    public byte[] generateTicketPdfByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketCode));
        try {
            return pdfTicketGenerator.generateTicketPdf(ticket);
        } catch (Exception e) {
            log.error("Failed to render PDF for {}", ticketCode, e);
            throw new IllegalStateException("Unable to generate ticket PDF right now.");
        }
    }

    @Transactional
    public Map<String, Object> scanAndCheckInTicket(String qrPayload) {
        Map<String, Object> result = new HashMap<>();
        String ticketCode = dynamicQrService.validateDynamicQrPayload(qrPayload);
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new IllegalArgumentException("Ticket code " + ticketCode + " was not found."));

        if (Boolean.TRUE.equals(ticket.getIsUsed())) {
            String formattedUsedAt = ticket.getUsedAt() != null
                    ? ticket.getUsedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss"))
                    : "earlier";
            result.put("success", false);
            result.put("message", "Ticket already checked in at " + formattedUsedAt + ".");
            result.put("ticketCode", ticketCode);
            return result;
        }

        ticket.setIsUsed(true);
        ticket.setUsedAt(LocalDateTime.now());
        ticketRepository.save(ticket);

        var item = ticket.getBookingItem();
        var booking = item.getBooking();
        var owner = ticket.getCurrentOwner() != null ? ticket.getCurrentOwner() : booking.getUser();
        var seat = item.getSeat();

        result.put("success", true);
        result.put("message", "Valid Ticket — Guest Checked In");
        result.put("ticketCode", ticketCode);
        result.put("attendeeName", owner.getName());
        result.put("seatInfo", "Row " + seat.getRowLabel() + " · Seat #" + seat.getSeatNumber());
        result.put("eventName", booking.getEvent().getName());

        log.info("Gate check-in succeeded for {} ({})", ticketCode, owner.getName());
        return result;
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketCode));

        return mapToTicketResponse(ticket);
    }

    @Transactional
    public List<TicketResponse> getUserTickets(Long userId, boolean reconcileStripeSuccess) {
        if (reconcileStripeSuccess) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                List<Booking> pendingBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                        .stream()
                        .filter(b -> b.getStatus() == BookingStatus.PENDING
                                && b.getStripePaymentIntentId() != null
                                && b.getStripePaymentIntentId().startsWith("cs_"))
                        .collect(Collectors.toList());

                for (Booking pending : pendingBookings) {
                    try {
                        boolean paidConfirmed = true;
                        String effectiveKey = (stripeSecretKey != null && !stripeSecretKey.isEmpty())
                                ? stripeSecretKey
                                : System.getenv("STRIPE_SECRET_KEY");
                        if (effectiveKey != null && !effectiveKey.isEmpty() && !effectiveKey.startsWith("sk_test_mock")
                                && !pending.getStripePaymentIntentId().startsWith("cs_fallback_")) {
                            try {
                                com.stripe.Stripe.apiKey = effectiveKey;
                                com.stripe.model.checkout.Session session =
                                        com.stripe.model.checkout.Session.retrieve(pending.getStripePaymentIntentId());
                                paidConfirmed = "paid".equalsIgnoreCase(session.getPaymentStatus());
                            } catch (Exception stripeEx) {
                                log.warn("Stripe session verify fallback for {}: {}", pending.getBookingCode(), stripeEx.getMessage());
                            }
                        }

                        if (!paidConfirmed) {
                            continue;
                        }

                        pending.setStatus(BookingStatus.CONFIRMED);
                        pending.setPaymentMethod("STRIPE");

                        List<Long> seatIds = new ArrayList<>();
                        for (BookingItem item : pending.getItems()) {
                            Seat seat = item.getSeat();
                            seat.setStatus(SeatStatus.BOOKED);
                            seatIds.add(seat.getId());

                            if (item.getTicket() == null) {
                                createAndUploadTicket(item);
                            }
                        }
                        seatRepository.saveAll(pending.getItems().stream().map(BookingItem::getSeat).collect(Collectors.toList()));
                        bookingRepository.save(pending);

                        for (Long seatId : seatIds) {
                            seatLockService.unlockSeat(seatId);
                        }
                        log.info("Confirmed Stripe booking {} for {}", pending.getBookingCode(), user.getEmail());
                    } catch (Exception e) {
                        log.warn("Failed reconciling booking {}: {}", pending.getBookingCode(), e.getMessage());
                    }
                }
            }
        }

        return ticketRepository.findByUserId(userId).stream()
                .map(this::mapToTicketResponse)
                .collect(Collectors.toList());
    }

    private TicketResponse mapToTicketResponse(Ticket ticket) {
        var item = ticket.getBookingItem();
        var booking = item.getBooking();
        var event = booking.getEvent();
        var venue = event.getVenue();
        var seat = item.getSeat();
        var owner = ticket.getCurrentOwner() != null ? ticket.getCurrentOwner() : booking.getUser();

        // Always serve crisp, up-to-date PDF directly from our API endpoint
        String livePdfPath = "/tickets/" + ticket.getTicketCode() + "/pdf";

        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .pdfUrl(livePdfPath)
                .issuedAt(ticket.getIssuedAt())
                .eventName(event.getName())
                .venueName(venue != null ? venue.getName() : "N/A")
                .venueAddress(venue != null ? venue.getAddress() + ", " + venue.getCity() : "N/A")
                .eventStartTime(event.getStartTime())
                .rowLabel(seat.getRowLabel())
                .seatNumber(seat.getSeatNumber())
                .categoryName(seat.getCategory() != null ? seat.getCategory().getName() : "Standard")
                .price(item.getPriceSnapshot())
                .userName(owner.getName())
                .userEmail(owner.getEmail())
                .isUsed(Boolean.TRUE.equals(ticket.getIsUsed()))
                .usedAt(ticket.getUsedAt())
                .build();
    }
}
