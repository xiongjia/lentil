import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { InputStatus, InputPassword, InputNumber } from "@lentil/ui";

export function FormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!email) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Please enter a valid email";
    }
    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    if (age && (isNaN(Number(age)) || Number(age) < 1 || Number(age) > 150)) {
      next.age = "Age must be between 1 and 150";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setEmail("");
      setPassword("");
      setAge("");
      setErrors({});
      setSubmitted(true);
    }
  };

  const onChangeDismiss =
    (setter: (v: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setErrors((p) => ({ ...p, email: "", password: "", age: "" }));
      if (submitted) setSubmitted(false);
    };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setAge("");
    setErrors({});
    setSubmitted(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: "24rem",
      }}
    >
      {submitted && (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <p className="text-sm font-medium">Submitted successfully!</p>
          <button
            type="button"
            className="ml-auto shrink-0 text-xs text-green-600 underline hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
            onClick={clearForm}
          >
            Reset
          </button>
        </div>
      )}
      <div className="flex flex-col gap-2.5">
        <label htmlFor="form-email" className="text-sm font-medium">
          Email <span className="text-red-500">*</span>
        </label>
        <InputStatus
          id="form-email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={onChangeDismiss(setEmail)}
          error={errors.email}
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor="form-password" className="text-sm font-medium">
          Password <span className="text-red-500">*</span>
        </label>
        <InputPassword
          id="form-password"
          placeholder="Min. 6 characters"
          minLength={6}
          showToggle
          value={password}
          onChange={onChangeDismiss(setPassword)}
          error={errors.password}
          successText=""
        />
      </div>

      <div className="flex flex-col gap-2.5">
        <label htmlFor="form-age" className="text-sm font-medium">
          Age <span className="text-muted-foreground">(opt)</span>
        </label>
        <InputNumber
          id="form-age"
          placeholder="Enter your age"
          min={1}
          max={150}
          value={age}
          onChange={onChangeDismiss(setAge)}
          error={errors.age}
          successText=""
        />
      </div>

      <button
        type="submit"
        className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
      >
        Submit
      </button>
    </form>
  );
}
