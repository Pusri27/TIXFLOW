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
import java.math.BigDecimal;
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

        DeviceRgb brandCoral = new DeviceRgb(225, 29, 72); // #E11D48

        Paragraph header = new Paragraph("TIXFLOW OFFICIAL E-TICKET")
                .setFontSize(20)
                .setBold()
                .setFontColor(brandCoral)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(6);
        doc.add(header);

        Paragraph ticketCodePara = new Paragraph("Pass Code: " + ticket.getTicketCode())
                .setFontSize(12)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        doc.add(ticketCodePara);

        Table table = new Table(UnitValue.createPercentArray(new float[]{52, 48}))
                .useAllAvailableWidth()
                .setMarginBottom(22);

        var bookingItem = ticket.getBookingItem();
        var booking = bookingItem.getBooking();
        var event = booking.getEvent();
        var holder = ticket.getCurrentOwner() != null ? ticket.getCurrentOwner() : booking.getUser();
        var seat = bookingItem.getSeat();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy HH:mm");

        BigDecimal snap = bookingItem.getPriceSnapshot() != null ? bookingItem.getPriceSnapshot() : BigDecimal.ZERO;
        String formattedPrice = snap.longValue() >= 10000L
                ? "IDR " + String.format("%,d", snap.longValue())
                : "$" + String.format("%,.2f", snap);

        table.addCell(new Paragraph("EVENT INFORMATION\n\nEvent: " + event.getName()
                + "\nCategory: " + event.getCategory()
                + "\nDate & Doors: " + event.getStartTime().format(formatter)
                + "\nVenue: " + (event.getVenue() != null ? event.getVenue().getName() + ", " + event.getVenue().getCity() : "TBA"))
                .setFontSize(10));

        table.addCell(new Paragraph("TICKET HOLDER & SEAT\n\nHolder: " + holder.getName()
                + "\nEmail: " + holder.getEmail()
                + "\nSection: " + (seat.getCategory() != null ? seat.getCategory().getName() : "Standard")
                + "\nRow " + seat.getRowLabel() + " - Seat #" + seat.getSeatNumber()
                + "\nPrice: " + formattedPrice)
                .setFontSize(10));

        doc.add(table);

        byte[] qrBytes = qrCodeGenerator.generateQrCodeImage(ticket.getTicketCode(), 160, 160);
        Image qrImage = new Image(ImageDataFactory.create(qrBytes));
        qrImage.setHorizontalAlignment(com.itextpdf.layout.properties.HorizontalAlignment.CENTER);
        doc.add(qrImage);

        Paragraph footer = new Paragraph("Present this pass or your live rotating QR in the Tixflow web wallet at the venue entrance.")
                .setFontSize(9)
                .setFontColor(ColorConstants.GRAY)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(16);
        doc.add(footer);

        doc.close();
        return baos.toByteArray();
    }
}
