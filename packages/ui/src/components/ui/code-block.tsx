import { useEffect, useLayoutEffect, useState } from "react";
import { cn } from "../../lib/utils";
import { highlightCode } from "./highlight-code";

interface CodeBlockProps {
  code: string;
  title?: string;
  lang?: string;
  className?: string;
}

function useIsDark() {
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark"),
  );

  useLayoutEffect(() => {
    const el = document.documentElement;
    const check = () => setDark(el.classList.contains("dark"));
    const observer = new MutationObserver(check);
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
    check();
    return () => observer.disconnect();
  }, []);

  return dark;
}

function CodeBlock({ code, title, lang = "tsx", className }: CodeBlockProps) {
  const [html, setHtml] = useState("");
  const isDark = useIsDark();

  useEffect(() => {
    let cancelled = false;
    highlightCode(code, lang, isDark).then((h) => {
      if (!cancelled) setHtml(h);
    });
    return () => {
      cancelled = true;
    };
  }, [code, lang, isDark]);

  return (
    <div className="not-prose overflow-hidden rounded-md border bg-white dark:bg-zinc-950">
      {title && (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">
            {title}
          </span>
        </div>
      )}
      {html ? (
        <div
          className={cn(
            "overflow-x-auto text-sm [&_pre]:!bg-transparent [&_pre]:p-4 [&_pre]:font-mono",
            className,
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className={cn(
            "overflow-x-auto p-4 text-sm font-mono text-black dark:text-zinc-100",
            className,
          )}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}

export { CodeBlock };
