package com.pusri.ticketing.controller;

import com.pusri.ticketing.dto.response.EventResponse;
import com.pusri.ticketing.dto.response.SeatMapResponse;
import com.pusri.ticketing.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(eventService.getAllEvents(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<SeatMapResponse> getSeatMap(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getSeatMap(id));
    }
}
