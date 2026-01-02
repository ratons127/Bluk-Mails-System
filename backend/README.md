# Bulk Email Platform (Backend)

## Run (Dev)

```bash
# From /home/raton/backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Run with Docker Compose

```bash
# From /home/raton/backend
mvn -q -DskipTests package
docker-compose up --build
```

## Environment Variables

- `DB_URL` (default: `jdbc:postgresql://localhost:5432/bulk_email`)
- `DB_USER` (default: `bulk_email`)
- `DB_PASSWORD` (default: `bulk_email`)
- `OIDC_ISSUER_URI` (default: `http://localhost:8080/realms/dev`)
- `INTERNAL_DOMAINS` (default: `example.com`)
- `MAX_TEST_RECIPIENTS` (default: `5`)
- `WORKER_POLL_INTERVAL_MS` (default: `5000`)
- `WORKER_BATCH_SIZE` (default: `200`)
- `APP_NOTIFICATION_SMTP_ACCOUNT_ID` (SMTP account ID to send login/reset emails)
- `APP_NOTIFICATION_SENDER_IDENTITY_ID` (Sender identity ID to send login/reset emails)
- `APP_NOTIFICATION_RESET_BASE_URL` (default: `http://localhost:5173/reset-password`)

## Swagger

- `http://localhost:8081/swagger-ui`

## Curl Examples

Set token first:

```bash
export TOKEN="<jwt>"
```

Create audience + rules:

```bash
curl -X POST http://localhost:8081/api/audiences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering US",
    "description": "Active engineers in NY",
    "rules": [
      {"ruleType": "DEPARTMENT", "ruleValue": "Engineering"},
      {"ruleType": "LOCATION", "ruleValue": "New York"},
      {"ruleType": "STATUS", "ruleValue": "ACTIVE"}
    ]
  }'
```

Preview audience:

```bash
curl -X GET http://localhost:8081/api/audiences/1/preview \
  -H "Authorization: Bearer $TOKEN"
```

Create campaign:

```bash
curl -X POST http://localhost:8081/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Q3 Benefits Update",
    "subject": "Benefits enrollment opens Monday",
    "htmlBody": "<p>Details inside</p>",
    "textBody": "Details inside",
    "category": "ORG_WIDE",
    "senderIdentityId": 1,
    "smtpAccountId": 1,
    "attachmentsJson": "[]"
  }'
```

Submit for approval:

```bash
curl -X POST http://localhost:8081/api/campaigns/1/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"audienceIds": [1,2]}'
```

Approve:

```bash
curl -X POST http://localhost:8081/api/approvals/1/approve \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"comment": "Approved"}'
```

Expand and queue:

```bash
curl -X POST http://localhost:8081/api/campaigns/1/expand \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"audienceIds": [1,2]}'

curl -X POST http://localhost:8081/api/campaigns/1/queue \
  -H "Authorization: Bearer $TOKEN"
```

Worker sends (auto via scheduler):

```bash
curl -X GET http://localhost:8081/actuator/health
```

Report summary:

```bash
curl -X GET http://localhost:8081/api/reports/campaigns/1/summary \
  -H "Authorization: Bearer $TOKEN"
```
