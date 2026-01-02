package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AudienceCreateRequest {
    @NotBlank
    @Schema(example = "Engineering - US")
    private String name;

    @Schema(example = "US engineers in active status")
    private String description;

    @NotEmpty
    private List<AudienceRuleDto> rules;
}
