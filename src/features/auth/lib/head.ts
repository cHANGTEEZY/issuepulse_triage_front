import { canonicalLink, headMeta } from "@/lib/seo";

export function authHead(title: string, description: string, path: string) {
  return {
    meta: [
      ...headMeta({ title, description, path }),
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: canonicalLink(path),
  };
}
