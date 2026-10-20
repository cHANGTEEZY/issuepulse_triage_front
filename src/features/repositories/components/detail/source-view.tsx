import { useEffect, useState } from "react";
import { LanguageDescription } from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import type { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { githubDarkInit, githubLightInit } from "@uiw/codemirror-theme-github";
import CodeMirror from "@uiw/react-codemirror";
import { useTheme } from "@/hooks/use-theme";

const surface = {
  background: "transparent",
  gutterBackground: "transparent",
  lineHighlight: "transparent",
};

const dark = githubDarkInit({ settings: surface });
const light = githubLightInit({ settings: surface });

const chrome = EditorView.theme({
  "&": { backgroundColor: "transparent" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    borderRight: "none",
    color: "var(--subtle)",
  },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    lineHeight: "1.55",
  },
});

const loads = new Map<string, Promise<Extension | null>>();

function loadLanguage(filename: string) {
  const match = LanguageDescription.matchFilename(languages, filename);
  if (!match) return Promise.resolve(null);
  const cached = loads.get(match.name);
  if (cached) return cached;
  const pending = match
    .load()
    .then((language) => language as Extension)
    .catch(() => null);
  loads.set(match.name, pending);
  return pending;
}

export default function SourceView({
  code,
  filename,
  readOnly = false,
  onChange,
}: {
  code: string;
  filename: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}) {
  const { theme } = useTheme();
  const [language, setLanguage] = useState<Extension | null>(null);

  useEffect(() => {
    let live = true;
    void loadLanguage(filename).then((next) => {
      if (live) setLanguage(next);
    });
    return () => {
      live = false;
    };
  }, [filename]);

  return (
    <CodeMirror
      value={code}
      theme={theme === "light" ? light : dark}
      extensions={language ? [language, chrome] : [chrome]}
      editable={!readOnly}
      readOnly={readOnly}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
      }}
      onChange={onChange}
      minHeight={readOnly ? undefined : "28em"}
      maxHeight="70vh"
      style={{ fontSize: 13 }}
      aria-label={readOnly ? `${filename} source` : `Contents of ${filename}`}
    />
  );
}
