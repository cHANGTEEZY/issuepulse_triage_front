import { appCallback, authClient } from "@/lib/auth-client";
import { safeNextPath } from "@/features/auth/lib/session";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
}

export const authApi = {
  signInEmail: (email: string, password: string) =>
    authClient.signIn.email({
      email,
      password,
      callbackURL: appCallback("/"),
    }),
  signUpEmail: (input: { name: string; email: string; password: string }) =>
    authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
      callbackURL: appCallback("/"),
    }),
  signInGitHub: (nextPath?: string) =>
    authClient.signIn.social({
      provider: "github",
      callbackURL: appCallback(safeNextPath(nextPath)),
      errorCallbackURL: appCallback("/login"),
    }),
  requestPasswordReset: (email: string) =>
    authClient.requestPasswordReset({
      email,
      redirectTo: appCallback("/reset-password"),
    }),
  resetPassword: (newPassword: string, token: string) =>
    authClient.resetPassword({
      newPassword,
      token,
    }),
  sendVerificationEmail: (email: string) =>
    authClient.sendVerificationEmail({
      email,
      callbackURL: appCallback("/"),
    }),
};
