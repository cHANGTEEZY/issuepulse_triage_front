"use client";

import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ConfirmMorph } from "@/components/arc/confirm-morph/confirm-morph";
import { HoldToConfirm } from "@/components/arc/hold-to-confirm/hold-to-confirm";
import AppearanceSwitch from "@/components/_common/appearance-switch";
import { Checkbox } from "@/components/_ui/checkbox";
import Field from "@/components/_ui/field";
import { Input } from "@/components/_ui/input";
import { Label } from "@/components/_ui/label";
import { useAuthSession, useSignOut } from "@/api/hooks/use-auth";
import { useUiStore } from "@/features/app/stores/ui-store";
import UserAvatar from "@/features/auth/components/user-avatar";
import SettingsHeader from "./header";

export default function Settings() {
  const navigate = useNavigate();
  const showToast = useUiStore((state) => state.showToast);
  const { data } = useAuthSession();
  const signOut = useSignOut();
  const accountName = data?.user.name ?? "";
  const accountEmail = data?.user.email ?? "";
  const [name, setName] = useState(accountName);
  const [email, setEmail] = useState(accountEmail);
  const [digest, setDigest] = useState(true);
  const [dealAlerts, setDealAlerts] = useState(true);

  function logout() {
    signOut.mutate(undefined, {
      onSuccess: () => {
        void navigate({ to: "/login" });
      },
    });
  }

  return (
    <section id="settings" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <SettingsHeader />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[36em] flex-col gap-10 px-6 py-8">
          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2>Profile</h2>
              <p className="text-subtle">
                How you appear across the workspace.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <UserAvatar
                name={accountName}
                image={data?.user.image}
                className="outline-line-strong size-12 text-[16px]"
              />
              <div className="min-w-0">
                <p className="truncate font-medium">{accountName}</p>
                <p className="caption-style text-subtle mt-1.5 truncate">
                  {accountEmail}
                </p>
              </div>
            </div>
            <form
              className="flex flex-col gap-5"
              onSubmit={(event) => event.preventDefault()}
            >
              <Field label="Name" htmlFor="settings-name">
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                />
              </Field>
              <Field label="Email" htmlFor="settings-email">
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                />
              </Field>
              <div>
                <ConfirmMorph
                  label="Save changes"
                  prompt="Save profile updates?"
                  confirmLabel="Save"
                  cancelLabel="Cancel"
                  pendingLabel="Saving"
                  doneLabel="Saved"
                  tone="neutral"
                  onConfirm={() => {
                    showToast({
                      title: "Profile saved",
                      description: "Your workspace profile is up to date.",
                    });
                  }}
                />
              </div>
            </form>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2>Appearance</h2>
              <p className="text-subtle">
                Switch between dark and light for this browser.
              </p>
            </div>
            <div>
              <AppearanceSwitch variant="reveal" />
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2>Notifications</h2>
              <p className="text-subtle">
                Choose which updates reach you by email.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="settings-digest"
                className="text-foreground flex cursor-pointer items-center gap-2.5 text-[14px]"
              >
                <Checkbox
                  id="settings-digest"
                  checked={digest}
                  onCheckedChange={(value) => setDigest(value === true)}
                />
                Weekly pipeline digest
              </Label>
              <Label
                htmlFor="settings-deals"
                className="text-foreground flex cursor-pointer items-center gap-2.5 text-[14px]"
              >
                <Checkbox
                  id="settings-deals"
                  checked={dealAlerts}
                  onCheckedChange={(value) => setDealAlerts(value === true)}
                />
                Deal stage alerts
              </Label>
            </div>
          </section>

          <section className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <h2>Session</h2>
              <p className="text-subtle">
                Sign out of this browser. You can sign back in at any time.
              </p>
            </div>
            <div>
              <HoldToConfirm
                label="Hold to log out"
                confirmedLabel="Signed out"
                tone="danger"
                onConfirm={logout}
              />
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
