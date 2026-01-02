package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CampaignSubmitRequest {
    @NotEmpty
    @Schema(example = "[1,2]")
    private List<Long> audienceIds;

    @Schema(example = "Emergency notification approved by leadership")
    private String emergencyReason;
}
