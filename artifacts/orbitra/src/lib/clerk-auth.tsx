import { useAuth, ClerkLoaded, RedirectToSignIn as ClerkRedirectToSignIn } from "@clerk/react";
import type { ReactNode } from "react";

export function SignedIn({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) return null;
  return <ClerkLoaded>{children}</ClerkLoaded>;
}

export function SignedOut({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

export function RedirectToSignIn({ redirectUrl }: { redirectUrl?: string }) {
  return <ClerkRedirectToSignIn signInForceRedirectUrl={redirectUrl} />;
}
