package com.example.bulkemail.service;

import com.example.bulkemail.entity.*;
import com.example.bulkemail.repo.CampaignRecipientRepository;
import com.example.bulkemail.repo.CampaignRepository;
import com.example.bulkemail.sending.MailGateway;
import com.example.bulkemail.sending.ThrottleService;
import com.example.bulkemail.audit.AuditService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class SendingService {
    private static final int MAX_RETRIES = 3;

    private final CampaignRecipientRepository recipientRepository;
    private final CampaignRepository campaignRepository;
    private final SuppressionService suppressionService;
    private final MailGateway mailGateway;
    private final ThrottleService throttleService;
    private final AuditService auditService;

    public SendingService(CampaignRecipientRepository recipientRepository, CampaignRepository campaignRepository,
                          SuppressionService suppressionService, MailGateway mailGateway,
                          ThrottleService throttleService, AuditService auditService) {
        this.recipientRepository = recipientRepository;
        this.campaignRepository = campaignRepository;
        this.suppressionService = suppressionService;
        this.mailGateway = mailGateway;
        this.throttleService = throttleService;
        this.auditService = auditService;
    }

    public void sendBatch(List<CampaignRecipient> recipients, int defaultThrottlePerMinute) {
        for (CampaignRecipient recipient : recipients) {
            Campaign campaign = recipient.getCampaign();
            int throttle = campaign.getSmtpAccount().getThrottlePerMinute() != null
                    ? campaign.getSmtpAccount().getThrottlePerMinute()
                    : defaultThrottlePerMinute;
            if (!throttleService.tryConsume(campaign.getSmtpAccount().getId(), throttle)) {
                recipient.setStatus(RecipientStatus.RETRY);
                recipient.setLastError("throttled");
                recipient.setUpdatedAt(Instant.now());
                saveIfPersistent(recipient);
                continue;
            }
            if (suppressionService.isSuppressed(recipient.getEmail())) {
                recipient.setStatus(RecipientStatus.FAILED);
                recipient.setLastError("suppressed");
                recipient.setUpdatedAt(Instant.now());
                saveIfPersistent(recipient);
                if (recipient.getId() != null) {
                    auditService.logAction("RECIPIENT_SUPPRESSED", "campaign_recipient",
                            recipient.getId().toString(), null, recipient, null, null);
                }
                continue;
            }
            try {
                mailGateway.send(campaign, recipient);
                recipient.setStatus(RecipientStatus.SENT);
                recipient.setUpdatedAt(Instant.now());
                saveIfPersistent(recipient);
                if (recipient.getId() != null) {
                    auditService.logAction("RECIPIENT_SENT", "campaign_recipient",
                            recipient.getId().toString(), null, recipient, null, null);
                }
            } catch (RuntimeException e) {
                handleFailure(recipient, e.getMessage());
            }
        }
        updateCampaignCompletion(recipients);
    }

    private void handleFailure(CampaignRecipient recipient, String error) {
        int retryCount = recipient.getRetryCount() + 1;
        recipient.setRetryCount(retryCount);
        recipient.setLastError(error);
        recipient.setUpdatedAt(Instant.now());
        if (retryCount >= MAX_RETRIES || isPermanent(error)) {
            recipient.setStatus(RecipientStatus.FAILED);
        } else {
            recipient.setStatus(RecipientStatus.RETRY);
        }
        saveIfPersistent(recipient);
        if (recipient.getId() != null) {
            auditService.logAction("RECIPIENT_SEND_FAILED", "campaign_recipient",
                    recipient.getId().toString(), null, recipient, null, null);
        }
    }

    private void saveIfPersistent(CampaignRecipient recipient) {
        if (recipient.getId() != null) {
            recipientRepository.save(recipient);
        }
    }

    private boolean isPermanent(String error) {
        if (error == null) {
            return false;
        }
        String lower = error.toLowerCase();
        return lower.contains("invalid") || lower.contains("rejected");
    }

    private void updateCampaignCompletion(List<CampaignRecipient> recipients) {
        if (recipients.isEmpty()) {
            return;
        }
        Campaign campaign = recipients.getFirst().getCampaign();
        long queued = recipientRepository.countByCampaignIdAndStatus(campaign.getId(), RecipientStatus.QUEUED);
        long retry = recipientRepository.countByCampaignIdAndStatus(campaign.getId(), RecipientStatus.RETRY);
        if (queued == 0 && retry == 0 && campaign.getStatus() == CampaignStatus.SENDING) {
            campaign.setStatus(CampaignStatus.COMPLETED);
            campaign.setUpdatedAt(Instant.now());
            campaignRepository.save(campaign);
        }
    }

    public List<String> sendTest(Campaign campaign, List<String> recipients) {
        List<String> errors = new java.util.ArrayList<>();
        for (String email : recipients) {
            CampaignRecipient recipient = new CampaignRecipient();
            recipient.setCampaign(campaign);
            recipient.setEmail(email);
            recipient.setStatus(RecipientStatus.QUEUED);
            recipient.setRetryCount(0);
            recipient.setUpdatedAt(Instant.now());
            try {
                mailGateway.send(campaign, recipient);
            } catch (RuntimeException e) {
                String message = e.getMessage() != null ? e.getMessage() : "SMTP send failed";
                errors.add(email + ": " + message);
            }
        }
        return errors;
    }
}
