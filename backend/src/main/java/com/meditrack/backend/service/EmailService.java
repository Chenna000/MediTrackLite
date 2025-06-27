package com.meditrack.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            // true enables HTML content
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setFrom("gowrisankarreddykalukurthi@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true); // true = HTML format

            mailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace(); // or use a logger
        }
    }
}
