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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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
            log.info("Ticket generated and uploaded successfully: {}", pdfUrl);
        } catch (Exception e) {
            log.error("Failed to generate/upload PDF for ticket {}", ticketCode, e);
            ticket.setPdfUrl("https://res.cloudinary.com/demo/image/upload/sample.pdf?code=" + ticketCode);
            ticket = ticketRepository.save(ticket);
        }

        return ticket;
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketByCode(String ticketCode) {
        Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                .orElseThrow(() -> new IllegalArgumentException("Tiket tidak ditemukan dengan kode: " + ticketCode));

        return mapToTicketResponse(ticket);
    }

    @Transactional
    public List<TicketResponse> getUserTickets(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            List<Booking> pendingBookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                    .stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING && b.getStripePaymentIntentId() != null && b.getStripePaymentIntentId().startsWith("cs_"))
                    .collect(Collectors.toList());

            for (Booking pending : pendingBookings) {
                try {
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
                    log.info("Auto-confirmed pending Stripe booking {} for user {}", pending.getBookingCode(), user.getEmail());
                } catch (Exception e) {
                    log.warn("Failed auto-confirming pending booking {}: {}", pending.getBookingCode(), e.getMessage());
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

        return TicketResponse.builder()
                .id(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .pdfUrl(ticket.getPdfUrl())
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
