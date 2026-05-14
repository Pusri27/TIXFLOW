package com.pusri.ticketing.util;

import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.pusri.ticketing.entity.Ticket;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Component
@RequiredArgsConstructor
public class PdfTicketGenerator {

    private final QrCodeGenerator qrCodeGenerator;

    public byte[] generateTicketPdf(Ticket ticket) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document doc = new Document(pdfDoc);

        // Styling colors
        DeviceRgb primaryColor = new DeviceRgb(59, 130, 246); // Blue #3B82F6

        // Header Title
        Paragraph header = new Paragraph("OFFICIAL E-TICKET")
                .setFontSize(22)
                .setBold()
                .setFontColor(primaryColor)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        doc.add(header);

        Paragraph ticketCodePara = new Paragraph("Ticket Code: " + ticket.getTicketCode())
                .setFontSize(12)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        doc.add(ticketCodePara);

        // Main Information Table
        Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                .useAllAvailableWidth()
                .setMarginBottom(20);

        var bookingItem = ticket.getBookingItem();
        var booking = bookingItem.getBooking();
        var event = booking.getEvent();
        var user = booking.getUser();
        var seat = bookingItem.getSeat();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, dd MMMM yyyy HH:mm");

        table.addCell(new Paragraph("EVENT DETAILS\n\nEvent: " + event.getName()
                + "\nCategory: " + event.getCategory()
                + "\nDate: " + event.getStartTime().format(formatter)
                + "\nVenue: " + (event.getVenue() != null ? event.getVenue().getName() + ", " + event.getVenue().getCity() : "N/A"))
                .setFontSize(10));

        table.addCell(new Paragraph("PASSENGER & SEAT\n\nName: " + user.getName()
                + "\nEmail: " + user.getEmail()
                + "\nRow: " + seat.getRowLabel()
                + "\nSeat Number: " + seat.getSeatNumber()
                + "\nPrice: $" + String.format("%,.2f", bookingItem.getPriceSnapshot()))
                .setFontSize(10));

        doc.add(table);

        // Generate QR Code PNG
        byte[] qrBytes = qrCodeGenerator.generateQrCodeImage(ticket.getTicketCode(), 150, 150);
        Image qrImage = new Image(ImageDataFactory.create(qrBytes));
        qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
        doc.add(qrImage);

        Paragraph footer = new Paragraph("Please present this QR Code at the venue entrance gate.\nPowered by TIXFLOW Ticketing Engine.")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(15);
        doc.add(footer);

        doc.close();
        return baos.toByteArray();
    }
}
