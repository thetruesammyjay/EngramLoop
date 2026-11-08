"use client";

import { Database, LockKeyhole, Save, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function SettingsWorkspace() {
  const [retention, setRetention] = useState(365);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const stored = window.localStorage.getItem("engramloop-retention-days");
    if (stored) setRetention(Number(stored));
  }, []);
  function save() {
    window.localStorage.setItem("engramloop-retention-days", String(retention));
    setSaved(true);
  }
  return (
    <div className="settings-page">
      <section className="settings-intro"><div className="intro-mark"><SlidersHorizontal size={21} /></div><div><h2>Shape how memory works for you</h2><p>These preferences make memory more predictable and easier to manage.</p></div></section>
      <section className="settings-section">
        <div className="settings-section-icon"><Database size={18} /></div>
        <div className="settings-copy"><h3>Memory retention</h3><p>Choose how long a saved detail should remain active without being revisited.</p><div className="retention-control"><label htmlFor="retention-days">Keep memories for</label><input id="retention-days" type="number" min={30} max={3650} value={retention} onChange={(event) => { setRetention(Number(event.target.value)); setSaved(false); }} /><span>days</span></div><small>This preference is stored in this browser in the scaffold. Server-side expiration is planned.</small></div>
        <Button onClick={save}><Save size={15} /> {saved ? "Saved" : "Save"}</Button>
      </section>
      <section className="settings-section muted-section">
        <div className="settings-section-icon"><LockKeyhole size={18} /></div>
        <div className="settings-copy"><h3>Your data and privacy</h3><p>Memories are scoped to your signed-in account. You can review, correct, and delete them from the memory library.</p><a className="text-link" href="/memories">Open memory library</a></div>
      </section>
    </div>
  );
}
