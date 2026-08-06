package com.pusri.ticketing.service;

import com.pusri.ticketing.entity.*;
import com.pusri.ticketing.repository.BookingRepository;
import com.pusri.ticketing.repository.EventRepository;
import com.pusri.ticketing.repository.SeatRepository;
import com.pusri.ticketing.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getEventAnalytics(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event tidak ditemukan"));

        List<Seat> seats = seatRepository.findByEventIdOrderByRowLabelAscSeatNumberAsc(eventId);
        long totalSeats = seats.size();
        long bookedSeats = seats.stream().filter(s -> s.getStatus() == SeatStatus.BOOKED).count();
        long heldSeats = seats.stream().filter(s -> s.getStatus() == SeatStatus.HELD).count();
        long availableSeats = seats.stream().filter(s -> s.getStatus() == SeatStatus.AVAILABLE).count();

        double occupancyRate = totalSeats > 0 ? ((double) bookedSeats / totalSeats) * 100.0 : 0.0;

        List<Ticket> tickets = ticketRepository.findAll();
        long totalTicketsIssued = 0;
        long totalCheckedIn = 0;

        for (Ticket ticket : tickets) {
            if (ticket.getBookingItem() != null && ticket.getBookingItem().getBooking().getEvent().getId().equals(eventId)) {
                totalTicketsIssued++;
                if (Boolean.TRUE.equals(ticket.getIsUsed())) {
                    totalCheckedIn++;
                }
            }
        }

        BigDecimal totalRevenue = seats.stream()
                .filter(s -> s.getStatus() == SeatStatus.BOOKED && s.getCategory() != null)
                .map(s -> s.getCategory().getPrice())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("eventId", event.getId());
        stats.put("eventName", event.getName());
        stats.put("totalCapacity", totalSeats);
        stats.put("bookedSeats", bookedSeats);
        stats.put("heldSeats", heldSeats);
        stats.put("availableSeats", availableSeats);
        stats.put("occupancyRatePercent", Math.round(occupancyRate * 10.0) / 10.0);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalTicketsIssued", totalTicketsIssued);
        stats.put("totalCheckedIn", totalCheckedIn);

        return stats;
    }
}
