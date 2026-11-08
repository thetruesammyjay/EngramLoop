"use client";

import { useCallback, useEffect, useState } from "react";
import { createMemory, deleteMemory, listMemories, updateMemory } from "@/lib/api";
import type { Memory } from "@/lib/types";

export function useMemories(token: string | null) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setMemories(await listMemories(token));
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Memories could not be loaded");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void refresh(); }, [refresh]);

  const add = async (content: string, kind: string) => {
    if (!token) throw new Error("Sign in to save a memory");
    const memory = await createMemory(token, content, kind);
    setMemories((current) => [memory, ...current]);
  };
  const edit = async (id: string, content: string) => {
    if (!token) throw new Error("Sign in to edit a memory");
    const memory = await updateMemory(token, id, content);
    setMemories((current) => current.map((item) => item.id === id ? memory : item));
  };
  const remove = async (id: string) => {
    if (!token) throw new Error("Sign in to delete a memory");
    await deleteMemory(token, id);
    setMemories((current) => current.filter((item) => item.id !== id));
  };

  return { memories, loading, error, refresh, add, edit, remove };
}
