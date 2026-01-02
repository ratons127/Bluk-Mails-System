package com.example.bulkemail.repo;

import com.example.bulkemail.entity.SmtpAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SmtpAccountRepository extends JpaRepository<SmtpAccount, Long> {
}
