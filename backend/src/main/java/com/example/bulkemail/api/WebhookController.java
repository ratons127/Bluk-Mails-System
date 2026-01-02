package com.example.bulkemail.api;

import com.example.bulkemail.audit.AuditService;
import com.example.bulkemail.dto.SuppressionRequest;
import com.example.bulkemail.service.SuppressionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@Tag(name = "Webhooks")
public class WebhookController {
    private final SuppressionService suppressionService;
    private final AuditService auditService;

    public WebhookController(SuppressionService suppressionService, AuditService auditService) {
        this.suppressionService = suppressionService;
        this.auditService = auditService;
    }

    @PostMapping("/ses")
    public String sesWebhook(@RequestBody String payload) {
        auditService.logAction("SES_WEBHOOK_RECEIVED", "webhook", null, null, payload, null, null);
        return "accepted";
    }

    @PostMapping("/ses/bounce")
    public String sesBounce(@RequestParam String email) {
        SuppressionRequest request = new SuppressionRequest();
        request.setEmail(email);
        request.setReason("SES bounce");
        suppressionService.add(request);
        return "suppressed";
    }
}
