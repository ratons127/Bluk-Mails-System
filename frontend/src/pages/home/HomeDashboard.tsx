import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchCampaigns } from "../../api/campaigns";
import PageHeader from "../../components/PageHeader";
import DataTable from "../../components/DataTable";
import { Button } from "../../components/ui/button";
import StatusBadge from "../../components/StatusBadge";

export default function HomeDashboard() {
  const navigate = useNavigate();
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: () => fetchCampaigns() });

  const recent = campaigns.slice(0, 5);
  const kpi = {
    drafts: campaigns.filter((c) => c.status === "DRAFT").length,
    pending: campaigns.filter((c) => c.status === "PENDING_APPROVAL").length,
    scheduled: campaigns.filter((c) => c.status === "SCHEDULED").length,
    sending: campaigns.filter((c) => c.status === "SENDING").length,
    completed: campaigns.filter((c) => c.status === "COMPLETED").length
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Home"
        description="Overview of communication activity across the organization."
      />
      <div className="grid gap-4 md:grid-cols-5">
        <KpiCard label="Drafts" value={kpi.drafts} />
        <KpiCard label="Pending approvals" value={kpi.pending} />
        <KpiCard label="Scheduled today" value={kpi.scheduled} />
        <KpiCard label="Sending now" value={kpi.sending} />
        <KpiCard label="Completed (7d)" value={kpi.completed} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent campaigns</h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/campaigns")}>View all</Button>
          </div>
          <DataTable
            columns={[
              { key: "title", header: "Title", sortable: true },
              { key: "category", header: "Category" },
              { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> }
            ]}
            data={recent}
          />
        </div>
        <div className="m365-card p-4 space-y-3">
          <h2 className="text-lg font-semibold">Quick actions</h2>
          <Button className="w-full" onClick={() => navigate("/campaigns/compose")}>New campaign</Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/audiences")}>New audience</Button>
          <Button variant="outline" className="w-full" onClick={() => navigate("/approvals")}>View approvals</Button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="m365-card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
