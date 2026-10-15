import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/features/auth/register";
import { authHead } from "@/features/auth/lib/head";

const TITLE = "Create account";
const DESCRIPTION = "Create an IssueNest account.";

export const Route = createFileRoute("/(auth)/register")({
  component: RegisterPage,
  head: () => authHead(TITLE, DESCRIPTION, "/register"),
});
