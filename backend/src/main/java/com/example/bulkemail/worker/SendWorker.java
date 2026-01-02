package com.example.bulkemail.worker;

import com.example.bulkemail.config.AppProperties;
import com.example.bulkemail.entity.CampaignStatus;
import com.example.bulkemail.entity.RecipientStatus;
import com.example.bulkemail.repo.CampaignRecipientRepository;
import com.example.bulkemail.service.SendingService;
import com.example.bulkemail.service.PolicySettingsService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SendWorker {
    private final CampaignRecipientRepository recipientRepository;
    private final SendingService sendingService;
    private final AppProperties appProperties;
    private final PolicySettingsService policySettingsService;

    public SendWorker(CampaignRecipientRepository recipientRepository, SendingService sendingService,
                      AppProperties appProperties, PolicySettingsService policySettingsService) {
        this.recipientRepository = recipientRepository;
        this.sendingService = sendingService;
        this.appProperties = appProperties;
        this.policySettingsService = policySettingsService;
    }

    @Scheduled(fixedDelayString = "${app.sending.worker.poll-interval-ms:5000}")
    @Transactional
    public void pollAndSend() {
        int batchSize = appProperties.getSending().getWorker().getBatchSize();
        List<com.example.bulkemail.entity.CampaignRecipient> queued = recipientRepository.findByStatusAndCampaignStatuses(
                RecipientStatus.QUEUED,
                List.of(CampaignStatus.SENDING, CampaignStatus.SCHEDULED),
                PageRequest.of(0, batchSize));
        List<com.example.bulkemail.entity.CampaignRecipient> eligible = queued.stream()
                .filter(recipient -> recipient.getCampaign().getStatus() == CampaignStatus.SENDING
                        || recipient.getCampaign().getScheduledAt() == null
                        || !recipient.getCampaign().getScheduledAt().isAfter(java.time.Instant.now()))
                .toList();
        if (eligible.isEmpty()) {
            return;
        }
        int defaultThrottle = policySettingsService.getEffectiveSettings().getDefaultThrottlePerMinute();
        sendingService.sendBatch(eligible, defaultThrottle);
    }
}
