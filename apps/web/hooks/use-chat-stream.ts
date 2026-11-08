"use client";

import { useCallback, useState } from "react";
import { API_BASE } from "@/lib/api";
import type { ChatEvent } from "@/lib/types";

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (
    message: string,
    token: string,
    conversationId: string | null,
    useMemory: boolean,
    onEvent: (event: ChatEvent) => void,
  ) => {
    setError(null);
    setIsStreaming(true);
    try {
      const response = await fetch(`${API_BASE}/v1/chat/stream`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ conversation_id: conversationId, message, use_memory: useMemory }),
      });
      if (!response.ok || !response.body) {
        const failure = await response.json().catch(() => null) as { detail?: string } | null;
        throw new Error(failure?.detail ?? `Chat request failed (${response.status})`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf("\n\n");
        while (boundary >= 0) {
          const block = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          const eventName = block.match(/^event:\s*(.+)$/m)?.[1]?.trim() ?? "message";
          const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
          if (dataLine) {
            const data = JSON.parse(dataLine.slice(5).trim()) as Record<string, unknown>;
            onEvent({ event: eventName, data });
            if (eventName === "error") throw new Error(String(data.message ?? "Chat stream failed"));
          }
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch (cause) {
      const messageText = cause instanceof Error ? cause.message : "Chat request failed";
      setError(messageText);
      throw cause;
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { send, isStreaming, error };
}
