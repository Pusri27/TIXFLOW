package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.Booking;
import com.pusri.ticketing.entity.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Override
    @EntityGraph(attributePaths = {"user", "event"})
    Optional<Booking> findById(Long id);

    @EntityGraph(attributePaths = {"user", "event"})
    Optional<Booking> findByBookingCode(String bookingCode);

    @EntityGraph(attributePaths = {"user", "event"})
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByEventId(Long eventId);

    @Query("SELECT DISTINCT b FROM Booking b JOIN FETCH b.user JOIN FETCH b.event LEFT JOIN FETCH b.items bi LEFT JOIN FETCH bi.seat WHERE b.status = :status AND b.expiresAt < :now")
    List<Booking> findExpiredBookings(@Param("status") BookingStatus status, @Param("now") LocalDateTime now);
}
