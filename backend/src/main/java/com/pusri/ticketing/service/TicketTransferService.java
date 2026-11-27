package com.pusri.ticketing.service;

import com.pusri.ticketing.entity.Ticket;
import com.pusri.ticketing.entity.TicketTransfer;
import com.pusri.ticketing.entity.User;
import com.pusri.ticketing.repository.TicketRepository;
import com.pusri.ticketing.repository.TicketTransferRepository;
import com.pusri.ticketing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class TicketTransferService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final TicketTransferRepository ticketTransferRepository;

    @Transactional
    public void transferTicket(Long ticketId, String fromEmail, String recipientEmail) {
        User fromUser = userRepository.findByEmail(fromEmail)
                .orElseThrow(() -> new IllegalArgumentException("Sender account not found."));

        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new IllegalArgumentException("No Tixflow account found for " + recipientEmail + ". Ask your friend to sign up first."));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found."));

        User currentOwner = ticket.getCurrentOwner() != null
                ? ticket.getCurrentOwner()
                : ticket.getBookingItem().getBooking().getUser();

        if (!currentOwner.getId().equals(fromUser.getId())) {
            throw new IllegalArgumentException("You do not own this ticket.");
        }

        if (Boolean.TRUE.equals(ticket.getIsUsed())) {
            throw new IllegalStateException("Tickets that have already been scanned at the gate cannot be transferred.");
        }

        if (fromUser.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("You cannot transfer a ticket to your own account.");
        }

        ticket.setCurrentOwner(recipient);
        ticketRepository.saveAndFlush(ticket);

        TicketTransfer transfer = TicketTransfer.builder()
                .ticket(ticket)
                .fromUser(fromUser)
                .toUser(recipient)
                .build();
        ticketTransferRepository.save(transfer);

        log.info("Ticket {} transferred from {} to {}", ticket.getTicketCode(), fromEmail, recipientEmail);
    }
}
