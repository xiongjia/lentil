import * as React from "react";
import { cn } from "../../lib/utils";

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const Content = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-auto p-6", className)}
      {...props}
    >
      <div
        className={cn(
          // typography
          "prose max-w-none",
          // dark mode — body
          "dark:text-zinc-100",
          // dark mode — headings
          "dark:[&_h1]:text-zinc-100 dark:[&_h2]:text-zinc-100 dark:[&_h3]:text-zinc-100",
          // dark mode — tables
          "dark:[&_th]:text-zinc-100 dark:[&_td]:text-zinc-100",
          // dark mode — inline code
          "dark:[&_code]:text-zinc-100 dark:[&_code]:bg-zinc-800",
        )}
      >
        {children}
      </div>
    </div>
  ),
);
Content.displayName = "Content";

export { Content };
