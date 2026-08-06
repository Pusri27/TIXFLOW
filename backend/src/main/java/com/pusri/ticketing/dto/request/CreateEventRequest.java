package com.pusri.ticketing.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEventRequest {
    private String name;
    private String description;
    private String category;
    private String posterUrl;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long venueId;
    private BigDecimal vipPrice;
    private BigDecimal regularPrice;
    private Boolean isQueueEnabled;
    private Boolean dynamicPricingEnabled;
}
