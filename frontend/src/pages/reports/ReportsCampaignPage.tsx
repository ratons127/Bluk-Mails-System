import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import FilterBar from "../../components/FilterBar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import DataTable from "../../components/DataTable";
import { fetchCampaigns } from "../../api/campaigns";

export default function ReportsCampaignPage() {
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: fetchCampaigns });
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="space-y-6">
      <PageHeader title="Campaign analytics" description="Track delivery performance per campaign." />
      <FilterBar>
        <Input placeholder="Search campaign" />
      </FilterBar>

      {selected && (
        <div className="m365-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{selected.title}</div>
            <Button variant="outline" size="sm">Export CSV</Button>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-primary" style={{ width: "72%" }} />
          </div>
          <div className="text-xs text-muted">Progress: 72% sent</div>
        </div>
      )}

      <DataTable
        columns={[
          { key: "title", header: "Campaign" },
          { key: "status", header: "Status" },
          { key: "category", header: "Category" },
          { key: "createdBy", header: "Owner" }
        ]}
        data={campaigns}
        onRowClick={(row) => setSelected(row)}
      />
    </div>
  );
}
