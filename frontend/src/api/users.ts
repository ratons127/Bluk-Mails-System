import apiClient from "../lib/apiClient";

export type AppUser = {
  id: number;
  email: string;
  fullName: string;
  active: boolean;
  roles: string[];
};

export async function fetchUsers() {
  const { data } = await apiClient.get<AppUser[]>("/api/users");
  return data;
}

export async function createUser(payload: {
  email: string;
  fullName: string;
  password: string;
  roles: string[];
}) {
  const { data } = await apiClient.post<AppUser>("/api/users", payload);
  return data;
}

export async function updateUser(
  id: number,
  payload: { fullName?: string; active?: boolean; roles?: string[] }
) {
  const { data } = await apiClient.put<AppUser>(`/api/users/${id}`, payload);
  return data;
}

export async function deleteUser(id: number) {
  const { data } = await apiClient.delete(`/api/users/${id}`);
  return data;
}
