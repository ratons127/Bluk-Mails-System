package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SenderIdentityRequest {
    @Schema(example = "BetopiaCloud")
    @NotBlank
    private String displayName;

    @Schema(example = "raton@betopiagroup.com")
    @NotBlank
    @Email
    private String email;

    @Schema(example = "1")
    @NotNull
    private Long smtpAccountId;
}
