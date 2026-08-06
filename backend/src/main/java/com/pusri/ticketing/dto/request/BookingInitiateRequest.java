package com.pusri.ticketing.dto.request;

import lombok.Data;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class BookingInitiateRequest {

    @NotNull(message = "Event ID wajib diisi")
    private Long eventId;

    @NotEmpty(message = "Pilih minimal 1 kursi")
    private List<Long> seatIds;
}
