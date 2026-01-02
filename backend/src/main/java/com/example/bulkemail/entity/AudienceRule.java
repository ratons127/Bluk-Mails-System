package com.example.bulkemail.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "audience_rules")
@Getter
@Setter
public class AudienceRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audience_id", nullable = false)
    private Audience audience;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AudienceRuleType ruleType;

    @Column(nullable = false)
    private String ruleValue;
}
