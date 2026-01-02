package com.example.bulkemail.audit;

import com.example.bulkemail.entity.AuditLog;
import com.example.bulkemail.repo.AuditLogRepository;
import com.example.bulkemail.security.SecurityUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public void logAction(String action, String resourceType, String resourceId, Object beforeObj, Object afterObj,
                          String ip, String userAgent) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setResourceType(resourceType);
        log.setResourceId(resourceId);
        log.setActorEmail(SecurityUtil.currentEmail());
        log.setActorName(SecurityUtil.currentName());
        log.setBeforeJson(toJson(beforeObj));
        log.setAfterJson(toJson(afterObj));
        log.setIp(ip);
        log.setUserAgent(userAgent);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }

    private String toJson(Object obj) {
        if (obj == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return "{\"error\":\"serialization_failed\"}";
        }
    }
}
