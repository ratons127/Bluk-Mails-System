package com.example.bulkemail.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private List<String> internalDomains;
    private Approval approval = new Approval();
    private Sending sending = new Sending();
    private Throttle throttle = new Throttle();

    public List<String> getInternalDomains() {
        return internalDomains;
    }

    public void setInternalDomains(List<String> internalDomains) {
        this.internalDomains = internalDomains;
    }

    public Approval getApproval() {
        return approval;
    }

    public void setApproval(Approval approval) {
        this.approval = approval;
    }

    public Sending getSending() {
        return sending;
    }

    public void setSending(Sending sending) {
        this.sending = sending;
    }

    public Throttle getThrottle() {
        return throttle;
    }

    public void setThrottle(Throttle throttle) {
        this.throttle = throttle;
    }

    public static class Approval {
        private boolean deptApprovalEnabled = true;

        public boolean isDeptApprovalEnabled() {
            return deptApprovalEnabled;
        }

        public void setDeptApprovalEnabled(boolean deptApprovalEnabled) {
            this.deptApprovalEnabled = deptApprovalEnabled;
        }
    }

    public static class Sending {
        private int maxTestRecipients = 5;
        private Worker worker = new Worker();

        public int getMaxTestRecipients() {
            return maxTestRecipients;
        }

        public void setMaxTestRecipients(int maxTestRecipients) {
            this.maxTestRecipients = maxTestRecipients;
        }

        public Worker getWorker() {
            return worker;
        }

        public void setWorker(Worker worker) {
            this.worker = worker;
        }

        public static class Worker {
            private long pollIntervalMs = 5000;
            private int batchSize = 200;

            public long getPollIntervalMs() {
                return pollIntervalMs;
            }

            public void setPollIntervalMs(long pollIntervalMs) {
                this.pollIntervalMs = pollIntervalMs;
            }

            public int getBatchSize() {
                return batchSize;
            }

            public void setBatchSize(int batchSize) {
                this.batchSize = batchSize;
            }
        }
    }

    public static class Throttle {
        private int defaultPerMinute = 500;

        public int getDefaultPerMinute() {
            return defaultPerMinute;
        }

        public void setDefaultPerMinute(int defaultPerMinute) {
            this.defaultPerMinute = defaultPerMinute;
        }
    }
}
