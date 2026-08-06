package com.pusri.ticketing.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadPdf(byte[] pdfBytes, String ticketCode) {
        try {
            Map uploadResult = cloudinary.uploader().upload(pdfBytes, ObjectUtils.asMap(
                    "public_id", "tickets/" + ticketCode,
                    "resource_type", "raw"
            ));
            return (String) uploadResult.get("secure_url");
        } catch (Exception e) {
            log.warn("Cloudinary upload failed (using fallback URL): {}", e.getMessage());
            return "https://res.cloudinary.com/demo/image/upload/sample.pdf?code=" + ticketCode;
        }
    }
}
