"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  ArrowUp,
  Check,
  ChevronDown,
  Database,
  History,
  MessageSquareText,
  RotateCcw,
  Search,
  Settings2,
} from "lucide-react";
import { Stage } from "./kit/stage";
import { Window } from "./kit/window";
import { Phone } from "./kit/phone";
import { Code } from "./kit/code";
import { Collapse } from "./kit/motion/Collapse";
import { Stream } from "./kit/motion/Stream";
import { Button } from "./kit/controls/Button";
import { Badge } from "./kit/controls/Badge";
import { Field } from "./kit/controls/Field";
import { Card } from "./kit/parts/Card";
import { EngramMascot } from "@/components/engram-mascot";
import type { Act } from "./kit/act";
import "./chat.css";

const QUESTION = "Can you sketch a typed FastAPI route?";
const ANSWER =
  "I’ll keep this in typed Python, as you prefer. Here’s a compact route:";
const ANSWER_WORDS = ANSWER.split(" ").length;
const CODE_LINES = [
  "@app.post('/notes')",
  "def add_note(data: NoteIn) -> NoteOut:",
  "    return save_note(data)",
];

type DemoState = {
  draft: string;
  sent: boolean;
  phase: "idle" | "thinking" | "answer";
  words: number;
  codeLines: number;
  source: boolean;
};

const initial: DemoState = {
  draft: "",
  sent: false,
  phase: "idle",
  words: 0,
  codeLines: 0,
  source: false,
};

const poster: DemoState = {
  draft: "",
  sent: true,
  phase: "answer",
  words: ANSWER_WORDS,
  codeLines: CODE_LINES.length,
  source: true,
};

async function playConversation(act: Act<DemoState>) {
  await act.wait(500);
  act.mark("question");
  await act.type("draft", QUESTION, { interval: 32 });
  await act.wait(320);
  act.mark("send");
  act.put({ sent: true, draft: "" });
  await act.wait(360);
  act.put({ phase: "thinking" });
  await act.wait(800);
  act.mark("answer");
  act.put({ phase: "answer" });
  for (let word = 1; word <= ANSWER_WORDS; word += 1) {
    act.put({ words: word });
    await act.wait(42);
  }
  for (let line = 1; line <= CODE_LINES.length; line += 1) {
    act.put({ codeLines: line });
    await act.wait(180);
  }
  await act.wait(260);
  act.mark("memory-source");
  act.put({ source: true });
  await act.wait(2400);
}

function Sidebar() {
  return (
    <div className="el-sidebar">
      <div className="el-workspace-name">
        <Image src="/assets/EngramLoop-Logo.png" alt="EngramLoop" width={144} height={32} className="el-logo" />
      </div>
      <div className="el-sidebar-label">WORKSPACE</div>
      <div className="el-sidebar-item el-sidebar-item--active">
        <MessageSquareText size={14} /> Chat
      </div>
      <div className="el-sidebar-item">
        <Database size={14} /> Memories
        <span className="el-sidebar-count">12</span>
      </div>
      <div className="el-sidebar-label el-sidebar-label--recent">RECENT</div>
      <div className="el-sidebar-item el-sidebar-item--recent">
        <History size={13} /> Project setup
      </div>
      <div className="el-sidebar-item el-sidebar-item--recent">
        <History size={13} /> API patterns
      </div>
      <div className="el-sidebar-bottom">
        <div className="el-sidebar-item"><Settings2 size={14} /> Settings</div>
        <div className="el-profile"><span>SJ</span><div><b>Sammy</b><small>Personal workspace</small></div><ChevronDown size={12} /></div>
      </div>
    </div>
  );
}

function MemorySource({ visible }: { visible: boolean }) {
  return (
    <Collapse open={visible} reveal="drop" from="below">
      <Card className="el-memory-card" pad="small" gap={5}>
        <div className="el-memory-card-top">
          <span className="el-memory-icon"><Database size={13} /></span>
          <span className="el-memory-label">MEMORY USED</span>
          <Badge className="el-memory-badge" tone="success" icon={<Check size={10} />}>Relevant</Badge>
        </div>
        <p>Prefers Python examples with type hints</p>
        <span className="el-memory-origin">From an earlier conversation</span>
      </Card>
    </Collapse>
  );
}

