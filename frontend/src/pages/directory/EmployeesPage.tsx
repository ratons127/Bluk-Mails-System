import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PageHeader from "../../components/PageHeader";
import CommandBar from "../../components/CommandBar";
import FilterBar from "../../components/FilterBar";
import DataTable from "../../components/DataTable";
import BladePanel from "../../components/BladePanel";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  fetchEmployees,
  fetchDepartments,
  fetchLocations,
  importEmployees,
  updateEmployee,
  bulkEmployees
} from "../../api/directory";
import { Employee } from "../../types";
import { useAuth, hasRole } from "../../lib/auth";
import { useToast } from "../../hooks/useToast";
import ServerErrorBanner from "../../components/ServerErrorBanner";

const schema = z.object({
  email: z.string().email("Valid email is required"),
  fullName: z.string().min(2, "Name is required"),
  externalId: z.string().optional(),
  title: z.string().optional(),
  whatsappNumber: z.string().optional(),
  departmentId: z.string().optional(),
  locationId: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"])
});

type FormValues = z.infer<typeof schema>;

export default function EmployeesPage() {
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<"DELETE" | "DEACTIVATE">("DELETE");
  const { user } = useAuth();
  const { push } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", departmentId, locationId, status],
    queryFn: () =>
      fetchEmployees({
        departmentId: departmentId || undefined,
        locationId: locationId || undefined,
        status: status || undefined
      })
  });

  const { data: departments = [] } = useQuery({ queryKey: ["departments"], queryFn: fetchDepartments });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });
  const importMutation = useMutation({
    mutationFn: () => importEmployees(importFile!),
    onSuccess: (message) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      push({ title: "Import complete", description: String(message), variant: "success" });
      setImportOpen(false);
      setImportFile(null);
    },
    onError: () => push({ title: "Import failed", variant: "error" })
  });

  const editForm = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: "ACTIVE" }
  });

  const updateMutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateEmployee(editEmployee!.id, {
        email: values.email,
        fullName: values.fullName,
        externalId: values.externalId,
        title: values.title,
        whatsappNumber: values.whatsappNumber,
        departmentId: values.departmentId ? Number(values.departmentId) : undefined,
        locationId: values.locationId ? Number(values.locationId) : undefined,
        status: values.status
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      push({ title: "Employee updated", variant: "success" });
      setEditEmployee(null);
    },
    onError: () => push({ title: "Update failed", variant: "error" })
  });

  const selectedIds = useMemo(
    () => Object.keys(selectedRows).filter((id) => selectedRows[Number(id)]),
    [selectedRows]
  );

  const bulkMutation = useMutation({
    mutationFn: (action: "DELETE" | "DEACTIVATE") =>
      bulkEmployees({ ids: selectedIds.map(Number), action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      push({ title: "Bulk action complete", variant: "success" });
      setSelectedRows({});
    },
    onError: () => push({ title: "Bulk action failed", variant: "error" })
  });

  const filtered = useMemo(() => {
    const departmentMap = new Map(departments.map((d) => [d.id, d.name]));
    const locationMap = new Map(locations.map((l) => [l.id, l.name]));
    const enriched = employees.map((e) => ({
      ...e,
      departmentName: departmentMap.get(e.departmentId || 0) || "-",
      locationName: locationMap.get(e.locationId || 0) || "-",
      whatsappNumber: e.whatsappNumber || "-"
    }));
    if (!search) return enriched;
    return enriched.filter((e) =>
      [e.email, e.fullName, e.externalId, e.title].some((val) =>
        val?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [employees, search, departments, locations]);

  const resetEditForm = (employee: Employee) => {
    editForm.reset({
      email: employee.email || "",
      fullName: employee.fullName || "",
      externalId: employee.externalId || "",
      title: employee.title || "",
      whatsappNumber: employee.whatsappNumber || "",
      departmentId: employee.departmentId ? String(employee.departmentId) : "",
      locationId: employee.locationId ? String(employee.locationId) : "",
      status: employee.status || "ACTIVE"
    });
  };

  useEffect(() => {
    if (editEmployee) {
      resetEditForm(editEmployee);
    }
  }, [editEmployee]);

  const exportSelected = (rows: Employee[]) => {
    const selected = rows.filter((row) => selectedRows[row.id]);
    if (selected.length === 0) {
      push({ title: "No employees selected", variant: "info" });
      return;
    }
    const headers = [
      "Employee ID",
      "Employee Name",
      "Designation",
      "Department",
      "Branch/SBU",
      "Whats App Number",
      "Email Address"
    ];
    const lines = selected.map((row) => [
      row.externalId || "",
      row.fullName || "",
      row.title || "",
      row.departmentName || "",
      row.locationName || "",
      row.whatsappNumber || "",
      row.email || ""
    ]);
    const csv = [headers.join(","), ...lines.map((line) => line.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employees_selected.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    push({ title: "Exported selected employees", variant: "success" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Employees" description="Search and review employee directory data." />
      <CommandBar
        className="sticky top-0 z-20"
        actions={[
          {
            label: "Edit",
            onClick: () => {
              const only = selectedIds.length === 1 ? filtered.find((row) => row.id === Number(selectedIds[0])) : null;
              if (only) {
                setEditEmployee(only);
                resetEditForm(only);
              }
            },
            disabled: selectedIds.length !== 1 || !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN", "DEPT_ADMIN"])
          },
          {
            label: "Import CSV",
            onClick: () => setImportOpen(true),
            variant: "outline",
            disabled: !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN"])
          },
          {
            label: "Deactivate selected",
            onClick: () => {
              setBulkAction("DEACTIVATE");
              setConfirmOpen(true);
            },
            variant: "outline",
            disabled: selectedIds.length === 0 || !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN"])
          },
          {
            label: "Delete selected",
            onClick: () => {
              setBulkAction("DELETE");
              setConfirmOpen(true);
            },
            variant: "danger",
            disabled: selectedIds.length === 0 || !hasRole(user, ["SUPER_ADMIN", "HR_ADMIN"])
          },
          {
            label: "Export Selected",
            onClick: () => exportSelected(filtered),
            variant: "outline",
            disabled: Object.values(selectedRows).every((v) => !v)
          },
          {
            label: "Clear Selection",
            onClick: () => setSelectedRows({}),
            variant: "ghost",
            disabled: Object.values(selectedRows).every((v) => !v)
          },
          { label: "Refresh", onClick: () => window.location.reload(), variant: "outline" }
        ]}
      />
      <FilterBar>
        <Input
          placeholder="Search by email, name, or employee ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={departmentId} onValueChange={setDepartmentId}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={locationId} onValueChange={setLocationId}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Location" /></SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          {
            key: "select",
            header: (
              <input
                type="checkbox"
                checked={filtered.length > 0 && filtered.every((row) => selectedRows[row.id])}
                onChange={(e) => {
                  const next: Record<number, boolean> = {};
                  filtered.forEach((row) => {
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
                onChange={(e) =>
                  setSelectedRows((prev) => ({ ...prev, [row.id]: e.target.checked }))
                }
                onClick={(e) => e.stopPropagation()}
              />
            )
          },
          { key: "externalId", header: "Employee ID", sortable: true },
          { key: "fullName", header: "Employee Name" },
          { key: "title", header: "Designation" },
          { key: "departmentName", header: "Department" },
          { key: "locationName", header: "Branch/SBU" },
          { key: "whatsappNumber", header: "Whats App Number" },
          { key: "email", header: "Email Address" },
          { key: "status", header: "Status", render: (row) => <StatusBadge value={row.status} /> }
        ]}
        data={filtered}
        onRowClick={(row) => setSelected(row)}
      />

      <BladePanel
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        title="Employee details"
        subtitle={selected?.email}
      >
        {selected && (
          <div className="space-y-4 text-sm">
            <Detail label="Name" value={selected.fullName} />
            <Detail label="Email" value={selected.email} />
            <Detail label="Employee ID" value={selected.externalId || "-"} />
            <Detail label="Title" value={selected.title || "-"} />
            <Detail label="Department" value={selected.departmentName || "-"} />
            <Detail label="Location" value={selected.locationName || "-"} />
            <Detail label="Whats App Number" value={selected.whatsappNumber || "-"} />
            <Detail label="Status" value={selected.status} />
          </div>
        )}
      </BladePanel>

      <BladePanel
        open={!!editEmployee}
        onOpenChange={(open) => !open && setEditEmployee(null)}
        title="Edit employee"
        subtitle={editEmployee?.email}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditEmployee(null)}>
              Cancel
            </Button>
            <Button
              onClick={editForm.handleSubmit((values) => updateMutation.mutate(values))}
              disabled={updateMutation.isPending}
            >
              Save
            </Button>
          </div>
        }
      >
        <form className="space-y-4 text-sm">
          {updateMutation.isError && <ServerErrorBanner message="Unable to update employee." />}
          <div className="space-y-1">
            <label className="text-xs text-muted">Employee ID</label>
            <Input {...editForm.register("externalId")} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Employee Name</label>
            <Input {...editForm.register("fullName")} />
            {editForm.formState.errors.fullName && (
              <p className="text-xs text-danger">{editForm.formState.errors.fullName.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Designation</label>
            <Input {...editForm.register("title")} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Department</label>
            <Select
              value={editForm.watch("departmentId") || ""}
              onValueChange={(value) => editForm.setValue("departmentId", value)}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Branch/SBU</label>
            <Select
              value={editForm.watch("locationId") || ""}
              onValueChange={(value) => editForm.setValue("locationId", value)}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={String(loc.id)}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Whats App Number</label>
            <Input {...editForm.register("whatsappNumber")} />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Email</label>
            <Input {...editForm.register("email")} />
            {editForm.formState.errors.email && (
              <p className="text-xs text-danger">{editForm.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted">Status</label>
            <Select
              value={editForm.watch("status")}
              onValueChange={(value) => editForm.setValue("status", value as "ACTIVE" | "INACTIVE")}
            >
              <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </BladePanel>

      <BladePanel
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import employees"
        subtitle="CSV upload"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={!importFile || importMutation.isPending}
            >
              Upload
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-sm">
          {importMutation.isError && <ServerErrorBanner message="CSV import failed." />}
          <p className="text-muted">
            CSV headers: Employee ID, Employee Name, Designation, Department, Branch/SBU,
            Whats App Number, Email Address. Department and location names will be created if missing.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
          />
        </div>
      </BladePanel>

      <ConfirmDialog
        open={confirmOpen}
        title={bulkAction === "DELETE" ? "Delete employees" : "Deactivate employees"}
        description={
          bulkAction === "DELETE"
            ? "This will permanently remove the selected employees."
            : "This will mark the selected employees as inactive."
        }
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          bulkMutation.mutate(bulkAction);
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
