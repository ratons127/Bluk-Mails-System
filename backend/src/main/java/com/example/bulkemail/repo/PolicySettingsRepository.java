package com.example.bulkemail.repo;

import com.example.bulkemail.entity.PolicySettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicySettingsRepository extends JpaRepository<PolicySettings, Long> {
}
