package com.example.bulkemail.sending;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ThrottleService {
    private final Map<Long, Counter> counters = new ConcurrentHashMap<>();

    public synchronized boolean tryConsume(Long smtpAccountId, int perMinute) {
        Counter counter = counters.computeIfAbsent(smtpAccountId, id -> new Counter());
        Instant now = Instant.now();
        if (counter.windowStart == null || now.isAfter(counter.windowStart.plusSeconds(60))) {
            counter.windowStart = now;
            counter.count = 0;
        }
        if (counter.count >= perMinute) {
            return false;
        }
        counter.count++;
        return true;
    }

    private static class Counter {
        private Instant windowStart;
        private int count;
    }
}
