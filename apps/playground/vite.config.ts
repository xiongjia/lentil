import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import { createProcessor } from "@mdx-js/mdx";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import { compression } from "vite-plugin-compression2";
import path from "path";

// Vite transform plugin: rewrites ```tsx preview fenced code blocks into
// <ComponentPreview> elements in the raw source text BEFORE MDX compilation.
// Uses MDAST parser for accurate position-based detection (no regex).
function mdxCodePreview(): Plugin {
  const parser = createProcessor({ format: "mdx" });

  return {
    name: "mdx-code-preview",
    enforce: "pre",

    transform(code, id) {
      if (!id.endsWith(".mdx") && !id.endsWith(".md")) return;

      // 1. Inject import if needed (right after frontmatter, or at the top)
      const importStmt = 'import { ComponentPreview } from "@lentil/ui";\n';
      const hasImport = code.includes(importStmt.trim());
      let source = code;
      if (!hasImport) {
        const fmEnd = code.startsWith("---\n")
          ? code.indexOf("---\n", 4) + 4
          : 0;
        source = code.slice(0, fmEnd) + "\n" + importStmt + code.slice(fmEnd);
      }

      // 2. Re-parse after import injection to get fresh offsets
      let tree: any;
      try {
        tree = parser.parse({ value: source });
      } catch {
        // TypeScript-heavy MDX can't be parsed by the standalone processor; skip
        return;
      }

      const blocks: Array<{ start: number; end: number; codeText: string }> =
        [];

      function walk(node: any) {
        if (
          node.type === "code" &&
          node.lang === "tsx" &&
          node.meta === "preview" &&
          node.position
        ) {
          blocks.push({
            start: node.position.start.offset!,
            end: node.position.end.offset!,
            codeText: node.value,
          });
        }
        if (node.children) {
          for (const child of node.children) walk(child);
        }
      }

      walk(tree);

      if (blocks.length === 0) return;

      // 3. Replace each code block with ComponentPreview (reverse order)
      for (const { start, end, codeText } of [...blocks].reverse()) {
        const replacement = `<ComponentPreview code={${JSON.stringify(codeText)}}>\n${codeText}\n</ComponentPreview>`;
        source = source.slice(0, start) + replacement + source.slice(end);
      }

      return { code: source };
    },
  };
}

export default defineConfig({
  plugins: [
    mdxCodePreview(),
    compression(),
    {
      enforce: "pre",
      ...mdx({
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      }),
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 10000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          // Shiki core
          if (id.includes("node_modules/shiki/")) return "shiki-core";
          // Shiki themes
          if (id.includes("@shikijs/themes")) return "shiki-themes";
          // Shiki langs: split by first letter for parallel loading
          if (id.includes("@shikijs/langs")) {
            const match = id.match(/@shikijs\/langs\/dist\/([a-z0-9])/);
            if (match) return `shiki-lang-${match[1]}`;
            return "shiki-langs";
          }
          // Shiki other
          if (id.includes("@shikijs")) return "shiki-other";
          // Large deps
          if (id.includes("maplibre-gl")) return "maplibre";
          // React
          if (id.includes("react-dom") || id.includes("react/")) return "react";
          return "vendor";
        },
      },
    },
  },
});
