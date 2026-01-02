# Bulk Email Admin Frontend

## Install & Run

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env` and set:

```
VITE_API_BASE_URL=http://localhost:8081
```

## Dev Auth

Use the login page to paste a JWT token. The token is stored in `localStorage` under `bulk_email_token`.

## Prod Auth (Scaffold)

The login page includes a placeholder “Sign in with SSO” button. Wire it to your OIDC redirect flow.

## Notes

- Role-based navigation and route guards are enforced for admin-only pages.
- Right-side blade panels are implemented via Sheet components.
- Command bars, filters, and table-heavy layouts mirror Microsoft 365 Admin Center patterns.
