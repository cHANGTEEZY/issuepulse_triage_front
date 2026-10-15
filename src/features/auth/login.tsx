"use client";

import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
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
  safeNextPath,
} from "./lib/session";

type LoginPageProps = {
  redirectTo?: string;
  error?: string;
};

export default function LoginPage({ redirectTo, error }: LoginPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState(() => oauthErrorMessage(error));
  const [pending, setPending] = useState(false);

  async function handleGitHub() {
    if (pending) return;
    setPending(true);
    setFormError("");
    const result = await authApi.signInGitHub(redirectTo);
    if (result.error) {
      setFormError(authErrorMessage(result.error));
      setPending(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const nextEmailError = isValidEmail(email)
      ? ""
      : "Enter a valid email address";
    const nextPasswordError = isValidPassword(password)
      ? ""
      : "Use 8 to 128 characters";

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      const firstInvalid = nextEmailError ? "login-email" : "login-password";
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setPending(true);
    setFormError("");
    const result = await authApi.signInEmail(email.trim(), password);
    if (result.error) {
      setFormError(authErrorMessage(result.error));
      setPending(false);
      return;
    }

    await navigate({ href: safeNextPath(redirectTo) });
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title="Welcome back"
        description="Sign in to continue to IssueNest."
      />

      <SocialAuth pending={pending} onGitHub={handleGitHub} />

      <AuthDivider />

      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="login-email"
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
        <PasswordField
          id="login-password"
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          error={passwordError}
          disabled={pending}
          trailing={
            <Link
              to="/reset-password"
              className="caption-style text-soft hover:text-foreground underline decoration-from-font underline-offset-2"
            >
              Forgot password?
            </Link>
          }
          onChange={(event) => {
            setPassword(event.target.value);
            if (passwordError) setPasswordError("");
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
          Continue
        </Button>
      </form>

      <AuthFooterLink
        prompt="Don't have an account?"
        to="/register"
        label="Create one"
      />
    </div>
  );
}
