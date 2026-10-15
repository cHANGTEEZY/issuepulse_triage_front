import { createFileRoute } from "@tanstack/react-router";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ROUTES,
  absoluteUrl,
} from "@/lib/seo";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const pages = SITE_ROUTES.map(
          (route) =>
            `- [${route.title}](${absoluteUrl(route.path)}): ${route.description}`,
        );

        const body = [
          `# ${SITE_NAME}`,
          "",
          `> ${SITE_DESCRIPTION}`,
          "",
          "## Pages",
          "",
          ...pages,
          "",
        ].join("\n");

        return new Response(body, {
          headers: {
            "content-type": "text/plain; charset=utf-8",
            "cache-control": "public, max-age=0, s-maxage=3600",
          },
        });
      },
    },
  },
});
