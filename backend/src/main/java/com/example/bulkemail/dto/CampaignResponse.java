package com.example.bulkemail.dto;

import com.example.bulkemail.entity.CampaignCategory;
import com.example.bulkemail.entity.CampaignStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
public class CampaignResponse {
    @Schema(example = "200")
    private Long id;

    private String title;

    private String subject;

    private String htmlBody;

    private String textBody;

    private CampaignCategory category;

    private Long senderIdentityId;

    private Long smtpAccountId;

    private CampaignStatus status;

    private Instant scheduledAt;

    private Instant sendWindowStart;

    private Instant sendWindowEnd;

    private String attachmentsJson;

    private boolean emergencyBypass;

    private String emergencyReason;

    private String createdBy;

    private Instant createdAt;

    private Instant updatedAt;
}
