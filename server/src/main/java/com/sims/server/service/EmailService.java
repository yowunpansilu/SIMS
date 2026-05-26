package com.sims.server.service;

import com.sims.server.model.Student;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy");
    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");

    public void sendInterviewConfirmation(Student student, LocalDateTime slot, String location) {
        if (student.getEmail() == null || student.getEmail().isBlank()) return;

        String date = slot.format(DATE_FMT);
        String startTime = slot.format(TIME_FMT);
        String endTime = slot.plusMinutes(10).format(TIME_FMT);

        String subject = "Interview Scheduled — " + date;

        String html = """
                <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:8px">
                  <h2 style="margin:0 0 16px;color:#111827">Interview Confirmation</h2>
                  <p style="color:#374151">Dear <strong>%s</strong>,</p>
                  <p style="color:#374151">Your A/L intake interview has been scheduled. Please find the details below:</p>
                  <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                    <tr><td style="padding:8px 0;color:#6b7280;width:120px">Date</td><td style="padding:8px 0;font-weight:600;color:#111827">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Time</td><td style="padding:8px 0;font-weight:600;color:#111827">%s – %s</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Duration</td><td style="padding:8px 0;font-weight:600;color:#111827">10 minutes</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280">Location</td><td style="padding:8px 0;font-weight:600;color:#111827">%s</td></tr>
                  </table>
                  <p style="color:#374151">Please arrive 5 minutes early. If you have any questions, contact the school office.</p>
                  <p style="color:#9ca3af;font-size:12px;margin-top:24px">This is an automated message from the Student Information Management System.</p>
                </div>
                """.formatted(student.getFullName(), date, startTime, endTime, location);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(student.getEmail());
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            // Log and continue — email failure should not block scheduling
            System.err.println("Failed to send interview email to " + student.getEmail() + ": " + e.getMessage());
        }
    }
}
