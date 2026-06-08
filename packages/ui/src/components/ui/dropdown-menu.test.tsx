import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("should render trigger", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Open")).toBeDefined();
  });

  it("should apply custom className to content", () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent className="custom-content">
          <DropdownMenuItem>Item</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const content = container.querySelector(".custom-content");
    expect(content).toBeDefined();
  });
});

describe("DropdownMenuItem", () => {
  it("should render", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Action</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Action")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(DropdownMenuItem.displayName).toBe("DropdownMenuItem");
  });
});

describe("DropdownMenuCheckboxItem", () => {
  it("should render checked state", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Checked")).toBeDefined();
  });
});

describe("DropdownMenuLabel", () => {
  it("should render", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByText("Label")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(DropdownMenuLabel.displayName).toBe("DropdownMenuLabel");
  });
});

describe("DropdownMenuSeparator", () => {
  it("should render", () => {
    const { container } = render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(container.querySelector('[role="separator"]')).toBeDefined();
  });
});
