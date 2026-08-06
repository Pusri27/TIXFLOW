package com.pusri.ticketing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatMapResponse {

    private Long eventId;
    private String eventName;
    private List<CategoryDto> categories;
    private List<SeatDto> seats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDto {
        private Long id;
        private String name;
        private BigDecimal price;
        private String colorCode;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SeatDto {
        private Long id;
        private Long categoryId;
        private String rowLabel;
        private Integer seatNumber;
        private String status; // AVAILABLE, HELD, BOOKED, DISABLED
        private Boolean isLocked;
    }
}
