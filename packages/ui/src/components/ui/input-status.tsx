import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "./input";

interface InputStatusProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  success?: string;
}

const InputStatus = React.forwardRef<HTMLInputElement, InputStatusProps>(
  ({ className, error, success, ...props }, ref) => (
    <div className="flex min-w-0 flex-col gap-2.5">
      <Input
        ref={ref}
        className={cn(
          error && "border-red-500 focus-visible:ring-red-500",
          className,
        )}
        {...props}
      />
      <div className="min-h-5">
        {error && (
          <p className="flex items-center gap-1 text-xs text-red-500">
            <AlertCircle className="h-3 w-3 shrink-0" />
            {error}
          </p>
        )}
        {!error && success && (
          <p className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            {success}
          </p>
        )}
      </div>
    </div>
  ),
);
InputStatus.displayName = "InputStatus";

export { InputStatus };
export type { InputStatusProps };
