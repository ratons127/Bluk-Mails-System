package com.example.bulkemail.dto;

import lombok.Data;

import java.time.Instant;

@Data
public class CampaignAttachment {
    private String id;
    private String originalName;
    private String storedName;
    private long size;
    private String contentType;
    private Instant uploadedAt;
}
