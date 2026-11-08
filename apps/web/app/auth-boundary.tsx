"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

type AuthContextValue = {
  configured: boolean;
  signedIn: boolean;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextValue>({
  configured: false,
  signedIn: false,
  getToken: async () => null,
});

function ClerkBridge({ children }: { children: ReactNode }) {
  const { getToken: getClerkToken, isLoaded, isSignedIn } = useAuth();
  const getToken = useCallback(
    () => getClerkToken({ template: process.env.NEXT_PUBLIC_CLERK_JWT_TEMPLATE ?? "engramloop-api" }),
    [getClerkToken],
  );
  const value = useMemo(
    () => ({ configured: true, signedIn: Boolean(isLoaded && isSignedIn), getToken }),
    [getToken, isLoaded, isSignedIn],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthBoundary({ children, configured }: { children: ReactNode; configured: boolean }) {
  if (!configured) return <AuthContext.Provider value={{ configured: false, signedIn: false, getToken: async () => null }}>{children}</AuthContext.Provider>;
  return (
    <ClerkProvider>
      <ClerkBridge>{children}</ClerkBridge>
    </ClerkProvider>
  );
}

export function useAuthToken() {
  return useContext(AuthContext);
}
