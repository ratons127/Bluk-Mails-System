package com.example.bulkemail.repo;

import com.example.bulkemail.entity.SuppressionList;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SuppressionListRepository extends JpaRepository<SuppressionList, Long> {
    Optional<SuppressionList> findByEmail(String email);
    void deleteByEmail(String email);
}
