import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, FileText, MessageSquareText, Sparkles } from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { EngramMemoryDemo } from "@/components/engram-memory-demo";
import { EngramMascot } from "@/components/engram-mascot";

export const metadata: Metadata = {
  title: "EngramLoop — memory that stays useful",
  description: "A conversational AI memory layer that carries useful context forward and keeps it reviewable and under your control.",
};

const steps = [
  {
    number: "01",
    icon: MessageSquareText,
    title: "A useful detail comes up",
    description: "A preference, project constraint, or recurring fact appears naturally in conversation.",
  },
  {
    number: "02",
    icon: EngramMascot,
    title: "The right context returns",
    description: "When it helps with a later question, relevant memories can inform the next answer.",
  },
  {
    number: "03",
    icon: FileText,
    title: "You can review the loop",
    description: "Inspect what was saved, see where it came from, and edit or remove it when it changes.",
  },
];

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingHeader />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <div className="landing-hero-copy">
              <p className="landing-kicker"><span className="landing-kicker-mark"><Sparkles size={14} /></span> Persistent memory for conversational AI</p>
              <h1>Remember what matters.<span>Use it when it helps.</span></h1>
              <p className="landing-lede">EngramLoop carries useful context between conversations, so an assistant can pick up where you left off without treating every detail as worth keeping.</p>
              <div className="landing-hero-actions">
                <Link className="landing-button" href="/chat">Explore the workspace <ArrowRight size={16} /></Link>
                <a className="landing-secondary-link" href="#how-it-works">See how it works <ArrowDownRight size={16} /></a>
              </div>
              <p className="landing-scaffold-note"><span /> Early scaffold · workspace preview available</p>
            </div>

            <div className="landing-demo"><EngramMemoryDemo /></div>
          </div>
        </section>

        <section id="how-it-works" className="landing-process section-anchor">
          <div className="landing-section-heading">
            <p className="landing-kicker">A more considered kind of memory</p>
            <h2>Continuity without carrying the whole conversation.</h2>
            <p>EngramLoop is designed to select useful details, bring them back when they fit, and leave the person in charge.</p>
          </div>
          <div className="landing-steps">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article className="landing-step" key={number}>
                <div className="landing-step-top"><span className="landing-step-icon"><Icon size={22} /></span><span className="landing-step-number">{number}</span></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="memory-control" className="landing-control section-anchor">
          <div className="control-orbit" aria-hidden="true"><span className="orbit-ring orbit-ring-one" /><span className="orbit-ring orbit-ring-two" /><span className="orbit-core"><EngramMascot size={78} /></span><span className="orbit-node orbit-node-one" /><span className="orbit-node orbit-node-two" /><span className="orbit-node orbit-node-three" /></div>
          <div className="landing-control-copy">
            <p className="landing-kicker">Useful memory needs boundaries</p>
            <h2>Helpful context should never feel out of your hands.</h2>
            <p>Memory is only valuable when it stays understandable and correctable. EngramLoop keeps the review experience close to the conversation.</p>
            <ul className="control-list">
              <li><span><Check size={15} /></span><div><strong>See what was used</strong><small>Make memory use visible alongside a response.</small></div></li>
              <li><span><Check size={15} /></span><div><strong>Know where it came from</strong><small>Keep source context available for inspection.</small></div></li>
              <li><span><Check size={15} /></span><div><strong>Change or remove it</strong><small>Correct saved details as your needs change.</small></div></li>
            </ul>
          </div>
        </section>

        <section className="landing-cta">
          <div><p className="landing-kicker">Pick up where you left off</p><h2>Explore a workspace built around useful context.</h2><p>The current scaffold includes a preview chat and a reviewable memory library.</p></div>
          <Link className="landing-button landing-button-light" href="/chat">Open the workspace <ArrowRight size={16} /></Link>
        </section>
      </main>
      <footer className="landing-footer">
        <span>EngramLoop</span><span>Persistent, explainable memory for conversational AI.</span><a href="https://github.com/thetruesammyjay/EngramLoop" target="_blank" rel="noreferrer">View the project <ArrowRight size={13} /></a>
      </footer>
    </div>
  );
}
