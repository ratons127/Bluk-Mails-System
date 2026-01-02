package com.example.bulkemail.repo;

import com.example.bulkemail.entity.AudienceRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AudienceRuleRepository extends JpaRepository<AudienceRule, Long> {
    List<AudienceRule> findByAudienceId(Long audienceId);
    void deleteByAudienceId(Long audienceId);
}
