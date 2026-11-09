"use client";
import type { ReactNode } from "react";
export const ClerkProvider = ({ children }: { children: ReactNode }) => <>{children}</>;
export const useAuth = () => ({ isLoaded: true, isSignedIn: true, getToken: async () => null, orgId: null, orgRole: null });
export const UserButton = () => <span className="inline-flex size-8 items-center justify-center rounded-full bg-harbour text-xs font-bold text-white">SB</span>;
export const RedirectToSignIn = () => null;
export const SignIn = () => <div className="rounded-2xl bg-white p-8 shadow">Sign in (preview)</div>;
export const ConvexProviderWithClerk = ({ children }: { children: ReactNode }) => <>{children}</>;
