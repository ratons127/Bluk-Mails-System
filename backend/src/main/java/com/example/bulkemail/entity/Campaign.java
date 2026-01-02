package com.example.bulkemail.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "campaigns")
@Getter
@Setter
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "text")
    private String htmlBody;

    @Column(columnDefinition = "text")
    private String textBody;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_identity_id", nullable = false)
    private SenderIdentity senderIdentity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "smtp_account_id", nullable = false)
    private SmtpAccount smtpAccount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status;

    private Instant scheduledAt;

    private Instant sendWindowStart;

    private Instant sendWindowEnd;

    @Column(columnDefinition = "text")
    private String attachmentsJson;

    private boolean emergencyBypass;

    private String emergencyReason;

    @Column(nullable = false)
    private String createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant updatedAt;
}
