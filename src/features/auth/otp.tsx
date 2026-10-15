"use client";

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { authApi } from "@/api/auth";
import AuthHeading from "./components/auth-heading";
import { authErrorMessage } from "./lib/session";

type OtpPageProps = {
  email: string;
};

export default function OtpPage({ email }: OtpPageProps) {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const destination = email || "your email";

  async function handleResend() {
    if (pending || !email) return;
    setPending(true);
    setError("");
    setStatus("");
    const result = await authApi.sendVerificationEmail(email);
    if (result.error) {
      setError(authErrorMessage(result.error));
    } else {
      setStatus(`A new verification link was sent to ${destination}.`);
    }
    setPending(false);
  }

  return (
    <div className="flex flex-col gap-8">
      <AuthHeading
        title="Check your email"
        description={`Open the verification link sent to ${destination}. You can sign in after your email is verified.`}
      />

      {status ? (
        <p role="status" className="caption-style text-soft">
          {status}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="caption-style text-danger">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col items-center gap-4">
        <p className="text-muted-foreground text-center">
          Didn&apos;t get a link?{" "}
          <button
            type="button"
            className="text-foreground hover:text-soft underline decoration-from-font underline-offset-2 disabled:opacity-50"
            disabled={pending || !email}
            onClick={handleResend}
          >
            Resend
          </button>
        </p>
        <Link
          to="/login"
          className="caption-style text-soft hover:text-foreground underline decoration-from-font underline-offset-2"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
