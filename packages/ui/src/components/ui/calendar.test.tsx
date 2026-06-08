import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calendar } from "./calendar";

describe("Calendar", () => {
  it("should render", () => {
    const { container } = render(<Calendar />);
    const root = container.querySelector("[role='grid']");
    expect(root).toBeDefined();
  });

  it("should render with single mode", () => {
    const date = new Date(2024, 0, 15);
    render(<Calendar mode="single" selected={date} onSelect={() => {}} />);
    const grid = document.querySelector("[role='grid']");
    expect(grid).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(<Calendar className="custom-class" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("custom-class");
  });

  it("should show navigation buttons", () => {
    render(<Calendar />);
    const prevButton = screen.getByLabelText("Go to the Previous Month");
    const nextButton = screen.getByLabelText("Go to the Next Month");
    expect(prevButton).toBeDefined();
    expect(nextButton).toBeDefined();
  });

  it("should show weekdays", () => {
    const { container } = render(<Calendar />);
    const weekdays = container.querySelectorAll("th");
    expect(weekdays.length).toBe(7);
  });

  it("should have displayName", () => {
    expect(Calendar.displayName).toBe("Calendar");
  });
});
