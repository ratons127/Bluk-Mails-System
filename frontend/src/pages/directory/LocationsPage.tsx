import { useEffect, useMemo, useState } from "react";
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
import { fetchLocations, createLocation, updateLocation, deleteLocation } from "../../api/directory";
import { Location } from "../../types";
import { useToast } from "../../hooks/useToast";
import ServerErrorBanner from "../../components/ServerErrorBanner";
import { useAuth, hasRole } from "../../lib/auth";

const schema = z.object({
  name: z.string().min(2, "Name is required")
});

type FormValues = z.infer<typeof schema>;

export default function LocationsPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const { user } = useAuth();
  const [selected, setSelected] = useState<Location | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });
  const selectedIds = useMemo(() => Object.keys(selectedRows).filter((id) => selectedRows[Number(id)]), [selectedRows]);

  const form = useForm<FormValues>({ resolver: zodResolver(schema) });
  const mutation = useMutation({
    mutationFn: (payload: Partial<Location>) =>
      selected?.id ? updateLocation(selected.id, payload) : createLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      push({ title: "Location saved", variant: "success" });
      setSelected(null);
    },
    onError: () => push({ title: "Failed to save location", variant: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(deleteIds.map((id) => deleteLocation(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      push({ title: "Locations deleted", variant: "success" });
      setSelected(null);
      setDeleteIds([]);
      setSelectedRows({});
    },
    onError: () => push({ title: "Failed to delete location", variant: "error" })
  });

  useEffect(() => {
    if (selected) {
      form.reset({ name: selected.name || "" });
    }
  }, [selected, form]);

  return (
    <div className="space-y-6">
      <PageHeader title="Locations" description="Manage physical and virtual locations." />
      <CommandBar
        className="sticky top-0 z-20"
        actions={[
          {
            label: "New",
            onClick: () => setSelected({ id: 0, name: "" }),
            disabled: !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN"])
          },
          {
            label: "Edit",
            onClick: () => {
              const only = selectedIds.length === 1 ? locations.find((l) => l.id === Number(selectedIds[0])) : null;
              if (only) setSelected(only);
            },
            disabled: selectedIds.length !== 1 || !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN"])
          },
          {
            label: "Delete",
            onClick: () => {
              setDeleteIds(selectedIds.map((id) => Number(id)));
              setConfirmOpen(true);
            },
            variant: "danger",
            disabled: selectedIds.length === 0 || !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN"])
          },
          { label: "Refresh", onClick: () => window.location.reload(), variant: "outline" }
        ]}
      />
      <DataTable
        columns={[
          {
            key: "select",
            header: (
              <input
                type="checkbox"
                checked={locations.length > 0 && locations.every((row) => selectedRows[row.id])}
                onChange={(e) => {
                  const next: Record<number, boolean> = {};
                  locations.forEach((row) => {
                    next[row.id] = e.target.checked;
                  });
                  setSelectedRows(next);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ),
            render: (row) => (
              <input
                type="checkbox"
                checked={!!selectedRows[row.id]}
                onChange={(e) => {
                  setSelectedRows((prev) => ({ ...prev, [row.id]: e.target.checked }));
                }}
                onClick={(e) => e.stopPropagation()}
              />
            )
          },
          { key: "name", header: "Location", sortable: true }
        ]}
        data={locations}
      />

      <BladePanel
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.id ? "Edit location" : "New location"}
        subtitle="Directory"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit((values) => mutation.mutate(values))}>Save</Button>
          </div>
        }
      >
        <form className="space-y-4">
          {mutation.isError && <ServerErrorBanner message="Unable to save location. Check inputs and try again." />}
          <div className="space-y-1">
            <label className="text-xs text-muted">Location name</label>
            <Input defaultValue={selected?.name} {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-xs text-danger">{form.formState.errors.name.message}</p>
            )}
          </div>
        </form>
      </BladePanel>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete location"
        description="This will remove the location from the directory."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          if (deleteIds.length > 0) {
            deleteMutation.mutate();
          }
        }}
      />
    </div>
  );
}
