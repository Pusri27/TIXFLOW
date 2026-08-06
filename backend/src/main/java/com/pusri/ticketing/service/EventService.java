package com.pusri.ticketing.service;

import com.pusri.ticketing.dto.response.EventResponse;
import com.pusri.ticketing.dto.response.SeatMapResponse;
import com.pusri.ticketing.entity.Event;
import com.pusri.ticketing.entity.EventCategory;
import com.pusri.ticketing.entity.Seat;
import com.pusri.ticketing.repository.EventRepository;
import com.pusri.ticketing.repository.SeatRepository;
import com.pusri.ticketing.repository.SeatCategoryRepository;
import com.pusri.ticketing.repository.VenueRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final SeatLockService seatLockService;
    private final VenueRepository venueRepository;
    private final SeatCategoryRepository seatCategoryRepository;

    @Transactional(readOnly = true)
    public List<EventResponse> getAllEvents(String category) {
        List<Event> events;
        if (category != null && !category.isEmpty()) {
            try {
                EventCategory cat = EventCategory.valueOf(category.toUpperCase());
                events = eventRepository.findByCategory(cat);
            } catch (Exception e) {
                events = eventRepository.findAll();
            }
        } else {
            events = eventRepository.findAll();
        }

        return events.stream().map(this::mapToEventResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event tidak ditemukan dengan ID: " + id));
        return mapToEventResponse(event);
    }

    @Transactional(readOnly = true)
    public SeatMapResponse getSeatMap(Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Event tidak ditemukan dengan ID: " + eventId));

        List<Seat> seats = seatRepository.findByEventIdOrderByRowLabelAscSeatNumberAsc(eventId);

        List<SeatMapResponse.CategoryDto> categories = seats.stream()
                .filter(s -> s.getCategory() != null)
                .map(Seat::getCategory)
                .distinct()
                .map(c -> SeatMapResponse.CategoryDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .price(c.getPrice())
                        .colorCode(c.getColorCode())
                        .build())
                .collect(Collectors.toList());

        List<SeatMapResponse.SeatDto> seatDtos = seats.stream().map(s -> SeatMapResponse.SeatDto.builder()
                .id(s.getId())
                .categoryId(s.getCategory() != null ? s.getCategory().getId() : null)
                .rowLabel(s.getRowLabel())
                .seatNumber(s.getSeatNumber())
                .status(s.getStatus().name())
                .isLocked(seatLockService.isSeatLocked(s.getId()))
                .build()
        ).collect(Collectors.toList());

        return SeatMapResponse.builder()
                .eventId(event.getId())
                .eventName(event.getName())
                .categories(categories)
                .seats(seatDtos)
                .build();
    }

    @Transactional
    public EventResponse createEvent(com.pusri.ticketing.dto.request.CreateEventRequest req) {
        com.pusri.ticketing.entity.Venue venue = null;
        if (req.getVenueId() != null) {
            venue = venueRepository.findById(req.getVenueId()).orElse(null);
        }
        if (venue == null) {
            venue = venueRepository.findAll().stream().findFirst().orElse(null);
        }

        EventCategory cat = EventCategory.CONCERT;
        try {
            if (req.getCategory() != null) cat = EventCategory.valueOf(req.getCategory().toUpperCase());
        } catch (Exception ignored) {}

        Event event = Event.builder()
                .name(req.getName())
                .description(req.getDescription())
                .category(cat)
                .posterUrl(req.getPosterUrl() != null && !req.getPosterUrl().isEmpty() ? req.getPosterUrl() : "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80")
                .startTime(req.getStartTime() != null ? req.getStartTime() : java.time.LocalDateTime.now().plusDays(7))
                .endTime(req.getEndTime() != null ? req.getEndTime() : java.time.LocalDateTime.now().plusDays(7).plusHours(3))
                .status(com.pusri.ticketing.entity.EventStatus.UPCOMING)
                .venue(venue)
                .isQueueEnabled(req.getIsQueueEnabled() != null ? req.getIsQueueEnabled() : true)
                .dynamicPricingEnabled(req.getDynamicPricingEnabled() != null ? req.getDynamicPricingEnabled() : false)
                .build();

        Event saved = eventRepository.save(event);

        // Auto-generate VIP and Regular Seat Categories
        com.pusri.ticketing.entity.SeatCategory vipCat = seatCategoryRepository.save(
                com.pusri.ticketing.entity.SeatCategory.builder()
                        .event(saved)
                        .name("VIP Tier")
                        .price(req.getVipPrice() != null ? req.getVipPrice() : new java.math.BigDecimal("1500000.00"))
                        .colorCode("#EF4444")
                        .build()
        );

        com.pusri.ticketing.entity.SeatCategory regCat = seatCategoryRepository.save(
                com.pusri.ticketing.entity.SeatCategory.builder()
                        .event(saved)
                        .name("Regular Tier")
                        .price(req.getRegularPrice() != null ? req.getRegularPrice() : new java.math.BigDecimal("750000.00"))
                        .colorCode("#3B82F6")
                        .build()
        );

        // Auto-generate 24 seats (Rows A, B for VIP; Rows C, D for Regular)
        String[] rows = {"A", "B", "C", "D"};
        for (String row : rows) {
            com.pusri.ticketing.entity.SeatCategory category = (row.equals("A") || row.equals("B")) ? vipCat : regCat;
            for (int num = 1; num <= 6; num++) {
                seatRepository.save(
                        Seat.builder()
                                .event(saved)
                                .category(category)
                                .rowLabel(row)
                                .seatNumber(num)
                                .status(com.pusri.ticketing.entity.SeatStatus.AVAILABLE)
                                .build()
                );
            }
        }

        return mapToEventResponse(saved);
    }

    @Transactional
    public EventResponse updateEvent(Long id, com.pusri.ticketing.dto.request.CreateEventRequest req) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event tidak ditemukan dengan ID: " + id));

        if (req.getName() != null && !req.getName().isEmpty()) event.setName(req.getName());
        if (req.getDescription() != null) event.setDescription(req.getDescription());
        if (req.getPosterUrl() != null && !req.getPosterUrl().isEmpty()) event.setPosterUrl(req.getPosterUrl());
        if (req.getStartTime() != null) event.setStartTime(req.getStartTime());
        if (req.getEndTime() != null) event.setEndTime(req.getEndTime());
        if (req.getCategory() != null) {
            try {
                event.setCategory(EventCategory.valueOf(req.getCategory().toUpperCase()));
            } catch (Exception ignored) {}
        }
        if (req.getIsQueueEnabled() != null) event.setIsQueueEnabled(req.getIsQueueEnabled());
        if (req.getDynamicPricingEnabled() != null) event.setDynamicPricingEnabled(req.getDynamicPricingEnabled());

        Event saved = eventRepository.save(event);
        return mapToEventResponse(saved);
    }

    @Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event tidak ditemukan dengan ID: " + id));

        List<Seat> seats = seatRepository.findByEventIdOrderByRowLabelAscSeatNumberAsc(id);
        seatRepository.deleteAll(seats);

        List<com.pusri.ticketing.entity.SeatCategory> categories = seatCategoryRepository.findByEventId(id);
        seatCategoryRepository.deleteAll(categories);

        eventRepository.delete(event);
    }

    private EventResponse mapToEventResponse(Event event) {
        EventResponse.VenueDto venueDto = null;
        if (event.getVenue() != null) {
            venueDto = EventResponse.VenueDto.builder()
                    .id(event.getVenue().getId())
                    .name(event.getVenue().getName())
                    .address(event.getVenue().getAddress())
                    .city(event.getVenue().getCity())
                    .totalCapacity(event.getVenue().getTotalCapacity())
                    .build();
        }

        return EventResponse.builder()
                .id(event.getId())
                .name(event.getName())
                .description(event.getDescription())
                .category(event.getCategory().name())
                .startTime(event.getStartTime())
                .endTime(event.getEndTime())
                .posterUrl(event.getPosterUrl())
                .status(event.getStatus().name())
                .venue(venueDto)
                .build();
    }
}
