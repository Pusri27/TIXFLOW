package com.pusri.ticketing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String posterUrl;
    private String status;
    private VenueDto venue;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VenueDto {
        private Long id;
        private String name;
        private String address;
        private String city;
        private Integer totalCapacity;
    }
}
