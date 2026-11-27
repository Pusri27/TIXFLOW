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
        Long userId = resolveUserId(authentication);
        Map<String, Object> status = queueService.joinQueue(eventId, userId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/status/{eventId}")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable Long eventId, Authentication authentication) {
        Long userId = resolveUserId(authentication);
        Map<String, Object> status = queueService.getQueueStatus(eventId, userId);
        return ResponseEntity.ok(status);
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || "anonymousUser".equals(authentication.getName())) {
            return 999999L;
        }
        return userRepository.findByEmail(authentication.getName())
                .map(User::getId)
                .orElse(999999L);
    }
}
