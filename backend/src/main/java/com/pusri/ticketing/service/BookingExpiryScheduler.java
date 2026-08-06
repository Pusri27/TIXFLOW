package com.pusri.ticketing.service;

import com.pusri.ticketing.entity.Booking;
import com.pusri.ticketing.entity.BookingStatus;
import com.pusri.ticketing.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class BookingExpiryScheduler {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    // Run every 1 minute
    @Scheduled(fixedRate = 60000)
    public void cleanupExpiredBookings() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(BookingStatus.PENDING, now);

        if (!expiredBookings.isEmpty()) {
            log.info("Found {} expired pending bookings. Cleaning up...", expiredBookings.size());
            for (Booking booking : expiredBookings) {
                try {
                    bookingService.cancelBookingInternal(booking);
                    log.info("Booking {} successfully expired and seats released.", booking.getBookingCode());
                } catch (Exception e) {
                    log.error("Failed to expire booking {}", booking.getBookingCode(), e);
                }
            }
        }
    }
}
