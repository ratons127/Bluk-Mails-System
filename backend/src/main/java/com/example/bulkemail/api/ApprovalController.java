package com.example.bulkemail.api;

import com.example.bulkemail.dto.ApprovalActionRequest;
import com.example.bulkemail.dto.ApprovalDto;
import com.example.bulkemail.entity.Approval;
import com.example.bulkemail.entity.Role;
import com.example.bulkemail.audit.AuditService;
import com.example.bulkemail.security.SecurityUtil;
import com.example.bulkemail.service.ApprovalService;
import com.example.bulkemail.service.CampaignService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/approvals")
@Tag(name = "Approvals")
public class ApprovalController {
    private final ApprovalService approvalService;
    private final CampaignService campaignService;
    private final AuditService auditService;

    public ApprovalController(ApprovalService approvalService, CampaignService campaignService, AuditService auditService) {
        this.approvalService = approvalService;
        this.campaignService = campaignService;
        this.auditService = auditService;
    }

    @GetMapping("/inbox")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','APPROVER')")
    public List<ApprovalDto> inbox() {
        List<ApprovalDto> pending = new ArrayList<>();
        for (String roleName : SecurityUtil.currentRoles()) {
            try {
                Role role = Role.valueOf(roleName);
                pending.addAll(approvalService.pendingByRole(role));
            } catch (IllegalArgumentException ignored) {
            }
        }
        return pending;
    }

    @PostMapping("/{approvalId}/approve")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','APPROVER')")
    public ApprovalDto approve(@PathVariable Long approvalId, @Valid @RequestBody ApprovalActionRequest request,
                               HttpServletRequest http) {
        Approval approval = approvalService.getEntity(approvalId);
        if (!hasRequiredRole(approval.getRequiredRole())) {
            throw new IllegalStateException("User lacks required approval role");
        }
        ApprovalDto dto = approvalService.approve(approvalId, request.getComment());
        campaignService.updateStatusIfApproved(dto.getCampaignId(), ip(http), userAgent(http));
        auditService.logAction("CAMPAIGN_APPROVE", "approval", approvalId.toString(), null, dto, ip(http), userAgent(http));
        return dto;
    }

    @PostMapping("/{approvalId}/reject")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','APPROVER')")
    public ApprovalDto reject(@PathVariable Long approvalId, @Valid @RequestBody ApprovalActionRequest request,
                              HttpServletRequest http) {
        Approval approval = approvalService.getEntity(approvalId);
        if (!hasRequiredRole(approval.getRequiredRole())) {
            throw new IllegalStateException("User lacks required approval role");
        }
        ApprovalDto dto = approvalService.reject(approvalId, request.getComment());
        campaignService.reject(dto.getCampaignId());
        auditService.logAction("CAMPAIGN_REJECT", "approval", approvalId.toString(), null, dto, ip(http), userAgent(http));
        return dto;
    }

    private boolean hasRequiredRole(Role required) {
        List<String> roles = SecurityUtil.currentRoles();
        return roles.contains(Role.SUPER_ADMIN.name()) || roles.contains(required.name());
    }

    private String ip(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }
}
