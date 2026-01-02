import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageHeader from "../../components/PageHeader";
import CommandBar from "../../components/CommandBar";
import DataTable from "../../components/DataTable";
import BladePanel from "../../components/BladePanel";
import ConfirmDialog from "../../components/ConfirmDialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { fetchSuppression, addSuppression, removeSuppression } from "../../api/compliance";
import { SuppressionEntry } from "../../types";
import { useToast } from "../../hooks/useToast";
import ServerErrorBanner from "../../components/ServerErrorBanner";

const schema = z.object({
  email: z.string().email("Valid email required"),
  reason: z.string().min(3, "Reason required"),
  source: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function SuppressionPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [selected, setSelected] = useState<SuppressionEntry | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: suppression = [] } = useQuery({ queryKey: ["suppression"], queryFn: fetchSuppression });

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const addMutation = useMutation({
    mutationFn: addSuppression,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppression"] });
      push({ title: "Added to suppression", variant: "success" });
      setSelected(null);
    },
    onError: () => push({ title: "Failed to add", variant: "error" })
  });

  const removeMutation = useMutation({
    mutationFn: () => removeSuppression(selected!.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppression"] });
      push({ title: "Removed from suppression", variant: "success" });
    }
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Suppression list" description="Manage suppressed recipients." />
      <CommandBar
        actions={[
          { label: "Add", onClick: () => setSelected({ id: 0, email: "", reason: "" }) },
          { label: "Remove", onClick: () => setConfirmOpen(true), variant: "danger", disabled: !selected },
          { label: "Export", onClick: () => window.alert("Export"), variant: "outline" }
        ]}
      />
      <DataTable
        columns={[
          { key: "email", header: "Email" },
          { key: "reason", header: "Reason" },
          { key: "createdAt", header: "Updated" }
        ]}
        data={suppression}
        onRowClick={(row) => setSelected(row)}
      />

      <BladePanel
        open={!!selected && selected.id === 0}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Add suppression"
        subtitle="Compliance"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button onClick={form.handleSubmit((values) => addMutation.mutate(values))}>Add</Button>
          </div>
        }
      >
        <form className="space-y-4">
          {addMutation.isError && <ServerErrorBanner message="Unable to add suppression entry." />}
          <div className="space-y-1">
            <label className="text-xs text-muted">Email</label>
            <Input {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Reason</label>
            <Input {...form.register("reason")} />
            {form.formState.errors.reason && (
              <p className="text-xs text-danger">{form.formState.errors.reason.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Source</label>
            <Input {...form.register("source")} />
          </div>
        </form>
      </BladePanel>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove suppression"
        description="This will re-enable delivery to the recipient."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          removeMutation.mutate();
        }}
      />
    </div>
  );
}
