import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
import React from "react";

describe("Tooltip", () => {
  it("should render trigger element", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    expect(screen.getByText("Hover me")).toBeDefined();
  });

  it("should render tooltip content when open", () => {
    render(
      <TooltipProvider>
        <Tooltip open>
          <TooltipTrigger asChild>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Help text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
    const elements = screen.queryAllByText("Help text");
    expect(elements.length).toBeGreaterThan(0);
  });

  it("should have displayName", () => {
    expect(TooltipContent.displayName).toBeDefined();
  });
});