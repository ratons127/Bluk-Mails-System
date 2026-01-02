package com.example.bulkemail.dto;

import com.example.bulkemail.entity.ApprovalStatus;
import com.example.bulkemail.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.Instant;

@Data
public class ApprovalDto {
    @Schema(example = "300")
    private Long id;

    private Long campaignId;

    private Role requiredRole;

    private ApprovalStatus status;

    @Schema(example = "hr.approver@example.com")
    private String approverEmail;

    private String comment;

    private Instant createdAt;

    private Instant actedAt;
}
