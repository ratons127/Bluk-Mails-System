package com.example.bulkemail.service;

import com.example.bulkemail.config.AppProperties;
import com.example.bulkemail.dto.PolicySettingsRequest;
import com.example.bulkemail.dto.PolicySettingsResponse;
import com.example.bulkemail.entity.PolicySettings;
import com.example.bulkemail.repo.PolicySettingsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PolicySettingsService {
    private static final long SETTINGS_ID = 1L;

    private final PolicySettingsRepository repository;
    private final AppProperties appProperties;

    public PolicySettingsService(PolicySettingsRepository repository, AppProperties appProperties) {
        this.repository = repository;
        this.appProperties = appProperties;
    }

    public PolicySettingsResponse getSettings() {
        PolicySettings settings = repository.findById(SETTINGS_ID).orElseGet(this::createDefault);
        return toResponse(settings);
    }

    public PolicySettingsResponse updateSettings(PolicySettingsRequest request) {
        validateOrgRule(request.getOrgWideRule());
        validateDepartmentRule(request.getDepartmentRule());
        PolicySettings settings = repository.findById(SETTINGS_ID).orElseGet(this::createDefault);
        settings.setOrgWideRule(request.getOrgWideRule());
        settings.setDepartmentRule(request.getDepartmentRule());
        settings.setMaxTestRecipients(request.getMaxTestRecipients());
        settings.setDefaultThrottlePerMinute(request.getDefaultThrottlePerMinute());
        settings.setSendWindowHours(request.getSendWindowHours());
        return toResponse(repository.save(settings));
    }

    public PolicySettings getEffectiveSettings() {
        return repository.findById(SETTINGS_ID).orElseGet(this::createDefault);
    }

    private PolicySettings createDefault() {
        PolicySettings settings = new PolicySettings();
        settings.setId(SETTINGS_ID);
        settings.setOrgWideRule("HR_ADMIN+APPROVER");
        settings.setDepartmentRule(appProperties.getApproval().isDeptApprovalEnabled() ? "DEPT_ADMIN" : "APPROVER");
        settings.setMaxTestRecipients(appProperties.getSending().getMaxTestRecipients());
        settings.setDefaultThrottlePerMinute(appProperties.getThrottle().getDefaultPerMinute());
        settings.setSendWindowHours(2);
        return repository.save(settings);
    }

    private PolicySettingsResponse toResponse(PolicySettings settings) {
        PolicySettingsResponse response = new PolicySettingsResponse();
        response.setOrgWideRule(settings.getOrgWideRule());
        response.setDepartmentRule(settings.getDepartmentRule());
        response.setMaxTestRecipients(settings.getMaxTestRecipients());
        response.setDefaultThrottlePerMinute(settings.getDefaultThrottlePerMinute());
        response.setSendWindowHours(settings.getSendWindowHours());
        return response;
    }

    private void validateOrgRule(String rule) {
        if (rule == null || rule.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approval rule required");
        }
        if (!rule.equals("HR_ADMIN+APPROVER") && !rule.equals("APPROVER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid org-wide approval rule");
        }
    }

    private void validateDepartmentRule(String rule) {
        if (rule == null || rule.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Approval rule required");
        }
        if (!rule.equals("DEPT_ADMIN") && !rule.equals("APPROVER")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid department approval rule");
        }
    }
}
