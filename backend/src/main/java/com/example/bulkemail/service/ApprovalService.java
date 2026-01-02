package com.example.bulkemail.service;

import com.example.bulkemail.dto.ApprovalDto;
import com.example.bulkemail.entity.*;
import com.example.bulkemail.repo.ApprovalRepository;
import com.example.bulkemail.security.SecurityUtil;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ApprovalService {
    private final ApprovalRepository approvalRepository;

    public ApprovalService(ApprovalRepository approvalRepository) {
        this.approvalRepository = approvalRepository;
    }

    public Approval createPending(Campaign campaign, Role role) {
        Approval approval = new Approval();
        approval.setCampaign(campaign);
        approval.setRequiredRole(role);
        approval.setStatus(ApprovalStatus.PENDING);
        approval.setCreatedAt(Instant.now());
        return approvalRepository.save(approval);
    }

    public ApprovalDto approve(Long approvalId, String comment) {
        Approval approval = getEntity(approvalId);
        approval.setStatus(ApprovalStatus.APPROVED);
        approval.setApproverEmail(SecurityUtil.currentEmail());
        approval.setComment(comment);
        approval.setActedAt(Instant.now());
        return toDto(approvalRepository.save(approval));
    }

    public ApprovalDto reject(Long approvalId, String comment) {
        Approval approval = getEntity(approvalId);
        approval.setStatus(ApprovalStatus.REJECTED);
        approval.setApproverEmail(SecurityUtil.currentEmail());
        approval.setComment(comment);
        approval.setActedAt(Instant.now());
        return toDto(approvalRepository.save(approval));
    }

    public Approval getEntity(Long approvalId) {
        return approvalRepository.findById(approvalId)
                .orElseThrow(() -> new IllegalArgumentException("Approval not found"));
    }

    public boolean allApproved(Long campaignId) {
        List<Approval> approvals = approvalRepository.findByCampaignId(campaignId);
        return approvals.stream().allMatch(a -> a.getStatus() == ApprovalStatus.APPROVED);
    }

    public List<ApprovalDto> pendingByRole(Role role) {
        return approvalRepository.findByStatusAndRequiredRole(ApprovalStatus.PENDING, role)
                .stream().map(this::toDto).toList();
    }

    public List<Approval> findByCampaign(Long campaignId) {
        return approvalRepository.findByCampaignId(campaignId);
    }

    public ApprovalDto toDto(Approval approval) {
        ApprovalDto dto = new ApprovalDto();
        dto.setId(approval.getId());
        dto.setCampaignId(approval.getCampaign().getId());
        dto.setRequiredRole(approval.getRequiredRole());
        dto.setStatus(approval.getStatus());
        dto.setApproverEmail(approval.getApproverEmail());
        dto.setComment(approval.getComment());
        dto.setCreatedAt(approval.getCreatedAt());
        dto.setActedAt(approval.getActedAt());
        return dto;
    }
}
