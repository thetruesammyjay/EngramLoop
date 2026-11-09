"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 720px)");
    const closeOnDesktop = () => {
      if (!viewport.matches) setMenuOpen(false);
    };

    viewport.addEventListener("change", closeOnDesktop);
    return () => viewport.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const handleOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handleOutsideClick);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header ref={headerRef} className="landing-header">
      <div className="landing-header-inner">
        <Link href="/" className="landing-brand" aria-label="EngramLoop home">
          <Image src="/assets/EngramLoop-Logo.png" alt="" width={606} height={127} priority />
        </Link>

        <nav className="landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#memory-control">Memory control</a>
        </nav>

        <div className="landing-header-actions">
          <Link className="landing-signin" href="/sign-in">Sign in</Link>
          <Link className="landing-button landing-button-compact" href="/chat">Open workspace</Link>
          <button
            ref={menuButtonRef}
            className="landing-menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <nav id="landing-mobile-nav" className="landing-mobile-menu" aria-label="Mobile navigation" hidden={!menuOpen}>
        <a href="#how-it-works" onClick={closeMenu}>How it works</a>
        <a href="#memory-control" onClick={closeMenu}>Memory control</a>
        <Link href="/sign-in" onClick={closeMenu}>Sign in</Link>
        <Link className="landing-button" href="/chat" onClick={closeMenu}>Open workspace</Link>
      </nav>
    </header>
  );
}
