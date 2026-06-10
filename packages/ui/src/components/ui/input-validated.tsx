import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "./button";
import { InputStatus, type InputStatusProps } from "./input-status";

/* ------------------------------------------------------------------ */
/*  Shared helpers                                                     */
/* ------------------------------------------------------------------ */

type ValidatedInputBaseProps = Omit<InputStatusProps, "type">;

/**
 * Internal hook that tracks touch state and resolves the input value
 * for both controlled (`value` prop) and uncontrolled (`defaultValue`)
 * usage.
 */
function useValidated(
  value: string | number | readonly string[] | undefined,
  onBlur?: React.FocusEventHandler<HTMLInputElement>,
) {
  const [touched, setTouched] = React.useState(false);
  /** DOM value captured on blur – used for uncontrolled mode. */
  const [blurValue, setBlurValue] = React.useState("");
  const isControlled = value !== undefined;

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true);
    if (!isControlled) setBlurValue(e.target.value);
    onBlur?.(e);
  };

  const v = isControlled ? String(value) : blurValue;

  return { touched, resolvedValue: v, handleBlur };
}

/* ------------------------------------------------------------------ */
/*  InputEmail                                                        */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_EMAIL_ERROR = "Invalid email format";

interface InputEmailProps extends ValidatedInputBaseProps {
  /** Override built-in validation. Return "" when valid, error message otherwise. */
  validate?: (value: string) => string;
  /** Success message shown when field is valid (set to "" to hide). Default: "Valid email" */
  successText?: string;
}

