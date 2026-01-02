import { useMemo, useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { cn } from "../lib/utils";

export type Column<T> = {
  key: keyof T | string;
  header: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
};

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const clone = [...data];
    clone.sort((a, b) => {
      const av = String(a[sortKey as keyof T] ?? "");
      const bv = String(b[sortKey as keyof T] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return clone;
  }, [data, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  return (
    <div className="m365-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.key)}>
                <button
                  type="button"
                  className={cn("flex items-center gap-1", column.sortable ? "hover:text-ink" : "")}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  {column.header}
                  {column.sortable && <ArrowDownUp className="h-3 w-3" />}
                </button>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center text-sm text-muted">
                No data available.
              </TableCell>
            </TableRow>
          ) : (
            sorted.map((row, idx) => (
              <TableRow key={idx} onClick={() => onRowClick?.(row)} className={onRowClick ? "cursor-pointer" : ""}>
                {columns.map((column) => (
                  <TableCell key={String(column.key)}>
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
