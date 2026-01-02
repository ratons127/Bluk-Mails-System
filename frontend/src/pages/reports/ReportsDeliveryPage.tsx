import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PageHeader from "../../components/PageHeader";
import FilterBar from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { fetchCampaigns } from "../../api/campaigns";

export default function ReportsDeliveryPage() {
  const { data: campaigns = [] } = useQuery({ queryKey: ["campaigns"], queryFn: fetchCampaigns });

  const chartData = useMemo(
    () => [
      { name: "Sent", value: campaigns.filter((c) => c.status === "COMPLETED").length },
      { name: "Failed", value: campaigns.filter((c) => c.status === "REJECTED").length },
      { name: "Suppressed", value: 12 }
    ],
    [campaigns]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Delivery summary" description="Monitor delivery outcomes by campaign." />
      <FilterBar>
        <Input placeholder="Date range" />
        <Select>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <div className="m365-card p-4">
        <div className="text-sm font-semibold mb-2">Delivery outcomes</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#0f6cbd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <DataTable
        columns={[
          { key: "title", header: "Campaign" },
          { key: "category", header: "Category" },
          { key: "status", header: "Status" },
          { key: "createdBy", header: "Owner" }
        ]}
        data={campaigns}
      />
    </div>
  );
}
