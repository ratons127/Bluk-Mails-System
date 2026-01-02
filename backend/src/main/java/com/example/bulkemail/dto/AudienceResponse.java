package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
public class AudienceResponse {
    @Schema(example = "100")
    private Long id;

    @Schema(example = "Engineering - US")
    private String name;

    private String description;

    private String createdBy;

    private Instant createdAt;

    private List<AudienceRuleDto> rules;
}
