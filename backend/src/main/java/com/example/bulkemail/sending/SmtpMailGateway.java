package com.example.bulkemail.sending;

import com.example.bulkemail.entity.Campaign;
import com.example.bulkemail.entity.CampaignRecipient;
import com.example.bulkemail.entity.SmtpAccount;
import jakarta.mail.Message;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.MimeMultipart;
import jakarta.activation.DataHandler;
import jakarta.activation.DataSource;
import jakarta.mail.util.ByteArrayDataSource;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;
import java.util.List;

@Component
public class SmtpMailGateway implements MailGateway {
    private final ObjectMapper objectMapper;
    private final String attachmentsPath;

    public SmtpMailGateway(ObjectMapper objectMapper,
                           @Value("${app.attachments.path:/root/Attachments Files}") String attachmentsPath) {
        this.objectMapper = objectMapper;
        this.attachmentsPath = attachmentsPath;
    }

    @Override
    public void send(Campaign campaign, CampaignRecipient recipient) {
        SmtpAccount account = campaign.getSmtpAccount();
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(account.getHost());
        mailSender.setPort(account.getPort());
        mailSender.setUsername(account.getUsername());
        mailSender.setPassword(account.getPassword());
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        boolean hasAuth = account.getUsername() != null && !account.getUsername().isBlank();
        boolean useSsl = account.getPort() != null && account.getPort() == 465;
        boolean useTls = account.isUseTls() && !useSsl;
        props.put("mail.smtp.auth", String.valueOf(hasAuth));
        props.put("mail.smtp.starttls.enable", String.valueOf(useTls));
        props.put("mail.smtp.starttls.required", String.valueOf(useTls));
        props.put("mail.smtp.ssl.enable", String.valueOf(useSsl));
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");

        try {
            MimeMessage message = mailSender.createMimeMessage();
            String senderEmail = campaign.getSenderIdentity().getEmail();
            String smtpUsername = account.getUsername();
            String fromEmail = senderEmail;
            if (smtpUsername != null && smtpUsername.contains("@") && !smtpUsername.equalsIgnoreCase(senderEmail)) {
                fromEmail = smtpUsername;
            }
            message.setFrom(new InternetAddress(fromEmail,
                    campaign.getSenderIdentity().getDisplayName(), StandardCharsets.UTF_8.name()));
            if (senderEmail != null && !senderEmail.isBlank() && !senderEmail.equalsIgnoreCase(fromEmail)) {
                message.setReplyTo(new InternetAddress[]{new InternetAddress(senderEmail,
                        campaign.getSenderIdentity().getDisplayName(), StandardCharsets.UTF_8.name())});
            }
            message.setRecipient(Message.RecipientType.TO, new InternetAddress(recipient.getEmail()));
            message.setSubject(campaign.getSubject(), StandardCharsets.UTF_8.name());
            String html = campaign.getHtmlBody();
            String textBody = campaign.getTextBody() != null ? campaign.getTextBody() : "";
            List<com.example.bulkemail.dto.CampaignAttachment> attachments = parseAttachments(campaign.getAttachmentsJson());
            if (attachments.isEmpty()) {
                if (html != null && !html.isBlank()) {
                    message.setContent(html, "text/html; charset=UTF-8");
                } else {
                    message.setText(textBody, StandardCharsets.UTF_8.name());
                }
            } else {
                MimeMultipart multipart = new MimeMultipart();
                MimeBodyPart bodyPart = new MimeBodyPart();
                if (html != null && !html.isBlank()) {
                    bodyPart.setContent(html, "text/html; charset=UTF-8");
                } else {
                    bodyPart.setText(textBody, StandardCharsets.UTF_8.name());
                }
                multipart.addBodyPart(bodyPart);
                for (com.example.bulkemail.dto.CampaignAttachment attachment : attachments) {
                    Path filePath = Path.of(attachmentsPath, attachment.getStoredName());
                    if (Files.exists(filePath)) {
                        MimeBodyPart attachPart = new MimeBodyPart();
                        byte[] bytes = Files.readAllBytes(filePath);
                        String contentType = attachment.getContentType() != null ? attachment.getContentType() : "application/octet-stream";
                        DataSource dataSource = new ByteArrayDataSource(bytes, contentType);
                        attachPart.setDataHandler(new DataHandler(dataSource));
                        attachPart.setFileName(attachment.getOriginalName());
                        multipart.addBodyPart(attachPart);
                    }
                }
                message.setContent(multipart);
            }
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new IllegalStateException("SMTP send failed: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new IllegalStateException("SMTP send failed: " + e.getMessage(), e);
        }
    }

    private List<com.example.bulkemail.dto.CampaignAttachment> parseAttachments(String attachmentsJson) {
        if (attachmentsJson == null || attachmentsJson.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(attachmentsJson, new TypeReference<List<com.example.bulkemail.dto.CampaignAttachment>>() {});
        } catch (Exception e) {
            return List.of();
        }
    }
}
