import type { Memory } from "@/lib/types";

export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000").replace(/\/$/, "");

async function apiFetch<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(error?.detail ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const listMemories = (token: string) => apiFetch<Memory[]>("/v1/memories", token);
export const createMemory = (token: string, content: string, kind: string) =>
  apiFetch<Memory>("/v1/memories", token, { method: "POST", body: JSON.stringify({ content, kind }) });
export const updateMemory = (token: string, id: string, content: string) =>
  apiFetch<Memory>(`/v1/memories/${id}`, token, { method: "PATCH", body: JSON.stringify({ content }) });
export const deleteMemory = (token: string, id: string) =>
  apiFetch<void>(`/v1/memories/${id}`, token, { method: "DELETE" });

