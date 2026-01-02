package com.example.bulkemail.api;

import com.example.bulkemail.dto.SuppressionRequest;
import com.example.bulkemail.audit.AuditService;
import com.example.bulkemail.entity.SuppressionList;
import com.example.bulkemail.service.SuppressionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppression")
@Tag(name = "Suppression")
public class SuppressionController {
    private final SuppressionService suppressionService;
    private final AuditService auditService;

    public SuppressionController(SuppressionService suppressionService, AuditService auditService) {
        this.suppressionService = suppressionService;
        this.auditService = auditService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public SuppressionList add(@Valid @RequestBody SuppressionRequest request, HttpServletRequest http) {
        SuppressionList entry = suppressionService.add(request);
        auditService.logAction("SUPPRESSION_ADD", "suppression", entry.getId().toString(), null, entry, ip(http), userAgent(http));
        return entry;
    }

    @DeleteMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public void remove(@RequestParam String email, HttpServletRequest http) {
        suppressionService.remove(email);
        auditService.logAction("SUPPRESSION_REMOVE", "suppression", email, null, null, ip(http), userAgent(http));
    }

    private String ip(HttpServletRequest request) {
        return request.getRemoteAddr();
    }

    private String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','AUDITOR')")
    public List<SuppressionList> list() {
        return suppressionService.list();
    }
}
