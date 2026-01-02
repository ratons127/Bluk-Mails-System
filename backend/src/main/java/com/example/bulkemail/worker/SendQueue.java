package com.example.bulkemail.worker;

import com.example.bulkemail.entity.CampaignRecipient;

import java.util.List;

public interface SendQueue {
    void enqueue(List<CampaignRecipient> recipients);
    List<CampaignRecipient> dequeue(int batchSize);
}
