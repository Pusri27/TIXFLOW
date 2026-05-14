package com.pusri.ticketing.controller;

import com.pusri.ticketing.dto.response.TicketResponse;
import com.pusri.ticketing.entity.User;
import com.pusri.ticketing.repository.UserRepository;
import com.pusri.ticketing.service.DynamicQrService;
import com.pusri.ticketing.service.TicketService;
import com.pusri.ticketing.service.TicketTransferService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;
    private final UserRepository userRepository;
    private final DynamicQrService dynamicQrService;
    private final TicketTransferService ticketTransferService;

    @GetMapping("/my")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
        return ResponseEntity.ok(ticketService.getUserTickets(user.getId()));
    }

    @GetMapping("/{code}")
    public ResponseEntity<TicketResponse> getTicketByCode(@PathVariable String code) {
        return ResponseEntity.ok(ticketService.getTicketByCode(code));
    }

    @GetMapping("/{code}/dynamic-qr")
    public ResponseEntity<Map<String, String>> getDynamicQr(@PathVariable String code) {
        String dynamicPayload = dynamicQrService.generateDynamicQrPayload(code);
        Map<String, String> response = new HashMap<>();
        response.put("ticketCode", code);
        response.put("qrPayload", dynamicPayload);
        response.put("refreshIntervalSeconds", "30");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<Map<String, String>> transferTicket(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String recipientEmail = request.get("recipientEmail");
        ticketTransferService.transferTicket(id, userDetails.getUsername(), recipientEmail);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Tiket berhasil ditransfer ke " + recipientEmail);
        return ResponseEntity.ok(response);
    }
}
