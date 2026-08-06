package com.pusri.ticketing.service;

import com.pusri.ticketing.dto.request.BookingInitiateRequest;
import com.pusri.ticketing.dto.request.ConfirmPaymentRequest;
import com.pusri.ticketing.dto.response.BookingResponse;
import com.pusri.ticketing.entity.*;
import com.pusri.ticketing.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock private BookingRepository bookingRepository;
    @Mock private SeatRepository seatRepository;
    @Mock private UserRepository userRepository;
    @Mock private EventRepository eventRepository;
    @Mock private TicketRepository ticketRepository;
    @Mock private SeatLockService seatLockService;
    @Mock private TicketService ticketService;
    @Mock private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private BookingService bookingService;

    private User sampleUser;
    private Event sampleEvent;
    private Seat sampleSeat;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .name("Test User")
                .build();

        sampleEvent = Event.builder()
                .id(10L)
                .name("Konser Musik")
                .build();

        SeatCategory cat = SeatCategory.builder()
                .id(100L)
                .name("VIP")
                .price(BigDecimal.valueOf(150000))
                .build();

        sampleSeat = Seat.builder()
                .id(1000L)
                .rowLabel("A")
                .seatNumber(1)
                .status(SeatStatus.AVAILABLE)
                .category(cat)
                .event(sampleEvent)
                .build();
    }

    @Test
    void initiateBooking_Success() {
        BookingInitiateRequest req = new BookingInitiateRequest();
        req.setEventId(10L);
        req.setSeatIds(Collections.singletonList(1000L));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(sampleEvent));
        when(seatLockService.tryLockSeat(1000L, 1L)).thenReturn(true);
        when(seatRepository.findAllByIdsForUpdate(Collections.singletonList(1000L)))
                .thenReturn(Collections.singletonList(sampleSeat));

        Booking savedBooking = Booking.builder()
                .id(50L)
                .bookingCode("BOOK-TEST1234")
                .user(sampleUser)
                .event(sampleEvent)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(150000))
                .paymentMethod("STRIPE")
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .items(new ArrayList<>())
                .build();

        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        BookingResponse response = bookingService.initiateBooking(req, "test@example.com");

        assertNotNull(response);
        assertEquals("BOOK-TEST1234", response.getBookingCode());
        assertEquals("PENDING", response.getStatus());
        verify(seatRepository).saveAll(anyList());
    }

    @Test
    void initiateBooking_ThrowsException_WhenSecondSeatFailsToLock() {
        BookingInitiateRequest req = new BookingInitiateRequest();
        req.setEventId(10L);
        req.setSeatIds(Arrays.asList(1000L, 1001L));

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(sampleUser));
        when(eventRepository.findById(10L)).thenReturn(Optional.of(sampleEvent));
        when(seatLockService.tryLockSeat(1000L, 1L)).thenReturn(true);
        when(seatLockService.tryLockSeat(1001L, 1L)).thenReturn(false);

        assertThrows(IllegalStateException.class, () ->
                bookingService.initiateBooking(req, "test@example.com")
        );

        verify(seatLockService).unlockSeat(1000L);
    }

    @Test
    void confirmPayment_Success() {
        Booking pendingBooking = Booking.builder()
                .id(50L)
                .bookingCode("BOOK-TEST1234")
                .user(sampleUser)
                .event(sampleEvent)
                .status(BookingStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(150000))
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .items(new ArrayList<>())
                .build();

        BookingItem item = BookingItem.builder()
                .id(500L)
                .booking(pendingBooking)
                .seat(sampleSeat)
                .priceSnapshot(BigDecimal.valueOf(150000))
                .build();
        pendingBooking.getItems().add(item);

        when(bookingRepository.findById(50L)).thenReturn(Optional.of(pendingBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(pendingBooking);

        ConfirmPaymentRequest req = new ConfirmPaymentRequest();
        req.setPaymentMethod("STRIPE");
        req.setStripePaymentIntentId("pi_mock_123456");

        BookingResponse response = bookingService.confirmPayment(50L, req, "test@example.com");

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED.name(), response.getStatus());
        assertEquals(SeatStatus.BOOKED, sampleSeat.getStatus());
        verify(seatLockService).unlockSeat(1000L);
    }
}
