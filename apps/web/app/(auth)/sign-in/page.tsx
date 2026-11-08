import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="auth-screen">
        <section className="auth-panel">
          <div className="brand-lockup"><span className="brand-mark">∞</span><span>EngramLoop</span></div>
          <p className="eyebrow">Identity setup</p>
          <h1>Sign-in is not connected yet.</h1>
          <p className="muted">Add your Clerk publishable key and server secret to <code>.env</code>, then restart the web app.</p>
          <Link className="text-link" href="/chat">Continue in preview</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="brand-lockup"><span className="brand-mark">∞</span><span>EngramLoop</span></div>
        <p className="eyebrow">Welcome back</p>
        <h1>Pick up where you left off.</h1>
        <SignIn routing="path" path="/sign-in" />
      </section>
    </main>
  );
}
