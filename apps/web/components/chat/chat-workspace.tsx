"use client";

import { ArrowUp, Check, Clock3, Database, Sparkles, WandSparkles } from "lucide-react";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useAuthToken } from "@/app/auth-boundary";
import { useChatStream } from "@/hooks/use-chat-stream";
import type { Memory } from "@/lib/types";
import { EngramMascot } from "@/components/engram-mascot";

type ChatMessage = { role: "user" | "assistant"; content: string };

const sampleMessages: ChatMessage[] = [
  { role: "user", content: "Help me sketch a small FastAPI project for tracking reading notes." },
  { role: "assistant", content: "Start with a compact API: books, notes, and tags. I’d keep the first version in PostgreSQL, use Pydantic schemas at the boundary, and add search once the basic capture flow feels right." },
];

export function ChatWorkspace() {
  const auth = useAuthToken();
  const { send, isStreaming, error } = useChatStream();
  const [messages, setMessages] = useState<ChatMessage[]>(sampleMessages);
  const [draft, setDraft] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [usedMemories, setUsedMemories] = useState<Memory[]>([]);
  const [useMemory, setUseMemory] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isStreaming) return;
    if (!auth.configured || !auth.signedIn) {
      setNotice("Connect Clerk and sign in to send messages to the API. This preview shows sample content.");
      return;
    }
    const token = await auth.getToken();
    if (!token) {
      setNotice("Your session is not ready. Sign in again to continue.");
      return;
    }
    setNotice(null);
    setUsedMemories([]);
    setMessages((current) => [...(conversationId ? current : []), { role: "user", content: message }, { role: "assistant", content: "" }]);
    setDraft("");
    try {
      await send(message, token, conversationId, useMemory, ({ event, data }) => {
        if (event === "message.start" && typeof data.conversation_id === "string") setConversationId(data.conversation_id);
        if (event === "message.delta" && typeof data.text === "string") {
          setMessages((current) => {
            const next = [...current];
            const last = next[next.length - 1];
            if (last?.role === "assistant") next[next.length - 1] = { ...last, content: last.content + data.text };
            return next;
          });
        }
        if (event === "memory.used" && Array.isArray(data.memories)) {
          setUsedMemories(data.memories as Memory[]);
        }
      });
      bottomRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "end",
      });
    } catch {
      setMessages((current) => current.filter((item, index) => !(item.role === "assistant" && item.content === "" && index === current.length - 1)));
    }
  }

  const contextMemories = usedMemories;

  return (
    <div className="chat-layout">
      <section className="chat-surface" aria-label="Conversation">
        <div className="conversation-heading">
          <div className="conversation-icon"><WandSparkles size={18} /></div>
          <div><h2>{auth.signedIn ? "New conversation" : "Reading notes planner"}</h2><p>{auth.signedIn ? "Current conversation" : "Sample conversation"} <span>·</span> just now</p></div>
          <button className={`memory-toggle ${useMemory ? "selected" : ""}`} type="button" onClick={() => setUseMemory((value) => !value)} aria-pressed={useMemory}>
            <Database size={15} /> Memory {useMemory ? "on" : "off"}
          </button>
        </div>
        <div className="transcript">
          {(auth.signedIn && !conversationId ? [] : messages).map((message, index) => (
            <article className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
              <div className={`avatar ${message.role === "assistant" ? "assistant-avatar" : "user-avatar"}`}>{message.role === "assistant" ? <EngramMascot size={25} /> : "S"}</div>
              <div className="message-body">
                <div className="message-author">{message.role === "assistant" ? "EngramLoop" : "You"}</div>
                <p>{message.content || <span className="typing-caret" aria-label="Generating response" />}</p>
              </div>
            </article>
          ))}
          <div ref={bottomRef} />
        </div>
        {(notice || error) && <div className="inline-notice" role="status">{notice ?? error}</div>}
        <form className="composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor="message-composer">Message EngramLoop</label>
          <textarea id="message-composer" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask a question or share something worth remembering…" rows={2} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} />
          <div className="composer-footer">
            <span><Sparkles size={14} /> Memory is selected only when it helps</span>
            <button className="send-button" type="submit" disabled={isStreaming || !draft.trim()} aria-label={isStreaming ? "Generating response" : "Send message"}>
              {isStreaming ? <span className="send-spinner" /> : <ArrowUp size={18} />}
            </button>
          </div>
        </form>
      </section>

      <aside className="context-panel" aria-label="Memory context">
        <div className="panel-heading"><div><span className="panel-kicker">CONTEXT</span><h2>In this reply</h2></div><span className="source-count">{usedMemories.length}</span></div>
        {usedMemories.length ? (
          <div className="context-state"><span className="state-icon"><Check size={15} /></span><p>These memories informed the current response.</p></div>
        ) : (
          <div className="context-empty"><div className="empty-orbit"><Database size={20} /></div><p>No saved memory was used in this sample.</p><span>When context is retrieved, its source appears here.</span></div>
        )}
        {contextMemories.length > 0 && <div className="context-list">{contextMemories.map((memory) => <div className="context-memory" key={memory.id}><span>{memory.kind.replaceAll("_", " ")}</span><p>{memory.content}</p></div>)}</div>}
        <div className="panel-rule" />
        <div className="retrieval-note"><Clock3 size={15} /><span>Memory extraction runs after a reply, so new details may take a moment to appear.</span></div>
        <a className="text-link" href="/memories">Review memory library</a>
      </aside>
    </div>
  );
}
