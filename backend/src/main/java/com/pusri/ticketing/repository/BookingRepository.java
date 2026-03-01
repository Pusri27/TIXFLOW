package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.Booking;
import com.pusri.ticketing.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingCode(String bookingCode);

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.expiresAt < :now")
    List<Booking> findExpiredBookings(@Param("status") BookingStatus status, @Param("now") LocalDateTime now);
}
