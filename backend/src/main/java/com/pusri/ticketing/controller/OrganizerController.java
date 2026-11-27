package com.pusri.ticketing.controller;

import com.pusri.ticketing.service.AnalyticsService;
import com.pusri.ticketing.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/organizer")
@Slf4j
@RequiredArgsConstructor
public class OrganizerController {

    private final AnalyticsService analyticsService;
    private final TicketService ticketService;

    @GetMapping("/analytics/{eventId}")
    public ResponseEntity<Map<String, Object>> getAnalytics(@PathVariable Long eventId) {
        return ResponseEntity.ok(analyticsService.getEventAnalytics(eventId));
    }

    @PostMapping("/scan-qr")
    public ResponseEntity<Map<String, Object>> scanGatekeeperQr(@RequestBody Map<String, String> request) {
        String qrPayload = request.get("qrPayload");
        try {
            Map<String, Object> result = ticketService.scanAndCheckInTicket(qrPayload);
            if (Boolean.FALSE.equals(result.get("success"))) {
                return ResponseEntity.badRequest().body(result);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.warn("Gate QR validation rejected: {}", e.getMessage());
            Map<String, Object> errorResult = new HashMap<>();
            errorResult.put("success", false);
            errorResult.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResult);
        }
    }
}
