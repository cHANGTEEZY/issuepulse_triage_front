import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown, {
  type Components,
  type ExtraProps,
} from "react-markdown";
import remarkGfm from "remark-gfm";

import Image from "@/components/_ui/image";
import { graphProseClass } from "@/components/mdxcn/graph-frame";
import { withMdxcn } from "@/components/mdxcn/mdx";
import { cn } from "@/lib/utils";

type Props<Tag extends keyof React.JSX.IntrinsicElements> =
  ComponentProps<Tag> & ExtraProps;

function safeHref(href: string | undefined) {
  if (!href) return null;
  if (href.startsWith("#")) return href;
  try {
    const url = new URL(href);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function Anchor({ node: _node, href, children, ...props }: Props<"a">) {
  const safe = safeHref(href);
  if (!safe) return <span>{children}</span>;
  const external = !safe.startsWith("#");
  return (
    <a
      {...props}
      href={safe}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

function Img({ node: _node, src, alt }: Props<"img">) {
  const safe = typeof src === "string" ? safeHref(src) : null;
  if (!safe || safe.startsWith("#")) return null;
  return (
    <Image
      src={safe}
      alt={alt ?? ""}
      loading="lazy"
      className="inline-block h-auto max-w-full rounded-md"
    />
  );
}

function Heading({
  level,
  children,
}: {
  level: 1 | 2 | 3 | 4;
  children?: ReactNode;
}) {
  if (level === 1) return <h2 className="pt-2 leading-[1.3]">{children}</h2>;
  if (level === 2)
    return <h3 className="pt-2 leading-[1.3] font-semibold">{children}</h3>;
  return <h4 className="pt-1 leading-[1.3]">{children}</h4>;
}

function Pre({ node: _node, className, ...props }: Props<"pre">) {
  return (
    <pre
      {...props}
      className={cn(
        "bg-muted overflow-x-auto rounded-lg px-3 py-2.5 font-mono text-[13px] leading-[1.55] whitespace-pre!",
        className,
      )}
    />
  );
}

function Code({ node: _node, className, ...props }: Props<"code">) {
  const block = className?.startsWith("language-");
  return (
    <code
      {...props}
      className={cn(
        "font-mono text-[0.92em]",
        !block && "bg-muted rounded px-1 py-0.5 font-normal!",
        className,
      )}
    />
  );
}

function Blockquote({ node: _node, ...props }: Props<"blockquote">) {
  return (
    <blockquote
      {...props}
      className="text-subtle border-border flex flex-col gap-2 border-l-2 pl-3"
    />
  );
}

function Section({ node: _node, ...props }: Props<"section">) {
  return <section {...props} />;
}

function Table({ node: _node, ...props }: Props<"table">) {
  return (
    <div className="overflow-x-auto">
      <table
        {...props}
        className="w-full border-collapse text-left text-[13px] [&_td]:border-b [&_td]:px-3 [&_td]:py-2 [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium"
      />
    </div>
  );
}

function OrderedList({ node: _node, ...props }: Props<"ol">) {
  return (
    <ol
      {...props}
      className="list-decimal! pl-5! [&>li]:pl-0! [&>li]:before:content-none!"
    />
  );
}

function Rule({ node: _node }: Props<"hr">) {
  return <hr className="border-border my-1" />;
}

function Checkbox({ node: _node, type, checked }: Props<"input">) {
  if (type !== "checkbox") return null;
  return (
    <input
      type="checkbox"
      checked={checked}
      disabled
      readOnly
      className="accent-foreground mr-1.5 align-[-0.1em]"
    />
  );
}

const components = withMdxcn({
  a: Anchor,
  img: Img,
  h1: ({ children }: Props<"h1">) => <Heading level={1}>{children}</Heading>,
  h2: ({ children }: Props<"h2">) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }: Props<"h3">) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }: Props<"h4">) => <Heading level={4}>{children}</Heading>,
  h5: ({ children }: Props<"h5">) => <Heading level={4}>{children}</Heading>,
  h6: ({ children }: Props<"h6">) => <Heading level={4}>{children}</Heading>,
  pre: Pre,
  code: Code,
  blockquote: Blockquote,
  section: Section,
  table: Table,
  ol: OrderedList,
  hr: Rule,
  input: Checkbox,
}) as Components;

export default function MarkdownBody({
  source,
  empty = "This issue has no description.",
}: {
  source: string;
  empty?: string;
}) {
  if (source.trim() === "") {
    return <p className="text-subtle">{empty}</p>;
  }

  return (
    <div
      className={cn(
        graphProseClass,
        "min-w-0 text-[14px] break-words [&_li]:leading-[1.6] [&_p]:leading-[1.6]",
        "[&_ul_ul]:pt-1 [&_ol_ol]:pt-1",
        "[&_li.task-list-item]:pl-0 [&_li.task-list-item]:before:content-none",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
