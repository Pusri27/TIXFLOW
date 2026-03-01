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

    Optional<Ticket> findByTicketCode(String ticketCode);

    @Query("SELECT t FROM Ticket t JOIN t.bookingItem bi JOIN bi.booking b WHERE (t.currentOwner.id = :userId) OR (t.currentOwner IS NULL AND b.user.id = :userId) ORDER BY t.issuedAt DESC")
    List<Ticket> findByUserId(@Param("userId") Long userId);
}

