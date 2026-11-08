export type MemoryKind = "preference" | "fact" | "project_context" | "instruction" | "episodic_summary";

export type MemorySource = {
  message_id: string | null;
  extraction_run_id: string | null;
  quote: string | null;
  created_at: string;
};

export type Memory = {
  id: string;
  kind: MemoryKind;
  content: string;
  state: string;
  confidence: number;
  version: number;
  created_at: string;
  updated_at: string;
  sources: MemorySource[];
};

export type ChatEvent = {
  event: string;
  data: Record<string, unknown>;
};
