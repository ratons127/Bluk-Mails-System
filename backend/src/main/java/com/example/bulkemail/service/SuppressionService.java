package com.example.bulkemail.service;

import com.example.bulkemail.dto.SuppressionRequest;
import com.example.bulkemail.entity.SuppressionList;
import com.example.bulkemail.repo.SuppressionListRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class SuppressionService {
    private final SuppressionListRepository suppressionListRepository;

    public SuppressionService(SuppressionListRepository suppressionListRepository) {
        this.suppressionListRepository = suppressionListRepository;
    }

    public SuppressionList add(SuppressionRequest request) {
        SuppressionList suppression = suppressionListRepository.findByEmail(request.getEmail())
                .orElseGet(SuppressionList::new);
        suppression.setEmail(request.getEmail());
        suppression.setReason(request.getReason());
        suppression.setCreatedAt(Instant.now());
        return suppressionListRepository.save(suppression);
    }

    public void remove(String email) {
        suppressionListRepository.deleteByEmail(email);
    }

    public boolean isSuppressed(String email) {
        return suppressionListRepository.findByEmail(email).isPresent();
    }

    public List<SuppressionList> list() {
        return suppressionListRepository.findAll();
    }
}
