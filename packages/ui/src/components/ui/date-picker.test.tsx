import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("should render with placeholder", () => {
    render(<DatePicker placeholder="Select a date" />);
    expect(screen.getByText("Select a date")).toBeDefined();
  });

  it("should render default placeholder when no date", () => {
    render(<DatePicker />);
    expect(screen.getByText("Pick a date")).toBeDefined();
  });

  it("should render formatted date when date is provided", () => {
    const date = new Date(2024, 5, 15); // June 15, 2024
    render(<DatePicker date={date} />);
    // date-fns format "PPP" => "June 15th, 2024" (locale-dependent)
    const button = screen.getByRole("button");
    expect(button.textContent).toContain("2024");
  });

  it("should apply custom className", () => {
    const { container } = render(<DatePicker className="custom-class" />);
    const button = container.querySelector("button");
    expect(button?.className).toContain("custom-class");
  });

  it("should render disabled button", () => {
    render(<DatePicker disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("should open calendar on click", async () => {
    render(<DatePicker />);
    const button = screen.getByRole("button");
    await userEvent.click(button);
    // Calendar should appear
    const grid = document.querySelector("[role='grid']");
    expect(grid).toBeDefined();
  });

  it("should have displayName", () => {
    expect(DatePicker.displayName).toBe("DatePicker");
  });
});

describe("DatePicker controlled", () => {
  function ControlledDatePicker() {
    const [date, setDate] = useState<Date | undefined>(new Date(2024, 0, 15));
    return <DatePicker date={date} onDateChange={setDate} />;
  }

  it("should show the selected date", () => {
    render(<ControlledDatePicker />);
    const button = screen.getByRole("button");
    expect(button.textContent).toContain("2024");
  });
});
