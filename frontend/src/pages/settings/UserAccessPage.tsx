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
import { fetchUsers, createUser, updateUser, deleteUser, AppUser } from "../../api/users";
import { requestPasswordReset } from "../../api/auth";
import { useToast } from "../../hooks/useToast";
import ServerErrorBanner from "../../components/ServerErrorBanner";

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Admin (Super)" },
  { value: "HR_ADMIN", label: "HR Admin" },
  { value: "DEPT_ADMIN", label: "Department Admin" },
  { value: "APPROVER", label: "Approver" },
  { value: "AUDITOR", label: "Auditor" },
  { value: "SENDER", label: "Member (Sender)" }
];

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  active: z.boolean(),
  roles: z.array(z.string()).min(1, "Select at least one role")
});

type FormValues = z.infer<typeof schema>;

export default function UserAccessPage() {
  const queryClient = useQueryClient();
  const { push } = useToast();
  const [selected, setSelected] = useState<AppUser | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const { data: users = [] } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });
  const selectedIds = useMemo(() => Object.keys(selectedRows).filter((id) => selectedRows[Number(id)]), [selectedRows]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", email: "", password: "", active: true, roles: ["SENDER"] }
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      if (selected?.id) {
        return updateUser(selected.id, {
          fullName: values.fullName,
          active: values.active,
          roles: values.roles
        });
      }
      return createUser({
        email: values.email,
        fullName: values.fullName,
        password: values.password || "",
        roles: values.roles
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      push({ title: "User saved", variant: "success" });
      setSelected(null);
    },
    onError: () => push({ title: "Failed to save user", variant: "error" })
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(deleteIds.map((id) => deleteUser(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      push({ title: "Users deleted", variant: "success" });
      setDeleteIds([]);
      setSelectedRows({});
    },
    onError: () => push({ title: "Failed to delete users", variant: "error" })
  });

  const resetMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: () => push({ title: "Reset email sent", variant: "success" }),
    onError: () => push({ title: "Failed to send reset email", variant: "error" })
  });

  useEffect(() => {
    if (selected) {
      form.reset({
        fullName: selected.fullName || "",
        email: selected.email || "",
        password: "",
        active: selected.active ?? true,
        roles: selected.roles?.length ? selected.roles : ["SENDER"]
      });
    }
  }, [selected, form]);

  return (
    <div className="space-y-6">
      <PageHeader title="User access" description="Manage roles and access levels." />
      <CommandBar
        className="sticky top-0 z-20"
        actions={[
          {
            label: "New user",
            onClick: () =>
              setSelected({ id: 0, email: "", fullName: "", active: true, roles: ["SENDER"] }),
            variant: "default"
          },
          {
            label: "Edit",
            onClick: () => {
              const only =
                selectedIds.length === 1 ? users.find((u) => u.id === Number(selectedIds[0])) : selected;
              if (only) setSelected(only);
            },
            disabled: selectedIds.length !== 1 && !selected
          },
          {
            label: "Send reset email",
            onClick: () => {
              const only =
                selectedIds.length === 1 ? users.find((u) => u.id === Number(selectedIds[0])) : selected;
              if (only) resetMutation.mutate(only.email);
            },
            variant: "outline",
            disabled: selectedIds.length !== 1 && !selected
          },
          {
            label: "Delete",
            onClick: () => {
              setDeleteIds(selectedIds.map((id) => Number(id)));
              setConfirmOpen(true);
            },
            variant: "danger",
            disabled: selectedIds.length === 0
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
                checked={users.length > 0 && users.every((row) => selectedRows[row.id])}
                onChange={(e) => {
                  const next: Record<number, boolean> = {};
                  users.forEach((row) => {
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
          { key: "fullName", header: "Name" },
          { key: "email", header: "Email" },
          {
            key: "roles",
            header: "Roles",
            render: (row) => row.roles?.join(", ") || "-"
          },
          {
            key: "active",
            header: "Status",
            render: (row) => (row.active ? "Active" : "Inactive")
          }
        ]}
        data={users}
        onRowClick={(row) => {
          setSelected(row);
          setSelectedRows({ [row.id]: true });
        }}
      />

      <BladePanel
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title={selected?.id ? "Edit user" : "New user"}
        subtitle="User control"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              onClick={form.handleSubmit((values) => {
                if (!selected?.id && !values.password) {
                  form.setError("password", { message: "Password is required" });
                  return;
                }
                mutation.mutate(values);
              })}
              disabled={mutation.isPending}
            >
              Save
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          {mutation.isError && <ServerErrorBanner message="Unable to save user." />}
          <div className="space-y-1">
            <label className="text-xs text-muted">Full name</label>
            <Input {...form.register("fullName")} />
            {form.formState.errors.fullName && (
              <p className="text-xs text-danger">{form.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Email</label>
            <Input disabled={!!selected?.id} {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
            )}
          </div>
          {!selected?.id && (
            <div className="space-y-1">
              <label className="text-xs text-muted">Temporary password</label>
              <Input type="password" {...form.register("password")} />
              {form.formState.errors.password && (
                <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>
          )}
          <div className="space-y-2">
            <div className="text-xs text-muted">Roles</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {ROLE_OPTIONS.map((role) => {
                const currentRoles = form.watch("roles") || [];
                return (
                <label key={role.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={currentRoles.includes(role.value)}
                    onChange={(e) => {
                      const current = form.getValues("roles") || [];
                      form.setValue(
                        "roles",
                        e.target.checked
                          ? [...current, role.value]
                          : current.filter((r) => r !== role.value)
                      );
                    }}
                  />
                  {role.label}
                </label>
                );
              })}
            </div>
            {form.formState.errors.roles && (
              <p className="text-xs text-danger">{form.formState.errors.roles.message}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.watch("active")} onChange={(e) => form.setValue("active", e.target.checked)} />
            Active user
          </label>
        </form>
      </BladePanel>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete users"
        description="This will permanently remove the selected users."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          deleteMutation.mutate();
        }}
      />
    </div>
  );
}
