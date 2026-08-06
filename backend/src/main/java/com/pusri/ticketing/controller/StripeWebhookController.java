package com.pusri.ticketing.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pusri.ticketing.dto.request.ConfirmPaymentRequest;
import com.pusri.ticketing.entity.Booking;
import com.pusri.ticketing.entity.BookingStatus;
import com.pusri.ticketing.repository.BookingRepository;
import com.pusri.ticketing.service.BookingService;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@RequiredArgsConstructor
public class StripeWebhookController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.stripe.webhook-secret:whsec_mock_secret}")
    private String endpointSecret;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String sigHeader) {

        log.info("Stripe Webhook received payload length: {}", payload.length());

        // Perform signature verification if real Stripe webhook secret and sigHeader are provided
        if (endpointSecret != null && !endpointSecret.startsWith("whsec_mock") && sigHeader != null) {
            try {
                Webhook.constructEvent(payload, sigHeader, endpointSecret);
                log.info("Stripe Webhook signature verified successfully.");
            } catch (Exception e) {
                log.error("Stripe Webhook signature verification failed: {}", e.getMessage());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid Stripe signature: " + e.getMessage());
            }
        } else {
            log.info("Processing Stripe Webhook in mock/development mode.");
        }

        try {
            JsonNode rootNode = objectMapper.readTree(payload);
            String eventType = rootNode.path("type").asText("");
            log.info("Stripe Event Type: {}", eventType);

            if ("checkout.session.completed".equals(eventType) || "payment_intent.succeeded".equals(eventType)) {
                JsonNode dataObject = rootNode.path("data").path("object");
                JsonNode metadata = dataObject.path("metadata");

                String bookingCode = metadata.path("bookingCode").asText(null);
                String userEmail = metadata.path("userEmail").asText(null);
                String stripeId = dataObject.path("id").asText("pi_stripe_webhook");

                if (bookingCode != null && !bookingCode.isEmpty() && !"null".equals(bookingCode)) {
                    Optional<Booking> bookingOpt = bookingRepository.findByBookingCode(bookingCode);
                    if (bookingOpt.isPresent()) {
                        Booking booking = bookingOpt.get();
                        if (booking.getStatus() == BookingStatus.PENDING) {
                            ConfirmPaymentRequest req = new ConfirmPaymentRequest();
                            req.setPaymentMethod("STRIPE");
                            req.setStripePaymentIntentId(stripeId);

                            bookingService.confirmPayment(booking.getId(), req, userEmail != null ? userEmail : booking.getUser().getEmail());
                            log.info("Booking {} successfully confirmed via Stripe Webhook!", bookingCode);
                        } else {
                            log.info("Booking {} was already confirmed.", bookingCode);
                        }
                    } else {
                        log.warn("Booking not found for code: {}", bookingCode);
                    }
                } else {
                    log.warn("Metadata bookingCode missing in event {}", eventType);
                }
            }
        } catch (Exception e) {
            log.error("Error processing Stripe Webhook payload: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Failed to parse webhook payload");
        }

        return ResponseEntity.ok("Webhook processed");
    }
}

