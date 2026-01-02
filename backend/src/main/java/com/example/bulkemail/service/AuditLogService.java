package com.example.bulkemail.service;

import com.example.bulkemail.entity.AuditLog;
import com.example.bulkemail.repo.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Stream;

@Service
public class AuditLogService {
    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public List<AuditLog> list(String actorEmail, String action, Instant start, Instant end) {
        Stream<AuditLog> stream = auditLogRepository.findAll().stream();
        if (actorEmail != null && !actorEmail.isBlank()) {
            stream = stream.filter(log -> actorEmail.equalsIgnoreCase(log.getActorEmail()));
        }
        if (action != null && !action.isBlank()) {
            stream = stream.filter(log -> action.equalsIgnoreCase(log.getAction()));
        }
        if (start != null) {
            stream = stream.filter(log -> !log.getCreatedAt().isBefore(start));
        }
        if (end != null) {
            stream = stream.filter(log -> !log.getCreatedAt().isAfter(end));
        }
        return stream.toList();
    }
}
