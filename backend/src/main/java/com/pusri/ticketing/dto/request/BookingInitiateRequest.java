package com.pusri.ticketing.dto.request;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class BookingInitiateRequest {

    @NotNull(message = "Event ID is required.")
    private Long eventId;

    @NotEmpty(message = "Please select at least one seat.")
    private List<Long> seatIds;
}
