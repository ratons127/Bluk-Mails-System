package com.example.bulkemail.api;

import com.example.bulkemail.dto.AudienceCreateRequest;
import com.example.bulkemail.dto.AudiencePreviewResponse;
import com.example.bulkemail.dto.AudienceResponse;
import com.example.bulkemail.service.AudienceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audiences")
@Tag(name = "Audiences")
public class AudienceController {
    private final AudienceService audienceService;

    public AudienceController(AudienceService audienceService) {
        this.audienceService = audienceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','SENDER')")
    public AudienceResponse create(@Valid @RequestBody AudienceCreateRequest request) {
        return audienceService.create(request);
    }

    @PutMapping("/{audienceId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','SENDER')")
    public AudienceResponse update(@PathVariable Long audienceId, @Valid @RequestBody AudienceCreateRequest request) {
        return audienceService.update(audienceId, request);
    }

    @DeleteMapping("/{audienceId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN')")
    public void delete(@PathVariable Long audienceId) {
        audienceService.delete(audienceId);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','SENDER','AUDITOR','APPROVER')")
    public List<AudienceResponse> list() {
        return audienceService.list();
    }

    @GetMapping("/{audienceId}/preview")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HR_ADMIN','DEPT_ADMIN','SENDER','AUDITOR','APPROVER')")
    public AudiencePreviewResponse preview(@PathVariable Long audienceId) {
        return audienceService.preview(audienceId);
    }
}
