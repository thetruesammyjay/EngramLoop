"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Database, Menu, MessagesSquare, Settings2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuthToken } from "@/app/auth-boundary";

const navigation = [
  { href: "/chat", label: "Chat", icon: MessagesSquare },
  { href: "/memories", label: "Memories", icon: Database },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

const titles: Record<string, string> = { "/chat": "Your workspace", "/memories": "Memory library", "/settings": "Preferences" };

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const auth = useAuthToken();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const firstNavigationLinkRef = useRef<HTMLAnchorElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 800px)");
    const closeOnDesktop = () => {
      if (!viewport.matches) setMobileNavOpen(false);
    };

    viewport.addEventListener("change", closeOnDesktop);
    return () => viewport.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstNavigationLinkRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
        mobileMenuButtonRef.current?.focus();
        return;
      }

      if (event.key !== "Tab") return;
      const focusableItems: HTMLElement[] = [
        ...(sidebarRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? []),
      ].filter((item) => item.getClientRects().length > 0);
      if (!focusableItems.length) return;

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

  const closeMobileNav = () => {
    if (!mobileNavOpen) return;
    setMobileNavOpen(false);
    mobileMenuButtonRef.current?.focus();
  };

  return (
    <div className="app-frame">
      <aside
        ref={sidebarRef}
        id="workspace-navigation"
        className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}
        role={mobileNavOpen ? "dialog" : undefined}
        aria-modal={mobileNavOpen ? true : undefined}
        aria-label={mobileNavOpen ? "Workspace navigation" : undefined}
      >
        <Link href="/chat" className="brand-lockup" aria-label="EngramLoop home">
          <Image src="/assets/EngramLoop-Logo.png" alt="" width={606} height={127} priority />
        </Link>
        <div className="mobile-drawer-header">
          <span>Navigation</span>
          <button type="button" aria-label="Close navigation menu" onClick={closeMobileNav}>
            <X size={19} />
          </button>
        </div>
        <div className="workspace-label">Personal workspace</div>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              ref={href === "/chat" ? firstNavigationLinkRef : undefined}
              className={`nav-link ${pathname === href ? "active" : ""}`}
              aria-current={pathname === href ? "page" : undefined}
              onClick={closeMobileNav}
            >
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
      {mobileNavOpen && (
        <button className="nav-backdrop" type="button" aria-label="Close navigation menu" onClick={closeMobileNav} />
      )}
      <main className="main-column">
        <header className="topbar">
          <div className="topbar-leading">
            <Link href="/chat" className="mobile-brand" aria-label="EngramLoop home">
              <Image src="/assets/EngramLoop-Logo.png" alt="" width={606} height={127} />
            </Link>
            <div className="topbar-copy">
              <span className="breadcrumb">ENGRAMLOOP</span>
              <h1>{titles[pathname] ?? "Workspace"}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            {!auth.signedIn && <span className="preview-pill">Preview mode</span>}
            <button
              ref={mobileMenuButtonRef}
              className="mobile-menu-button"
              type="button"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="workspace-navigation"
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              {mobileNavOpen ? <X size={21} strokeWidth={2} /> : <Menu size={21} strokeWidth={2} />}
            </button>
          </div>
        </header>
        <div className="workspace-content">{children}</div>
      </main>
    </div>
  );
}
