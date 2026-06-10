import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Square, Layers } from "lucide-react";
import type { PageMeta } from "../lib/registry";
import { PageSearch } from "./page-search";

const mockNavigate = vi.fn();

vi.mock("../lib/router", () => ({
  useHashRoute: () => ["overview", mockNavigate],
}));

vi.mock("../lib/registry", () => ({
  pagesMeta: [
    {
      slug: "button",
      title: "Button",
      description: "Button variants, sizes, and usage",
      icon: Square,
    },
    {
      slug: "card",
      title: "Card",
      description: "Card layout and sub-components",
      icon: Layers,
    },
    {
      slug: "dialog",
      title: "Dialog",
      description: "Modal window",
      icon: Square,
    },
    {
      slug: "alert-dialog",
      title: "Alert Dialog",
      description: "Critical confirmations",
      icon: Square,
    },
  ] as PageMeta[],
}));

// jsdom doesn't implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

const renderSearch = () => {
  return render(<PageSearch />);
};

const getInput = (): HTMLInputElement => {
  return screen.getByPlaceholderText(/Search components/) as HTMLInputElement;
};

beforeEach(() => {
  mockNavigate.mockClear();
});

describe("PageSearch", () => {
  it("renders a search input", () => {
    renderSearch();
    const input = getInput();
    expect(input).toBeDefined();
    expect(input).toHaveAttribute("type", "search");
  });

  it("shows no dropdown when empty", () => {
    renderSearch();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("shows dropdown on typing a matching query", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("hides dropdown when query is cleared", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    expect(screen.getByRole("listbox")).toBeDefined();
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it('shows "No results found" for non-matching query', () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "zzzznomatch" } });
    expect(screen.getByText("No results found")).toBeDefined();
  });

  it("filters by title", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "dialog" } });
    expect(screen.getByText("Dialog")).toBeDefined();
    expect(screen.getByText("Alert Dialog")).toBeDefined();
  });

  it("filters case-insensitively", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "BUTTON" } });
    expect(screen.getByText("Button")).toBeDefined();
  });

  it("clicking a result navigates and closes", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    fireEvent.click(screen.getByText("Button"));
    expect(mockNavigate).toHaveBeenCalledWith("button");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("hover highlights the row", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "dialog" } });
    fireEvent.mouseEnter(screen.getByText("Dialog"));
    expect(screen.getByRole("option", { selected: true })).toBeDefined();
  });

  it("ArrowDown selects first result", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "dialog" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent(
      "Dialog",
    );
  });

  it("Enter on selected result navigates", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith("button");
  });

  it("Escape closes dropdown and clears input", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    expect(screen.getByRole("listbox")).toBeDefined();
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(input.value).toBe("");
  });

  it("closes dropdown on click outside", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    expect(screen.getByRole("listbox")).toBeDefined();
    act(() => {
      fireEvent.mouseDown(document.body);
    });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("pressing ArrowUp at first item returns to no selection", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "dialog" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });
    // No option should be selected after ArrowUp from first item
    const options = screen.getAllByRole("option");
    expect(
      options.every((o) => o.getAttribute("aria-selected") === "false"),
    ).toBe(true);
  });

  it("ArrowDown at last result stays at last", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "dialog" } });
    // 2 results: Dialog, Alert Dialog
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 0: Dialog
    fireEvent.keyDown(input, { key: "ArrowDown" }); // 1: Alert Dialog
    fireEvent.keyDown(input, { key: "ArrowDown" }); // stays at 1
    expect(screen.getByRole("option", { selected: true })).toHaveTextContent(
      "Alert Dialog",
    );
  });

  it("Enter with no selection does nothing", () => {
    renderSearch();
    const input = getInput();
    input.focus();
    fireEvent.change(input, { target: { value: "button" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
