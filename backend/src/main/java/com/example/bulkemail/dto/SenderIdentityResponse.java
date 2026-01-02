package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class SenderIdentityResponse {
    @Schema(example = "10")
    private Long id;

    @Schema(example = "BetopiaCloud")
    private String displayName;

    @Schema(example = "raton@betopiagroup.com")
    private String email;

    @Schema(example = "1")
    private Long smtpAccountId;
}
