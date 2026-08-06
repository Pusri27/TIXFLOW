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
                .orElseThrow(() -> new IllegalArgumentException("User pengirim tidak ditemukan"));

        User recipient = userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new IllegalArgumentException("User penerima dengan email " + recipientEmail + " tidak ditemukan!"));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Tiket tidak ditemukan"));

        User currentOwner = ticket.getCurrentOwner() != null ? ticket.getCurrentOwner() : ticket.getBookingItem().getBooking().getUser();

        if (!currentOwner.getId().equals(fromUser.getId())) {
            throw new IllegalArgumentException("Anda bukan pemilik sah dari tiket ini!");
        }

        if (Boolean.TRUE.equals(ticket.getIsUsed())) {
            throw new IllegalStateException("Tiket yang sudah discan/digunakan tidak dapat ditransfer!");
        }

        if (fromUser.getId().equals(recipient.getId())) {
            throw new IllegalArgumentException("Tidak dapat mentransfer tiket ke akun Anda sendiri");
        }

        // Update ownership
        ticket.setCurrentOwner(recipient);
        ticketRepository.save(ticket);

        // Audit Log
        TicketTransfer transfer = TicketTransfer.builder()
                .ticket(ticket)
                .fromUser(fromUser)
                .toUser(recipient)
                .build();
        ticketTransferRepository.save(transfer);

        log.info("Tiket {} berhasil ditransfer dari {} ke {}", ticket.getTicketCode(), fromEmail, recipientEmail);
    }
}
