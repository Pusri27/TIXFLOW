package com.pusri.ticketing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private Long id;
    private String bookingCode;
    private Long eventId;
    private String eventName;
    private String status;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
    private List<BookingItemDto> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BookingItemDto {
        private Long id;
        private Long seatId;
        private String rowLabel;
        private Integer seatNumber;
        private String categoryName;
        private BigDecimal price;
        private String ticketCode;
        private String pdfUrl;
    }
}
