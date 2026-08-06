package com.pusri.ticketing.controller;

import com.pusri.ticketing.entity.User;
import com.pusri.ticketing.repository.UserRepository;
import com.pusri.ticketing.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;
    private final UserRepository userRepository;

    @PostMapping("/join/{eventId}")
    public ResponseEntity<Map<String, Object>> joinQueue(@PathVariable Long eventId, Authentication authentication) {
        User user = getUser(authentication);
        Map<String, Object> status = queueService.joinQueue(eventId, user.getId());
        return ResponseEntity.ok(status);
    }

    @GetMapping("/status/{eventId}")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable Long eventId, Authentication authentication) {
        User user = getUser(authentication);
        Map<String, Object> status = queueService.getQueueStatus(eventId, user.getId());
        return ResponseEntity.ok(status);
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));
    }
}
