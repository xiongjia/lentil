import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from "./sheet";
describe("Sheet", () => {
  it("should render trigger element", () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetTrigger asChild>
          <button>Open sheet</button>
        </SheetTrigger>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Open sheet")).toBeDefined();
  });

  it("should render content when open", () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetContent>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
          <p>Body content</p>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Sheet Title")).toBeDefined();
    expect(screen.getByText("Sheet description")).toBeDefined();
    expect(screen.getByText("Body content")).toBeDefined();
  });

  it("should render SheetHeader", () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Header Title</SheetTitle>
            <SheetDescription>Header description</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Header Title")).toBeDefined();
  });

  it("should render SheetFooter", () => {
    render(
      <Sheet open onOpenChange={() => {}}>
        <SheetContent>
          <SheetTitle>Footer Sheet</SheetTitle>
          <SheetDescription>Footer description</SheetDescription>
          <SheetFooter>Footer content</SheetFooter>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByText("Footer content")).toBeDefined();
  });

  it("should have displayName", () => {
    expect(SheetContent.displayName).toBeDefined();
    expect(SheetTitle.displayName).toBeDefined();
    expect(SheetDescription.displayName).toBeDefined();
  });
});