function ChatContent({ state, compact }: { state: DemoState; compact: boolean }) {
  return (
    <div className={`el-chat${compact ? " el-chat--phone" : ""}`}>
      <div className="el-chat-heading">
        <div><strong>New conversation</strong><span>Today · just now</span></div>
        {compact ? (
          <span className="el-phone-memory"><span /> Memory on</span>
        ) : (
          <span className="el-icon-button" aria-hidden="true"><Search size={14} /></span>
        )}
      </div>
      <div className="el-thread">
        <Collapse open={state.sent} reveal="drop" from="below">
          <div className="el-question"><span>{QUESTION}</span></div>
        </Collapse>
        <Collapse open={state.phase === "thinking"}>
          <div className="el-thinking"><span className="el-thinking-dot" /><span>Finding useful context</span></div>
        </Collapse>
        <Collapse open={state.phase === "answer"}>
          <div className="el-response">
            <div className="el-response-avatar"><EngramMascot size={23} /></div>
            <div className="el-response-content">
              <div className="el-response-author"><strong>EngramLoop</strong><span>·</span><span>Assistant</span></div>
              <p className="el-answer"><Stream text={ANSWER} count={state.words} className="el-answer-stream" /></p>
              <Code lines={CODE_LINES} count={state.codeLines} numbers={!compact} className="el-code" />
              <MemorySource visible={state.source} />
            </div>
          </div>
        </Collapse>
      </div>
      <Field
        className="el-composer"
        value={state.draft}
        placeholder="Message EngramLoop"
        focused={!state.sent}
        typing={!state.sent && state.draft.length > 0}
        box={{ "aria-label": "Message EngramLoop" }}
        trailing={<span className="el-send-icon"><ArrowUp size={13} /></span>}
      />
    </div>
  );
}

export function EngramMemoryDemo() {
  const [run, setRun] = useState(0);

  function replayWithKeyboard(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setRun((value) => value + 1);
    }
  }

  return (
    <div className="engram-demo">
      <p className="el-sr-only">
        An animated chat shows EngramLoop using a saved preference for typed Python examples.
      </p>
      <Stage
        key={run}
        width={660}
        height={550}
        compact={{ below: 620, width: 358, height: 718 }}
        initial={initial}
        poster={poster}
        script={playConversation}
        play="once"
        fill
        className="el"
        greys="cool"
        tokens={{
          "--ss-canvas": "#eef1ff",
          "--ss-surface": "#ffffff",
          "--ss-chrome": "#ffffff",
          "--ss-line": "#e4e8f2",
          "--ss-line-faint": "#edf0f7",
          "--ss-text": "#626984",
          "--ss-text-strong": "#202440",
          "--ss-text-faint": "#969bb0",
          "--ss-icon": "#686e89",
          "--ss-accent": "#4d45ed",
          "--ss-accent-2": "#15cbd8",
          "--ss-accent-soft": "#eff1ff",
          "--ss-success": "#188b79",
          "--ss-success-soft": "#e9f8f4",
          "--ss-success-text": "#147666",
          "--ss-well": "#eef1ff",
          "--ss-font": '"Avenir Next", Avenir, "Segoe UI", sans-serif',
          "--ss-radius-window": "17px",
        }}
      >
        {(state, _rect, layout) => layout === "compact" ? (
          <Phone width={326} frame="pro" time="10:42" className="el-phone">
            <div className="el-phone-body"><ChatContent state={state} compact /></div>
          </Phone>
        ) : (
          <Window
            title={undefined}
            sidebar={<Sidebar />}
            sidebarWidth={154}
            className="el-window"
            body={{ className: "el-window-body" }}
            toolbar={<span className="el-window-status"><span /> Memory on</span>}
          >
            <ChatContent state={state} compact={false} />
          </Window>
        )}
      </Stage>
      <Button
        className="el-replay"
        variant="secondary"
        size="small"
        role="button"
        tabIndex={0}
        aria-label="Replay the memory demo"
        onClick={() => setRun((value) => value + 1)}
        onKeyDown={replayWithKeyboard}
        icon={<RotateCcw size={12} />}
      >
        Replay example
      </Button>
    </div>
  );
}
