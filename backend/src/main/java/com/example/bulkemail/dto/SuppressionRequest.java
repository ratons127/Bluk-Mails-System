package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SuppressionRequest {
    @NotBlank
    @Schema(example = "bounced.user@example.com")
    private String email;

    @NotBlank
    @Schema(example = "Manual block request")
    private String reason;
}
