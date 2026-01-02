package com.example.bulkemail.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class ApprovalActionRequest {
    @Schema(example = "Looks good")
    private String comment;
}
