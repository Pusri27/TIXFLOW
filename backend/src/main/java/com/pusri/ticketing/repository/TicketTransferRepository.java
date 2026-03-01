package com.pusri.ticketing.repository;

import com.pusri.ticketing.entity.TicketTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketTransferRepository extends JpaRepository<TicketTransfer, Long> {
    List<TicketTransfer> findByTicketIdOrderByTransferredAtDesc(Long ticketId);
}
