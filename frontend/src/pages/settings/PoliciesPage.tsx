import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageHeader from "../../components/PageHeader";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { fetchPolicySettings, updatePolicySettings } from "../../api/settings";
import { PolicySettings } from "../../types";
import { useToast } from "../../hooks/useToast";
import ServerErrorBanner from "../../components/ServerErrorBanner";

export default function PoliciesPage() {
  const { push } = useToast();
  const { data, isError } = useQuery({ queryKey: ["policies"], queryFn: fetchPolicySettings });
  const [form, setForm] = useState<PolicySettings | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: PolicySettings) => updatePolicySettings(payload),
    onSuccess: () => push({ title: "Policies saved", variant: "success" }),
    onError: () => push({ title: "Save failed", variant: "error" })
  });

  const updateField = <K extends keyof PolicySettings>(key: K, value: PolicySettings[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    if (!form) {
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Policies" description="Configure approval rules and send limits." />
      <div className="m365-card p-4 space-y-6">
        {isError && <ServerErrorBanner message="Unable to load policies." />}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Approval rules</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs text-muted">Org-wide campaigns</label>
              <Select
                value={form?.orgWideRule || ""}
                onValueChange={(value) => updateField("orgWideRule", value)}
              >
                <SelectTrigger><SelectValue placeholder="Rule" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR_ADMIN+APPROVER">HR Admin + Approver</SelectItem>
                  <SelectItem value="APPROVER">Approver only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Department campaigns</label>
              <Select
                value={form?.departmentRule || ""}
                onValueChange={(value) => updateField("departmentRule", value)}
              >
                <SelectTrigger><SelectValue placeholder="Rule" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEPT_ADMIN">Dept Admin</SelectItem>
                  <SelectItem value="APPROVER">Approver only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold">Send limits</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1">
              <label className="text-xs text-muted">Max test recipients</label>
              <Input
                type="number"
                min={1}
                value={form?.maxTestRecipients ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  updateField("maxTestRecipients", value === "" ? 0 : Number(value));
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Default throttle / minute</label>
              <Input
                type="number"
                min={1}
                value={form?.defaultThrottlePerMinute ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  updateField("defaultThrottlePerMinute", value === "" ? 0 : Number(value));
                }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted">Window (hours)</label>
              <Input
                type="number"
                min={1}
                value={form?.sendWindowHours ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  updateField("sendWindowHours", value === "" ? 0 : Number(value));
                }}
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!form || mutation.isPending}>Save policies</Button>
        </div>
      </div>
    </div>
  );
}
