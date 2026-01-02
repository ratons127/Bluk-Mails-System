CREATE TABLE departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES departments(id)
);

CREATE TABLE locations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    department_id BIGINT REFERENCES departments(id),
    location_id BIGINT REFERENCES locations(id),
    external_id VARCHAR(255)
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_location ON employees(location_id);
CREATE INDEX idx_employees_status ON employees(status);

CREATE TABLE audiences (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(500),
    created_by VARCHAR(320) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE audience_rules (
    id BIGSERIAL PRIMARY KEY,
    audience_id BIGINT NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
    rule_type VARCHAR(50) NOT NULL,
    rule_value VARCHAR(255) NOT NULL
);

CREATE INDEX idx_audience_rules_audience ON audience_rules(audience_id);

CREATE TABLE smtp_accounts (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    provider VARCHAR(50) NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    username VARCHAR(255),
    password VARCHAR(255),
    use_tls BOOLEAN NOT NULL,
    throttle_per_minute INTEGER NOT NULL
);

CREATE TABLE sender_identities (
    id BIGSERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    email VARCHAR(320) NOT NULL,
    smtp_account_id BIGINT NOT NULL REFERENCES smtp_accounts(id)
);

CREATE TABLE campaigns (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_body TEXT,
    text_body TEXT,
    category VARCHAR(50) NOT NULL,
    sender_identity_id BIGINT NOT NULL REFERENCES sender_identities(id),
    smtp_account_id BIGINT NOT NULL REFERENCES smtp_accounts(id),
    status VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    send_window_start TIMESTAMP WITH TIME ZONE,
    send_window_end TIMESTAMP WITH TIME ZONE,
    attachments_json TEXT,
    emergency_bypass BOOLEAN NOT NULL DEFAULT FALSE,
    emergency_reason VARCHAR(500),
    created_by VARCHAR(320) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_campaigns_status ON campaigns(status);

CREATE TABLE campaign_audiences (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    audience_id BIGINT NOT NULL REFERENCES audiences(id),
    UNIQUE (campaign_id, audience_id)
);

CREATE TABLE approvals (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    required_role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    approver_email VARCHAR(320),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    acted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_approvals_status_role ON approvals(status, required_role);

CREATE TABLE campaign_recipients (
    id BIGSERIAL PRIMARY KEY,
    campaign_id BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email VARCHAR(320) NOT NULL,
    full_name VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    last_error TEXT,
    retry_count INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE (campaign_id, email)
);

CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);

CREATE TABLE suppression_list (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(320) NOT NULL UNIQUE,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    source VARCHAR(255)
);

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_email VARCHAR(320) NOT NULL,
    actor_name VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    before_json TEXT,
    after_json TEXT,
    ip VARCHAR(64),
    user_agent VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
