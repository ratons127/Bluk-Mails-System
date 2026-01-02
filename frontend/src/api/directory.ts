import apiClient from "../lib/apiClient";
import { Department, Employee, Location } from "../types";

export async function fetchEmployees(params?: Record<string, any>) {
  const { data } = await apiClient.get<Employee[]>("/api/directory/employees", { params });
  return data;
}

export async function createEmployee(payload: Partial<Employee>) {
  const { data } = await apiClient.post<Employee>("/api/directory/employees", payload);
  return data;
}

export async function updateEmployee(id: number, payload: Partial<Employee>) {
  const { data } = await apiClient.put<Employee>(`/api/directory/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: number) {
  const { data } = await apiClient.delete(`/api/directory/employees/${id}`);
  return data;
}

export async function bulkEmployees(payload: { ids: number[]; action: "DELETE" | "DEACTIVATE" }) {
  const { data } = await apiClient.post("/api/directory/employees/bulk", payload);
  return data;
}

export async function fetchDepartments() {
  const { data } = await apiClient.get<Department[]>("/api/directory/departments");
  return data;
}

export async function fetchLocations() {
  const { data } = await apiClient.get<Location[]>("/api/directory/locations");
  return data;
}

export async function createDepartment(payload: Partial<Department>) {
  const { data } = await apiClient.post<Department>("/api/directory/departments", payload);
  return data;
}

export async function updateDepartment(id: number, payload: Partial<Department>) {
  const { data } = await apiClient.put<Department>(`/api/directory/departments/${id}`, payload);
  return data;
}

export async function deleteDepartment(id: number) {
  const { data } = await apiClient.delete(`/api/directory/departments/${id}`);
  return data;
}

export async function createLocation(payload: Partial<Location>) {
  const { data } = await apiClient.post<Location>("/api/directory/locations", payload);
  return data;
}

export async function updateLocation(id: number, payload: Partial<Location>) {
  const { data } = await apiClient.put<Location>(`/api/directory/locations/${id}`, payload);
  return data;
}

export async function deleteLocation(id: number) {
  const { data } = await apiClient.delete(`/api/directory/locations/${id}`);
  return data;
}

export async function importEmployees(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<string>("/api/directory/employees/import", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
