import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  InputEmail,
  InputPassword,
  InputURL,
  InputTel,
  InputNumber,
} from "./input-validated";

/* ------------------------------------------------------------------ */
/*  InputEmail                                                        */
/* ------------------------------------------------------------------ */

describe("InputEmail", () => {
  it("should render an email input", () => {
    render(<InputEmail placeholder="Enter email" />);
    const el = screen.getByPlaceholderText("Enter email");
    expect(el).toHaveAttribute("type", "email");
  });

  it("should show success after blur with valid email", () => {
    render(<InputEmail defaultValue="a@b.c" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("Valid email")).toBeDefined();
  });

  it("should show error after blur with invalid email", () => {
    render(<InputEmail defaultValue="notanemail" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("Invalid email format")).toBeDefined();
  });

  it("should not validate before blur", () => {
    render(<InputEmail defaultValue="notanemail" />);
    expect(screen.queryByText("Invalid email format")).toBeNull();
  });

  it("should use custom validate", () => {
    render(
      <InputEmail
        defaultValue="test@test.com"
        validate={(v) => (v === "test@test.com" ? "already taken" : "")}
      />,
    );
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("already taken")).toBeDefined();
  });

  it("should hide success when successText is empty", () => {
    render(<InputEmail defaultValue="a@b.c" successText="" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.queryByText("Valid email")).toBeNull();
  });

  it("should use external error over internal validation", () => {
    render(<InputEmail defaultValue="a@b.c" error="External required" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("External required")).toBeDefined();
    expect(screen.queryByText("Valid email")).toBeNull();
  });

  it("should have displayName", () => {
    expect(InputEmail.displayName).toBe("InputEmail");
  });
});

/* ------------------------------------------------------------------ */
/*  InputPassword                                                     */
/* ------------------------------------------------------------------ */

describe("InputPassword", () => {
  it("should render a password input", () => {
    const { container } = render(<InputPassword placeholder="Password" />);
    const el = container.querySelector("input");
    expect(el).toHaveAttribute("type", "password");
  });

  it("should show error when too short after blur", () => {
    const { container } = render(
      <InputPassword defaultValue="ab" minLength={6} />,
    );
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("Min 6 characters")).toBeDefined();
  });

  it("should show success when meets min length after blur", () => {
    const { container } = render(
      <InputPassword defaultValue="12345678" minLength={8} />,
    );
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("Strong password")).toBeDefined();
  });

  it("should not validate before blur", () => {
    render(<InputPassword defaultValue="ab" />);
    expect(screen.queryByText("Min 8 characters")).toBeNull();
  });

  it("should show toggle button when showToggle is true", () => {
    const { container } = render(
      <InputPassword defaultValue="secret" showToggle />,
    );
    const btn = container.querySelector("button");
    expect(btn).toBeDefined();
    expect(btn).toHaveAttribute("aria-label", "Show password");
  });

  it("should toggle visibility on button click", () => {
    const { container } = render(
      <InputPassword defaultValue="secret" showToggle />,
    );
    const input = container.querySelector("input")!;
    expect(input).toHaveAttribute("type", "password");
    fireEvent.click(container.querySelector("button")!);
    expect(input).toHaveAttribute("type", "text");
  });

  it("should use external error over internal validation", () => {
    const { container } = render(
      <InputPassword defaultValue="12345678" error="External required" />,
    );
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("External required")).toBeDefined();
    expect(screen.queryByText("Strong password")).toBeNull();
  });

  it("should have displayName", () => {
    expect(InputPassword.displayName).toBe("InputPassword");
  });
});

/* ------------------------------------------------------------------ */
/*  InputURL                                                          */
/* ------------------------------------------------------------------ */

describe("InputURL", () => {
  it("should render a url input", () => {
    render(<InputURL placeholder="https://..." />);
    expect(screen.getByPlaceholderText("https://...")).toHaveAttribute(
      "type",
      "url",
    );
  });

  it("should show error for invalid URL after blur", () => {
    render(<InputURL defaultValue="ftp://bad" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(
      screen.getByText("Must start with http:// or https://"),
    ).toBeDefined();
  });

  it("should show success for valid URL after blur", () => {
    render(<InputURL defaultValue="https://example.com" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("Valid URL")).toBeDefined();
  });

  it("should use external error over internal validation", () => {
    render(
      <InputURL defaultValue="https://example.com" error="External required" />,
    );
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("External required")).toBeDefined();
    expect(screen.queryByText("Valid URL")).toBeNull();
  });

  it("should have displayName", () => {
    expect(InputURL.displayName).toBe("InputURL");
  });
});

/* ------------------------------------------------------------------ */
/*  InputTel                                                          */
/* ------------------------------------------------------------------ */

describe("InputTel", () => {
  it("should render a tel input", () => {
    render(<InputTel placeholder="+1 555..." />);
    expect(screen.getByPlaceholderText("+1 555...")).toHaveAttribute(
      "type",
      "tel",
    );
  });

  it("should show error for invalid phone after blur", () => {
    render(<InputTel defaultValue="abc" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("Invalid phone format")).toBeDefined();
  });

  it("should show success for valid phone after blur", () => {
    render(<InputTel defaultValue="+1 (555) 000-0000" />);
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("Valid phone")).toBeDefined();
  });

  it("should use external error over internal validation", () => {
    render(
      <InputTel defaultValue="+1 (555) 000-0000" error="External required" />,
    );
    fireEvent.blur(screen.getByRole("textbox"));
    expect(screen.getByText("External required")).toBeDefined();
    expect(screen.queryByText("Valid phone")).toBeNull();
  });

  it("should have displayName", () => {
    expect(InputTel.displayName).toBe("InputTel");
  });
});

/* ------------------------------------------------------------------ */
/*  InputNumber                                                       */
/* ------------------------------------------------------------------ */

describe("InputNumber", () => {
  it("should render a number input", () => {
    render(<InputNumber placeholder="0–100" />);
    expect(screen.getByPlaceholderText("0–100")).toHaveAttribute(
      "type",
      "number",
    );
  });

  it("should show range error after blur", () => {
    const { container } = render(
      <InputNumber defaultValue={200} min={0} max={100} />,
    );
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("Must be 0–100")).toBeDefined();
  });

  it("should show success for valid number after blur", () => {
    const { container } = render(
      <InputNumber defaultValue={42} min={0} max={100} />,
    );
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("Valid number")).toBeDefined();
  });

  it("should show error for below min", () => {
    const { container } = render(<InputNumber defaultValue={-5} min={0} />);
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("Must be ≥ 0")).toBeDefined();
  });

  it("should show error for above max", () => {
    const { container } = render(<InputNumber defaultValue={200} max={100} />);
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("Must be ≤ 100")).toBeDefined();
  });

  it("should use external error over internal validation", () => {
    const { container } = render(
      <InputNumber
        defaultValue={42}
        min={0}
        max={100}
        error="External required"
      />,
    );
    fireEvent.blur(container.querySelector("input")!);
    expect(screen.getByText("External required")).toBeDefined();
    expect(screen.queryByText("Valid number")).toBeNull();
  });

  it("should have displayName", () => {
    expect(InputNumber.displayName).toBe("InputNumber");
  });
});
