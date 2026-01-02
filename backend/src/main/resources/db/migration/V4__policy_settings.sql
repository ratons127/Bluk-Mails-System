create table if not exists policy_settings (
  id bigint primary key,
  org_wide_rule varchar(64) not null,
  department_rule varchar(64) not null,
  max_test_recipients integer not null,
  default_throttle_per_minute integer not null,
  send_window_hours integer not null
);
