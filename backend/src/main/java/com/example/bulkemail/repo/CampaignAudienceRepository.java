package com.example.bulkemail.repo;

import com.example.bulkemail.entity.CampaignAudience;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampaignAudienceRepository extends JpaRepository<CampaignAudience, Long> {
    List<CampaignAudience> findByCampaignId(Long campaignId);
    void deleteByCampaignId(Long campaignId);
    void deleteByAudienceId(Long audienceId);
}
