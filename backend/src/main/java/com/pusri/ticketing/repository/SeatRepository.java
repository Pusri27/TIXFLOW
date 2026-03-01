package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.Seat;
import com.pusri.ticketing.entity.SeatStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import javax.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEventIdOrderByRowLabelAscSeatNumberAsc(Long eventId);

    // Pessimistic Write Lock for Race Condition Prevention
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id = :id AND s.status = :status")
    Optional<Seat> findByIdAndStatusForUpdate(@Param("id") Long id, @Param("status") SeatStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Seat s WHERE s.id IN :ids")
    List<Seat> findAllByIdsForUpdate(@Param("ids") List<Long> ids);
}