const InputEmail = React.forwardRef<HTMLInputElement, InputEmailProps>(
  (
    {
      validate,
      successText = "Valid email",
      onBlur,
      value,
      error: externalError,
      success: externalSuccess,
      ...props
    },
    ref,
  ) => {
    const {
      touched,
      resolvedValue: v,
      handleBlur,
    } = useValidated(value, onBlur);
    const internalErr = validate
      ? validate(v)
      : touched && v && !EMAIL_RE.test(v)
        ? DEFAULT_EMAIL_ERROR
        : "";
    const err = externalError ? externalError : internalErr;
    const internalOk = touched && v && !err ? successText : "";
    const ok = externalSuccess ? externalSuccess : internalOk;
    return (
      <InputStatus
        ref={ref}
        type="email"
        value={value}
        error={err}
        success={ok}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
InputEmail.displayName = "InputEmail";

/* ------------------------------------------------------------------ */
/*  InputPassword                                                     */
/* ------------------------------------------------------------------ */

interface InputPasswordProps extends ValidatedInputBaseProps {
  /** Minimum password length. Default: 8 */
  minLength?: number;
  /** Override built-in validation. Return "" when valid, error message otherwise. */
  validate?: (value: string) => string;
  /** Show / hide password toggle button. Default: false */
  showToggle?: boolean;
  /** Success message (set to "" to hide). Default: "Strong password" */
  successText?: string;
}

const InputPassword = React.forwardRef<HTMLInputElement, InputPasswordProps>(
  (
    {
      minLength = 8,
      validate,
      successText = "Strong password",
      showToggle = false,
      onBlur,
      value,
      error: externalError,
      success: externalSuccess,
      ...props
    },
    ref,
  ) => {
    const {
      touched,
      resolvedValue: v,
      handleBlur,
    } = useValidated(value, onBlur);
    const [visible, setVisible] = React.useState(false);

    const internalErr =
      touched && v.length > 0 && v.length < minLength
        ? `Min ${minLength} characters`
        : "";
    const err = externalError
      ? externalError
      : validate
        ? validate(v)
        : internalErr;
    const internalOk = touched && v && !err ? successText : "";
    const ok = externalSuccess ? externalSuccess : internalOk;

    const input = (
      <InputStatus
        ref={ref}
        type={visible && showToggle ? "text" : "password"}
        value={value}
        error={err}
        success={ok}
        onBlur={handleBlur}
        className={showToggle ? "pr-10" : undefined}
        {...props}
      />
    );

    if (!showToggle) return input;

    return (
      <div className="relative">
        {input}
        <Button
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 gap-0 border text-muted-foreground hover:bg-muted hover:text-foreground"
          tabIndex={-1}
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    );
  },
);
InputPassword.displayName = "InputPassword";

/* ------------------------------------------------------------------ */
/*  InputURL                                                          */
/* ------------------------------------------------------------------ */

const URL_RE = /^https?:\/\/.+/;
const DEFAULT_URL_ERROR = "Must start with http:// or https://";

interface InputURLProps extends ValidatedInputBaseProps {
  validate?: (value: string) => string;
  successText?: string;
}

const InputURL = React.forwardRef<HTMLInputElement, InputURLProps>(
  (
    {
      validate,
      successText = "Valid URL",
      onBlur,
      value,
      error: externalError,
      success: externalSuccess,
      ...props
    },
    ref,
  ) => {
    const {
      touched,
      resolvedValue: v,
      handleBlur,
    } = useValidated(value, onBlur);
    const internalErr = validate
      ? validate(v)
      : touched && v && !URL_RE.test(v)
        ? DEFAULT_URL_ERROR
        : "";
    const err = externalError ? externalError : internalErr;
    const internalOk = touched && v && !err ? successText : "";
    const ok = externalSuccess ? externalSuccess : internalOk;
    return (
      <InputStatus
        ref={ref}
        type="url"
        value={value}
        error={err}
        success={ok}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
InputURL.displayName = "InputURL";

/* ------------------------------------------------------------------ */
/*  InputTel                                                           */
/* ------------------------------------------------------------------ */

const TEL_RE = /^\+?[\d\s\-().]+$/;
const DEFAULT_TEL_ERROR = "Invalid phone format";

interface InputTelProps extends ValidatedInputBaseProps {
  validate?: (value: string) => string;
  successText?: string;
}

const InputTel = React.forwardRef<HTMLInputElement, InputTelProps>(
  (
    {
      validate,
      successText = "Valid phone",
      onBlur,
      value,
      error: externalError,
      success: externalSuccess,
      ...props
    },
    ref,
  ) => {
    const {
      touched,
      resolvedValue: v,
      handleBlur,
    } = useValidated(value, onBlur);
    const internalErr = validate
      ? validate(v)
      : touched && v && !TEL_RE.test(v)
        ? DEFAULT_TEL_ERROR
        : "";
    const err = externalError ? externalError : internalErr;
    const internalOk = touched && v && !err ? successText : "";
    const ok = externalSuccess ? externalSuccess : internalOk;
    return (
      <InputStatus
        ref={ref}
        type="tel"
        value={value}
        error={err}
        success={ok}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
InputTel.displayName = "InputTel";

/* ------------------------------------------------------------------ */
/*  InputNumber                                                        */
/* ------------------------------------------------------------------ */

interface InputNumberProps extends ValidatedInputBaseProps {
  min?: number;
  max?: number;
  validate?: (value: number | "") => string;
  successText?: string;
}

const InputNumber = React.forwardRef<HTMLInputElement, InputNumberProps>(
  (
    {
      min,
      max,
      validate,
      successText = "Valid number",
      onBlur,
      value,
      error: externalError,
      success: externalSuccess,
      ...props
    },
    ref,
  ) => {
    const {
      touched,
      resolvedValue: v,
      handleBlur,
    } = useValidated(value, onBlur);

    let internalErr = "";
    if (touched && v) {
      const n = Number(v);
      if (isNaN(n)) {
        internalErr = "Must be a valid number";
      } else if (
        min !== undefined &&
        max !== undefined &&
        (n < min || n > max)
      ) {
        internalErr = `Must be ${min}–${max}`;
      } else if (min !== undefined && n < min) {
        internalErr = `Must be ≥ ${min}`;
      } else if (max !== undefined && n > max) {
        internalErr = `Must be ≤ ${max}`;
      }
    }
    const err = externalError
      ? externalError
      : validate
        ? validate(v === "" ? "" : Number(v))
        : internalErr;
    const internalOk = touched && v && !err ? successText : "";
    const ok = externalSuccess ? externalSuccess : internalOk;
    return (
      <InputStatus
        ref={ref}
        type="number"
        value={value}
        error={err}
        success={ok}
        onBlur={handleBlur}
        {...props}
      />
    );
  },
);
InputNumber.displayName = "InputNumber";

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export { InputEmail, InputPassword, InputURL, InputTel, InputNumber };
export type {
  InputEmailProps,
  InputPasswordProps,
  InputURLProps,
  InputTelProps,
  InputNumberProps,
};
