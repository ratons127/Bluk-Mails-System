package com.example.bulkemail.repo;

import com.example.bulkemail.entity.Approval;
import com.example.bulkemail.entity.ApprovalStatus;
import com.example.bulkemail.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByStatusAndRequiredRole(ApprovalStatus status, Role role);
    List<Approval> findByCampaignId(Long campaignId);
    void deleteByCampaignId(Long campaignId);
}
