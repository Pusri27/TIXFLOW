package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    @Query("SELECT t FROM Ticket t " +
           "LEFT JOIN FETCH t.currentOwner co " +
           "JOIN FETCH t.bookingItem bi " +
           "JOIN FETCH bi.booking b " +
           "JOIN FETCH b.user bu " +
           "JOIN FETCH b.event e " +
           "LEFT JOIN FETCH e.venue " +
           "JOIN FETCH bi.seat s " +
           "LEFT JOIN FETCH s.category " +
           "WHERE t.ticketCode = :ticketCode")
    Optional<Ticket> findByTicketCode(@Param("ticketCode") String ticketCode);

    @Query("SELECT DISTINCT t FROM Ticket t " +
           "LEFT JOIN FETCH t.currentOwner co " +
           "JOIN FETCH t.bookingItem bi " +
           "JOIN FETCH bi.booking b " +
           "JOIN FETCH b.user bu " +
           "JOIN FETCH b.event e " +
           "LEFT JOIN FETCH e.venue " +
           "JOIN FETCH bi.seat s " +
           "LEFT JOIN FETCH s.category " +
           "WHERE (co IS NOT NULL AND co.id = :userId) OR (co IS NULL AND bu.id = :userId) " +
           "ORDER BY t.issuedAt DESC")
    List<Ticket> findByUserId(@Param("userId") Long userId);
}
