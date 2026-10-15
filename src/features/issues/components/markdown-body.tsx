import type { ReactNode } from "react";

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; text: string };

const INLINE =
  /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\(https?:\/\/[^)\s]+\))/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) {
      nodes.push(text.slice(last, start));
    }

    const token = match[0];
    const key = `${keyPrefix}-${index}`;
    index += 1;

    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="bg-muted rounded px-1 py-0.5 font-mono text-[13px]"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="underline decoration-from-font underline-offset-2"
        >
          {label}
        </a>,
      );
    }

    last = start + token.length;
  }

  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replaceAll("\r\n", "\n").split("\n");
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (line.startsWith("```")) {
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !(lines[index] ?? "").startsWith("```")) {
        code.push(lines[index] ?? "");
        index += 1;
      }
      index += 1;
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading?.[1] && heading[2]) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        text: heading[2],
      });
      index += 1;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (
        index < lines.length &&
        (ordered
          ? /^\s*\d+\.\s+/.test(lines[index] ?? "")
          : /^\s*[-*]\s+/.test(lines[index] ?? ""))
      ) {
        items.push((lines[index] ?? "").replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const paragraph: string[] = [line];
    index += 1;
    while (
      index < lines.length &&
      (lines[index] ?? "").trim() !== "" &&
      !/^(```|#{1,3}\s|\s*[-*]\s|\s*\d+\.\s)/.test(lines[index] ?? "")
    ) {
      paragraph.push(lines[index] ?? "");
      index += 1;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

export default function MarkdownBody({ source }: { source: string }) {
  const blocks = parseBlocks(source);

  if (blocks.length === 0) {
    return <p className="text-subtle">This issue has no description.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "heading") {
          if (block.level === 1) return <h2 key={key}>{renderInline(block.text, key)}</h2>;
          return <h3 key={key}>{renderInline(block.text, key)}</h3>;
        }
        if (block.type === "code") {
          return (
            <pre
              key={key}
              className="bg-muted overflow-x-auto rounded-lg p-3 font-mono text-[13px] leading-[1.4]"
            >
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={key}
              className={block.ordered ? "list-decimal pl-5" : "list-disc pl-5"}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="py-0.5">
                  {renderInline(item, `${key}-${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          );
        }
        return <p key={key}>{renderInline(block.text, key)}</p>;
      })}
    </div>
  );
}
