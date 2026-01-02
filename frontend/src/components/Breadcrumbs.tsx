import { Link, useLocation } from "react-router-dom";

const labelMap: Record<string, string> = {
  directory: "Directory",
  employees: "Employees",
  departments: "Departments",
  locations: "Locations",
  audiences: "Audiences",
  campaigns: "Campaigns",
  compose: "Compose",
  approvals: "Approvals",
  reports: "Reports",
  delivery: "Delivery summary",
  analytics: "Campaign analytics",
  compliance: "Compliance",
  suppression: "Suppression list",
  audit: "Audit logs",
  settings: "Settings",
  "sender-identities": "Sender identities",
  "smtp-accounts": "SMTP accounts",
  policies: "Policies"
};

export default function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <Link to="/" className="hover:text-ink">
        Home
      </Link>
      {segments.map((segment, index) => {
        const path = `/${segments.slice(0, index + 1).join("/")}`;
        const label = labelMap[segment] || segment;
        return (
          <div key={path} className="flex items-center gap-2">
            <span>/</span>
            <Link to={path} className="hover:text-ink">
              {label}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
