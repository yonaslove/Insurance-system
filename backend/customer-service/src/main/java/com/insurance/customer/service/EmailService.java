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

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from:support@insurance-system.com}")
    private String configuredFromEmail;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String getSenderEmail() {
        if (mailUsername != null && !mailUsername.isBlank()) {
            return mailUsername.trim();
        }
        if (configuredFromEmail != null && !configuredFromEmail.isBlank()) {
            return configuredFromEmail.trim();
        }
        return "support@insurance-system.com";
    }

    public void sendPasswordResetEmail(String toEmail, String fullName, String resetCode) {
        String fromSender = getSenderEmail();

        log.info("================================================================================");
        log.info("                       PASSWORD RESET NOTIFICATION                              ");
        log.info("From       : {}", fromSender);
        log.info("Recipient  : {} <{}>", fullName, toEmail);
        log.info("Subject    : Password Reset Verification Code - Insurance System");
        log.info("Reset Code : >>> {} <<<", resetCode);
        log.info("Expires In : 15 minutes");
        log.info("================================================================================");

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(String.format("InsurEdge Insurance <%s>", fromSender));
                message.setTo(toEmail);
                message.setSubject("Password Reset Verification Code - Insurance System");
                message.setText(String.format(
                        "Dear %s,\n\n" +
                        "We received a request to reset the password for your Insurance System account.\n\n" +
                        "Your 6-digit password reset verification code is:\n\n" +
                        "      %s\n\n" +
                        "Please enter this 6-digit code on the reset password screen to verify your identity and set your new password.\n\n" +
                        "This code is confidential and will expire in 15 minutes.\n\n" +
                        "If you did not request this password reset, please contact security support immediately.\n\n" +
                        "Best regards,\n" +
                        "Insurance System Support Team",
                        fullName, resetCode
                ));
                mailSender.send(message);
                log.info("Password reset email sent successfully via SMTP to {}", toEmail);
            } catch (Exception ex) {
                // If display name format fails on strict SMTP server, fall back to plain email address
                try {
                    SimpleMailMessage plainMsg = new SimpleMailMessage();
                    plainMsg.setFrom(fromSender);
                    plainMsg.setTo(toEmail);
                    plainMsg.setSubject("Password Reset Verification Code - Insurance System");
                    plainMsg.setText(String.format(
                            "Dear %s,\n\n" +
                            "We received a request to reset the password for your Insurance System account.\n\n" +
                            "Your 6-digit password reset verification code is:\n\n" +
                            "      %s\n\n" +
                            "Please enter this 6-digit code on the reset password screen to verify your identity and set your new password.\n\n" +
                            "This code is confidential and will expire in 15 minutes.\n\n" +
                            "If you did not request this password reset, please contact security support immediately.\n\n" +
                            "Best regards,\n" +
                            "Insurance System Support Team",
                            fullName, resetCode
                    ));
                    mailSender.send(plainMsg);
                    log.info("Password reset email sent successfully via SMTP fallback to {}", toEmail);
                } catch (Exception fallbackEx) {
                    log.warn("SMTP relay failed to send email to {}: {}. Verification code is recorded in system logs above.", toEmail, fallbackEx.getMessage());
                }
            }
        } else {
            log.info("No active JavaMailSender detected. Email successfully recorded to system output.");
        }
    }
}
