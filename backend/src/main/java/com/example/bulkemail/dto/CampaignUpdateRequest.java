package com.example.bulkemail.dto;

import com.example.bulkemail.entity.CampaignCategory;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CampaignUpdateRequest {
    @NotBlank
    @Schema(example = "Q3 Benefits Update")
    private String title;

    @NotBlank
    @Schema(example = "Benefits enrollment opens Monday")
    private String subject;

    private String htmlBody;

    private String textBody;

    @NotNull
    private CampaignCategory category;

    @NotNull
    @Schema(example = "1")
    private Long senderIdentityId;

    @NotNull
    @Schema(example = "1")
    private Long smtpAccountId;

    @Schema(example = "[{\"name\":\"brochure.pdf\",\"size\":12345}]")
    private String attachmentsJson;
}
