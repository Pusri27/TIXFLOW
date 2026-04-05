package com.pusri.ticketing.controller;

import com.pusri.ticketing.dto.request.BookingInitiateRequest;
import com.pusri.ticketing.dto.request.ConfirmPaymentRequest;
import com.pusri.ticketing.dto.response.BookingResponse;
import com.pusri.ticketing.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/initiate")
    public ResponseEntity<BookingResponse> initiateBooking(
            @Valid @RequestBody BookingInitiateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.initiateBooking(request, userDetails.getUsername()));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingResponse> confirmPayment(
            @PathVariable Long id,
            @RequestBody ConfirmPaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.confirmPayment(id, request, userDetails.getUsername()));
    }

    @PostMapping("/{id}/create-checkout-session")
    public ResponseEntity<java.util.Map<String, String>> createCheckoutSession(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.createStripeCheckoutSession(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        bookingService.cancelBooking(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookingService.getUserBookings(userDetails.getUsername()));
    }
}
