"use client";

import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/api/auth";
import Button from "@/components/_ui/button";
import AuthDivider from "./components/auth-divider";
import AuthField from "./components/auth-field";
import AuthFooterLink from "./components/auth-footer-link";
import AuthHeading from "./components/auth-heading";
import PasswordField from "./components/password-field";
import SocialAuth from "./components/social-auth";
import {
  authErrorMessage,
  isValidEmail,
  isValidPassword,
  oauthErrorMessage,
} from "./lib/session";

type ResetPasswordPageProps = {
  token: string;
  error: string;
};

export default function ResetPasswordPage({
  token,
  error,
}: ResetPasswordPageProps) {
  if (token && !error) return <ChoosePassword token={token} />;
  return <RequestReset initialError={oauthErrorMessage(error)} />;
}

function ChoosePassword({ token }: { token: string }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextPasswordError = isValidPassword(password)
      ? ""
      : "Use 8 to 128 characters";
    const nextConfirmError = confirm === password ? "" : "Passwords must match";

    setPasswordError(nextPasswordError);
    setConfirmError(nextConfirmError);

    if (nextPasswordError || nextConfirmError) {
      const first = nextPasswordError ? "reset-password" : "reset-confirm";
      document.getElementById(first)?.focus();
      return;
    }

    setPending(true);
    setFormError("");
    const result = await authApi.resetPassword(password, token);
    if (result.error) {
      setFormError(authErrorMessage(result.error));
      setPending(false);
      return;
    }

    await navigate({ to: "/login" });
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title="Choose a new password"
        description="Use 8 to 128 characters. Sign in with it after you save."
      />

      <form
        className="flex flex-col gap-5"
        onSubmit={handlePasswordSubmit}
        noValidate
      >
        <PasswordField
          id="reset-password"
          label="New password"
          name="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          error={passwordError}
          disabled={pending}
          onChange={(event) => {
            setPassword(event.target.value);
            if (passwordError) setPasswordError("");
          }}
        />
        <PasswordField
          id="reset-confirm"
          label="Confirm password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={confirm}
          error={confirmError}
          disabled={pending}
          onChange={(event) => {
            setConfirm(event.target.value);
            if (confirmError) setConfirmError("");
          }}
        />
        {formError ? (
          <p role="alert" className="caption-style text-danger">
            {formError}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="none"
          className="h-11 w-full text-[14px]"
          disabled={pending}
          aria-busy={pending}
        >
          Save password
        </Button>
      </form>

      <AuthFooterLink prompt="Remember it?" to="/login" label="Sign in" />
    </div>
  );
}

function RequestReset({ initialError }: { initialError: string }) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState(initialError);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleGitHub() {
    if (pending) return;
    setPending(true);
    setFormError("");
    const result = await authApi.signInGitHub();
    if (result.error) {
      setFormError(authErrorMessage(result.error));
      setPending(false);
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address");
      document.getElementById("reset-email")?.focus();
      return;
    }

    setPending(true);
    setFormError("");
    const result = await authApi.requestPasswordReset(email.trim());
    if (result.error) {
      setFormError(authErrorMessage(result.error));
      setPending(false);
      return;
    }

    setSent(true);
    setPending(false);
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-8">
        <AuthHeading
          title="Check your email"
          description={`If an account exists for ${email.trim()}, we sent a link to choose a new password.`}
        />
        <AuthFooterLink prompt="Remember it?" to="/login" label="Sign in" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title="Reset your password"
        description="Enter the email on your account. We'll send a reset link."
      />

      <SocialAuth pending={pending} onGitHub={handleGitHub} />

      <AuthDivider />

      <form
        className="flex flex-col gap-5"
        onSubmit={handleEmailSubmit}
        noValidate
      >
        <AuthField
          id="reset-email"
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@company.com"
          value={email}
          error={emailError}
          disabled={pending}
          onChange={(event) => {
            setEmail(event.target.value);
            if (emailError) setEmailError("");
            if (formError) setFormError("");
          }}
        />
        {formError ? (
          <p role="alert" className="caption-style text-danger">
            {formError}
          </p>
        ) : null}
        <Button
          type="submit"
          variant="primary"
          size="none"
          className="h-11 w-full text-[14px]"
          disabled={pending}
          aria-busy={pending}
        >
          Send reset link
        </Button>
      </form>

      <AuthFooterLink prompt="Remember it?" to="/login" label="Sign in" />
    </div>
  );
}
