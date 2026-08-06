package com.pusri.ticketing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatWebSocketMessage {

    private String type; // SEAT_LOCKED, SEAT_RELEASED, SEAT_BOOKED
    private Long eventId;
    private List<Long> seatIds;
    private String status;
    private Long userId;
}
