package com.pusri.ticketing.controller;

import com.pusri.ticketing.entity.Ticket;
import com.pusri.ticketing.repository.TicketRepository;
import com.pusri.ticketing.service.AnalyticsService;
import com.pusri.ticketing.service.DynamicQrService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/organizer")
@Slf4j
@RequiredArgsConstructor
public class OrganizerController {

    private final AnalyticsService analyticsService;
    private final DynamicQrService dynamicQrService;
    private final TicketRepository ticketRepository;

    @GetMapping("/analytics/{eventId}")
    public ResponseEntity<Map<String, Object>> getAnalytics(@PathVariable Long eventId) {
        return ResponseEntity.ok(analyticsService.getEventAnalytics(eventId));
    }

    @PostMapping("/scan-qr")
    public ResponseEntity<Map<String, Object>> scanGatekeeperQr(@RequestBody Map<String, String> request) {
        String qrPayload = request.get("qrPayload");
        Map<String, Object> result = new HashMap<>();

        try {
            String ticketCode = dynamicQrService.validateDynamicQrPayload(qrPayload);
            Ticket ticket = ticketRepository.findByTicketCode(ticketCode)
                    .orElseThrow(() -> new IllegalArgumentException("Kode Tiket " + ticketCode + " tidak ditemukan di sistem!"));

            if (Boolean.TRUE.equals(ticket.getIsUsed())) {
                result.put("success", false);
                result.put("message", "TIKET SUDAH DIGUNAKAN! Di-scan pada: " + ticket.getUsedAt());
                result.put("ticketCode", ticketCode);
                return ResponseEntity.badRequest().body(result);
            }

            ticket.setIsUsed(true);
            ticket.setUsedAt(LocalDateTime.now());
            ticketRepository.save(ticket);

            String attendeeName = ticket.getCurrentOwner() != null ? ticket.getCurrentOwner().getName() : ticket.getBookingItem().getBooking().getUser().getName();
            String seatInfo = ticket.getBookingItem().getSeat().getRowLabel() + "-" + ticket.getBookingItem().getSeat().getSeatNumber();

            result.put("success", true);
            result.put("message", "CHECK-IN BERHASIL! Tiket valid.");
            result.put("ticketCode", ticketCode);
            result.put("attendeeName", attendeeName);
            result.put("seatInfo", seatInfo);
            result.put("eventName", ticket.getBookingItem().getBooking().getEvent().getName());

            log.info("Check-in Gatekeeper berhasil untuk Tiket {} ({})", ticketCode, attendeeName);
            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.warn("Gagal validasi QR Gatekeeper: {}", e.getMessage());
            result.put("success", false);
            result.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(result);
        }
    }
}
