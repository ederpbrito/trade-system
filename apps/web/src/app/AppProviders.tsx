import type { ReactNode } from "react";
import { AuthProvider } from "../domains/identity";

export function AppProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
