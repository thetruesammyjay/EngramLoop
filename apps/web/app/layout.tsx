import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { AuthBoundary } from "@/app/auth-boundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "EngramLoop — memory that stays useful",
  description: "A conversational assistant with persistent, explainable memory.",
  icons: { icon: "/assets/EngramLoop-Logo.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f5f7fc",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const authConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <html lang="en">
      <body>
        <AuthBoundary configured={authConfigured}>{children}</AuthBoundary>
      </body>
    </html>
  );
}
