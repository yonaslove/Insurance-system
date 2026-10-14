package com.insurance.customer.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:support@insurance-corp.com}")
    private String fromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String resetCode, String resetLink) {
        log.info("================================================================================");
        log.info("                       PASSWORD RESET NOTIFICATION                              ");
        log.info("Recipient  : {} <{}>", fullName, toEmail);
        log.info("Subject    : Password Reset Verification Code - Insurance System");
        log.info("Reset Code : >>> {} <<<", resetCode);
        log.info("Reset Link : {}", resetLink);
        log.info("Expires In : 15 minutes");
        log.info("================================================================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject("Password Reset Verification Code - Insurance System");
                message.setText(String.format(
                        "Dear %s,\n\n" +
                        "We received a request to reset your password for your Insurance System account.\n\n" +
                        "Your 6-digit password reset verification code is:\n\n" +
                        "      %s\n\n" +
                        "This code will expire in 15 minutes.\n\n" +
                        "Alternatively, click or open the link below to enter your new password:\n" +
                        "%s\n\n" +
                        "If you did not request this password reset, please contact support immediately.\n\n" +
                        "Best regards,\n" +
                        "Insurance System Support Team",
                        fullName, resetCode, resetLink
                ));
                mailSender.send(message);
                log.info("Password reset email sent successfully via SMTP to {}", toEmail);
            } catch (Exception ex) {
                log.warn("SMTP relay failed to send email to {}: {}. Verification code is recorded in system logs above.", toEmail, ex.getMessage());
            }
        } else {
            log.info("No active JavaMailSender detected. Email successfully recorded to system output.");
        }
    }
}
