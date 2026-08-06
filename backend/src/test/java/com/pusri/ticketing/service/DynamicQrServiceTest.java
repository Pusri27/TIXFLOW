package com.pusri.ticketing.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class DynamicQrServiceTest {

    private DynamicQrService dynamicQrService;

    @BeforeEach
    void setUp() {
        dynamicQrService = new DynamicQrService();
        ReflectionTestUtils.setField(dynamicQrService, "hmacSecret", "secretKey1234567890TestSecret");
    }

    @Test
    void generateAndValidateDynamicQr_Success() {
        String payload = dynamicQrService.generateDynamicQrPayload("TICKET-12345");
        assertNotNull(payload);
        assertTrue(payload.startsWith("TICKET-12345:"));

        String validatedTicketCode = dynamicQrService.validateDynamicQrPayload(payload);
        assertEquals("TICKET-12345", validatedTicketCode);
    }

    @Test
    void validateDynamicQr_FailsOnTamperedPayload() {
        String payload = dynamicQrService.generateDynamicQrPayload("TICKET-12345");
        String tamperedPayload = payload.substring(0, payload.length() - 4) + "XXXX";

        assertThrows(SecurityException.class, () ->
                dynamicQrService.validateDynamicQrPayload(tamperedPayload)
        );
    }
}
