package com.pusri.ticketing.controller;

import com.pusri.ticketing.dto.response.SeatWebSocketMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class SeatWebSocketController {

    @MessageMapping("/seats/{eventId}/select")
    @SendTo("/topic/events/{eventId}/seats")
    public SeatWebSocketMessage handleSeatSelection(
            @DestinationVariable Long eventId,
            SeatWebSocketMessage message) {
        log.info("WebSocket seat selection update for event {}: {}", eventId, message);
        return message;
    }
}
