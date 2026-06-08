package com.pusri.ticketing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponse {

    private Long id;
    private String ticketCode;
    private String pdfUrl;
    private LocalDateTime issuedAt;

    private String eventName;
    private String venueName;
    private String venueAddress;
    private LocalDateTime eventStartTime;
    private String rowLabel;
    private Integer seatNumber;
    private String categoryName;
    private BigDecimal price;
    private String userName;
    private String userEmail;

    private Boolean isUsed;
    private LocalDateTime usedAt;
}
