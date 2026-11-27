package com.pusri.ticketing.dto.request;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class ConfirmPaymentRequest {

    @NotBlank(message = "Payment method is required.")
    private String paymentMethod = "STRIPE";

    private String stripePaymentIntentId;
}
