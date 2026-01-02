package com.example.bulkemail.dto;

import com.example.bulkemail.entity.AudienceRuleType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AudienceRuleDto {
    @NotNull
    private AudienceRuleType ruleType;

    @NotBlank
    @Schema(example = "Engineering")
    private String ruleValue;
}
