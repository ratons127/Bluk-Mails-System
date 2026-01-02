package com.example.bulkemail.repo;

import com.example.bulkemail.entity.CampaignRecipient;
import com.example.bulkemail.entity.RecipientStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CampaignRecipientRepository extends JpaRepository<CampaignRecipient, Long> {
    @Query("select cr from CampaignRecipient cr where cr.status = ?1 and cr.campaign.status in ?2")
    List<CampaignRecipient> findByStatusAndCampaignStatuses(RecipientStatus status, List<com.example.bulkemail.entity.CampaignStatus> statuses, Pageable pageable);

    long countByCampaignIdAndStatus(Long campaignId, RecipientStatus status);

    void deleteByCampaignId(Long campaignId);

    List<CampaignRecipient> findByCampaignId(Long campaignId);
}
