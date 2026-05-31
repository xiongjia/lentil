import * as React from "react";
import { cn } from "../../lib/utils";

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  children?: React.ReactNode;
}

const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ title, children, className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn(
        "flex items-center gap-3 border-b px-6 py-3 bg-card",
        className,
      )}
      {...props}
    >
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </header>
  ),
);
Header.displayName = "Header";

export { Header };
