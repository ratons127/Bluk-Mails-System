package com.example.bulkemail.service;

import com.example.bulkemail.dto.ReportSummaryDto;
import com.example.bulkemail.entity.RecipientStatus;
import com.example.bulkemail.repo.CampaignRecipientRepository;
import org.springframework.stereotype.Service;

@Service
public class ReportService {
    private final CampaignRecipientRepository recipientRepository;

    public ReportService(CampaignRecipientRepository recipientRepository) {
        this.recipientRepository = recipientRepository;
    }

    public ReportSummaryDto summary(Long campaignId) {
        ReportSummaryDto dto = new ReportSummaryDto();
        dto.setQueued(recipientRepository.countByCampaignIdAndStatus(campaignId, RecipientStatus.QUEUED));
        dto.setSent(recipientRepository.countByCampaignIdAndStatus(campaignId, RecipientStatus.SENT));
        dto.setFailed(recipientRepository.countByCampaignIdAndStatus(campaignId, RecipientStatus.FAILED));
        return dto;
    }
}
