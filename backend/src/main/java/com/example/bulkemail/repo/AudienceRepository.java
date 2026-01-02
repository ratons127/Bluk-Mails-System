package com.example.bulkemail.repo;

import com.example.bulkemail.entity.Audience;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AudienceRepository extends JpaRepository<Audience, Long> {
}
