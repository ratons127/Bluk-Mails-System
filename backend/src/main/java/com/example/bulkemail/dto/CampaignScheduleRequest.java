package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;

@Data
public class CampaignScheduleRequest {
    @NotNull
    private Instant scheduledAt;

    private Instant sendWindowStart;

    private Instant sendWindowEnd;
}
