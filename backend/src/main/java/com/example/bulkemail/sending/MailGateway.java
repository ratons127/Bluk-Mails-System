package com.example.bulkemail.sending;

import com.example.bulkemail.entity.Campaign;
import com.example.bulkemail.entity.CampaignRecipient;

public interface MailGateway {
    void send(Campaign campaign, CampaignRecipient recipient);
}
