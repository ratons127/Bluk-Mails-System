import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import CommandBar from "../../components/CommandBar";
import DataTable from "../../components/DataTable";
import BladePanel from "../../components/BladePanel";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { fetchMyApprovals, approve, reject } from "../../api/approvals";
import { Approval } from "../../types";
import { useToast } from "../../hooks/useToast";
import JsonViewer from "../../components/JsonViewer";
import { fetchCampaign } from "../../api/campaigns";

export default function ApprovalsPage() {
  const [selected, setSelected] = useState<Approval | null>(null);
  const [comment, setComment] = useState("");
  const { push } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals = [] } = useQuery({ queryKey: ["approvals"], queryFn: fetchMyApprovals });
  const { data: campaign } = useQuery({
    queryKey: ["campaign", selected?.campaignId],
    queryFn: () => fetchCampaign(selected!.campaignId),
    enabled: !!selected
  });

  const approveMutation = useMutation({
    mutationFn: () => approve(selected!.id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      push({ title: "Approved", description: "Campaign will move to sending after approvals.", variant: "success" });
      setSelected(null);
    },
    onError: () => push({ title: "Approval failed", variant: "error" })
  });

  const rejectMutation = useMutation({
    mutationFn: () => reject(selected!.id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["approvals"] });
      push({ title: "Rejected", variant: "success" });
      setSelected(null);
    },
    onError: () => push({ title: "Rejection failed", variant: "error" })
  });

  return (
    <div className="space-y-6">
      <PageHeader title="My approvals" description="Review and respond to pending campaign approvals." />
      <CommandBar
        className="sticky top-0 z-20"
        actions={[{ label: "Refresh", onClick: () => window.location.reload(), variant: "outline" }]}
      />
      <DataTable
        columns={[
          { key: "campaignId", header: "Campaign" },
          { key: "requiredRole", header: "Step" },
          { key: "status", header: "Status" },
          { key: "createdAt", header: "Requested" }
        ]}
        data={approvals}
        onRowClick={(row) => setSelected(row)}
      />

      <BladePanel
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Approval review"
        subtitle={`Campaign ${selected?.campaignId ?? ""}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            <Button variant="danger" onClick={() => rejectMutation.mutate()}>
              Reject
            </Button>
            <Button onClick={() => approveMutation.mutate()}>Approve</Button>
          </div>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-muted">Comment</label>
              <Input value={comment} onChange={(e) => setComment(e.target.value)} />
            </div>
            {campaign && (
              <div className="space-y-2">
                <div className="text-xs text-muted">Campaign preview</div>
                <div className="rounded-md border border-slate-200 bg-white p-3 text-sm">
                  <div className="text-xs text-muted">Subject</div>
                  <div className="font-medium">{campaign.subject}</div>
                  <div className="mt-3 text-xs text-muted">HTML</div>
                  <div
                    className="mt-2 rounded-md border border-slate-100 bg-slate-50 p-3 text-sm"
                    dangerouslySetInnerHTML={{ __html: campaign.htmlBody || "" }}
                  />
                  {!campaign.htmlBody && (
                    <div className="mt-2 text-xs text-muted">No HTML content for this campaign.</div>
                  )}
                  {campaign.textBody && (
                    <>
                      <div className="mt-3 text-xs text-muted">Text fallback</div>
                      <pre className="mt-1 whitespace-pre-wrap text-xs text-muted">{campaign.textBody}</pre>
                    </>
                  )}
                </div>
              </div>
            )}
            <div>
              <div className="text-xs text-muted mb-2">Audit trail</div>
              <JsonViewer data={selected} />
            </div>
          </div>
        )}
      </BladePanel>
    </div>
  );
}
