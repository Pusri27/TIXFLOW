package com.pusri.ticketing.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@Slf4j
public class DynamicQrService {

    @Value("${app.jwt.secret:defaultSecretKeyForDynamicQrValidation123456789}")
    private String hmacSecret;

    private static final long TIME_STEP_SECONDS = 30;

    public String generateDynamicQrPayload(String ticketCode) {
        long timeStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        String rawData = ticketCode + ":" + timeStep;
        String signature = generateHmac(rawData);
        return ticketCode + ":" + timeStep + ":" + signature;
    }

    public String validateDynamicQrPayload(String payload) {
        if (payload == null || !payload.contains(":")) {
            throw new IllegalArgumentException("Format QR Payload tidak valid");
        }

        String[] parts = payload.split(":");
        if (parts.length != 3) {
            throw new IllegalArgumentException("Format QR Payload tidak valid (3 bagian dibutuhkan)");
        }

        String ticketCode = parts[0];
        long payloadTimeStep;
        try {
            payloadTimeStep = Long.parseLong(parts[1]);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Timestamp QR tidak valid");
        }

        String providedSignature = parts[2];
        long currentStep = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;

        // Allow +/- 1 time step tolerance (up to 30s grace period)
        if (Math.abs(currentStep - payloadTimeStep) > 1) {
            throw new IllegalStateException("QR Code telah kadaluarsa. Silakan refresh QR Code Anda.");
        }

        String expectedRawData = ticketCode + ":" + payloadTimeStep;
        String expectedSignature = generateHmac(expectedRawData);

        if (!expectedSignature.equals(providedSignature)) {
            throw new SecurityException("Tanda tangan QR Code tidak valid atau telah dipalsukan!");
        }

        return ticketCode;
    }

    private String generateHmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(hmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmacBytes);
        } catch (Exception e) {
            log.error("Gagal membuat HMAC signature untuk QR", e);
            throw new RuntimeException("Gagal enkripsi Dynamic QR");
        }
    }
}
