"use client";

import { Archive, BookOpenText, Check, CircleHelp, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useAuthToken } from "@/app/auth-boundary";
import { Button } from "@/components/ui/button";
import { useMemories } from "@/hooks/use-memories";
import type { Memory, MemoryKind } from "@/lib/types";

const examples: Memory[] = [
  { id: "sample-1", kind: "preference", content: "Prefers Python examples with type hints and concise explanations.", state: "active", confidence: 0.92, version: 1, created_at: "2026-10-22T12:00:00Z", updated_at: "2026-10-22T12:00:00Z", sources: [{ message_id: null, extraction_run_id: "sample", quote: "Please use Python with type hints when you show code.", created_at: "2026-10-22T12:00:00Z" }] },
  { id: "sample-2", kind: "project_context", content: "Building EngramLoop, a memory system for conversational AI agents.", state: "active", confidence: 0.88, version: 1, created_at: "2026-10-20T12:00:00Z", updated_at: "2026-10-20T12:00:00Z", sources: [{ message_id: null, extraction_run_id: "sample", quote: "I’m designing a tool that helps an assistant carry useful context between chats.", created_at: "2026-10-20T12:00:00Z" }] },
];

const kindLabels: Record<MemoryKind, string> = { preference: "Preference", fact: "Fact", project_context: "Project context", instruction: "Instruction", episodic_summary: "Summary" };

export function MemoryWorkspace() {
  const auth = useAuthToken();
  const [apiToken, setApiToken] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (auth.signedIn) void auth.getToken().then((token) => { if (active) setApiToken(token); }).catch(() => { if (active) setApiToken(null); });
    else setApiToken(null);
    return () => { active = false; };
  }, [auth.getToken, auth.signedIn]);
  const { memories: liveMemories, loading, error, add, edit, remove } = useMemories(apiToken);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newMemory, setNewMemory] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const items = auth.signedIn ? liveMemories : examples;
  const filtered = useMemo(() => items.filter((item) => `${item.content} ${item.kind}`.toLowerCase().includes(query.toLowerCase())), [items, query]);

  async function saveEdit(event: FormEvent, id: string) {
    event.preventDefault();
    if (id.startsWith("sample-")) {
      setNotice("Sign in and connect the API to edit saved memories.");
      setEditing(null);
      return;
    }
    try { await edit(id, editText); setEditing(null); setNotice("Memory updated."); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Memory could not be updated."); }
  }

  async function addMemory(event: FormEvent) {
    event.preventDefault();
    if (!newMemory.trim()) return;
    try { await add(newMemory.trim(), "fact"); setNewMemory(""); setShowAdd(false); setNotice("Memory saved."); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Memory could not be saved."); }
  }

  async function deleteItem(memory: Memory) {
    if (memory.id.startsWith("sample-")) { setNotice("Sample memories cannot be deleted."); return; }
    try { await remove(memory.id); setNotice("Memory deleted."); }
    catch (cause) { setNotice(cause instanceof Error ? cause.message : "Memory could not be deleted."); }
  }

  return (
    <div className="memories-page">
      <section className="memory-intro">
        <div className="intro-mark"><BookOpenText size={22} /></div>
        <div><h2>What EngramLoop carries forward</h2><p>Review the details that can shape future replies. You can correct or remove any saved memory.</p></div>
        <div className="privacy-mark"><ShieldCheck size={17} /><span>Private to your account</span></div>
      </section>
      <div className="memory-toolbar">
        <label className="search-field"><Search size={17} /><span className="sr-only">Search memories</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your memories" /></label>
        <Button onClick={() => setShowAdd((value) => !value)}><Plus size={16} /> Add memory</Button>
      </div>
      {(showAdd || notice || error) && <div className="memory-action-area">
        {showAdd && <form className="add-memory-form" onSubmit={addMemory}><label htmlFor="new-memory">What should EngramLoop remember?</label><textarea id="new-memory" value={newMemory} onChange={(event) => setNewMemory(event.target.value)} rows={2} maxLength={4000} /><div><Button type="submit">Save memory</Button><Button type="button" variant="quiet" onClick={() => setShowAdd(false)}>Cancel</Button></div></form>}
        {(notice || error) && <p className="inline-notice" role="status">{notice ?? error}</p>}
      </div>}
      <div className="memory-list-head"><h3>{auth.signedIn ? "Saved memories" : "Preview memories"}</h3><span>{loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`}</span></div>
      {filtered.length ? <div className="memory-list">{filtered.map((memory) => (
        <article className="memory-item" key={memory.id}>
          <div className="memory-kind-icon"><Archive size={17} /></div>
          <div className="memory-main">
            <div className="memory-meta"><span className={`kind-pill kind-${memory.kind}`}>{kindLabels[memory.kind]}</span><span className="memory-date">Updated {new Date(memory.updated_at).toLocaleDateString()}</span></div>
            {editing === memory.id ? <form className="edit-memory-form" onSubmit={(event) => void saveEdit(event, memory.id)}><textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={3} /><div><Button type="submit"><Check size={15} /> Save</Button><Button type="button" variant="quiet" onClick={() => setEditing(null)}>Cancel</Button></div></form> : <p className="memory-content">{memory.content}</p>}
            {memory.sources?.[0] && <details className="source-details"><summary><CircleHelp size={14} /> Where this came from</summary><blockquote>{memory.sources[0].quote ?? "Source message is available in the conversation history."}</blockquote></details>}
          </div>
          {editing !== memory.id && <div className="memory-actions"><button type="button" onClick={() => { setEditing(memory.id); setEditText(memory.content); }} aria-label={`Edit ${kindLabels[memory.kind].toLowerCase()}`}>Edit</button><button type="button" className="icon-button danger-icon" onClick={() => void deleteItem(memory)} aria-label="Delete memory"><Trash2 size={16} /></button></div>}
        </article>
      ))}</div> : <div className="empty-memories"><div className="empty-orbit"><Archive size={20} /></div><h3>{query ? "No memories match that search." : "Nothing saved yet."}</h3><p>{query ? "Try a shorter search." : "As useful details are learned, they will appear here for you to review."}</p></div>}
    </div>
  );
}
