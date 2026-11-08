"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Brain, MessagesSquare, Settings2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { useAuthToken } from "@/app/auth-boundary";

const navigation = [
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/memories", label: "Memories", icon: Brain },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

const titles: Record<string, string> = { "/chat": "Your workspace", "/memories": "Memory library", "/settings": "Preferences" };

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const auth = useAuthToken();
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <Link href="/chat" className="brand-lockup" aria-label="EngramLoop home">
          <span className="brand-mark">∞</span><span>EngramLoop</span>
        </Link>
        <div className="workspace-label">Personal workspace</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${pathname === href ? "active" : ""}`} aria-current={pathname === href ? "page" : undefined}>
              <Icon size={18} strokeWidth={1.8} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-note">
          <Sparkles size={17} />
          <p>Useful context, carried forward.</p>
          <span>Your memories stay reviewable and yours to edit.</span>
        </div>
        <div className="sidebar-footer">
          <span className={`status-dot ${auth.signedIn ? "online" : "preview"}`} />
          <span>{auth.signedIn ? "Signed in" : "Preview workspace"}</span>
          {!auth.signedIn && <Link href="/sign-in">Sign in</Link>}
        </div>
      </aside>
      <main className="main-column">
        <header className="topbar">
          <div>
            <span className="breadcrumb">ENGRAMLOOP</span>
            <h1>{titles[pathname] ?? "Workspace"}</h1>
          </div>
          {!auth.signedIn && <span className="preview-pill">Preview mode</span>}
        </header>
        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
