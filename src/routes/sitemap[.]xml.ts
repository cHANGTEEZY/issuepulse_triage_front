import { createFileRoute } from "@tanstack/react-router";
import { SITE_ROUTES, absoluteUrl } from "@/lib/seo";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = new Date();

        const entries = SITE_ROUTES.map(
          (route) => `  <url>
    <loc>${absoluteUrl(route.path)}</loc>
    <lastmod>${now.toISOString()}</lastmod>
    <changefreq>${route.changeFrequency ?? "weekly"}</changefreq>
    <priority>${route.priority ?? 0.5}</priority>
  </url>`,
        ).join("\n");

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;

        return new Response(body, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=0, s-maxage=3600",
          },
        });
      },
    },
  },
});
