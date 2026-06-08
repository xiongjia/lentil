import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogOverlay,
} from "./dialog";
import { Button } from "./button";

describe("Dialog", () => {
  it("should render trigger element", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogTrigger asChild>
          <button>Open dialog</button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Open dialog")).toBeDefined();
  });

  it("should render content when open", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>Dialog description</DialogDescription>
          <p>Body content</p>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Dialog Title")).toBeDefined();
    expect(screen.getByText("Dialog description")).toBeDefined();
    expect(screen.getByText("Body content")).toBeDefined();
  });

  it("should render DialogHeader", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Header Title</DialogTitle>
            <DialogDescription>Header description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Header Title")).toBeDefined();
  });

  it("should render DialogFooter", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Footer Dialog</DialogTitle>
          <DialogDescription>Footer description</DialogDescription>
          <DialogFooter>
            <Button>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Footer description")).toBeDefined();
    expect(screen.getByText("Save")).toBeDefined();
  });

  it("should render close button inside content", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Close Test</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    const closeButton = screen.getByRole("button", { name: "Close" });
    expect(closeButton).toBeDefined();
  });

  it("should render DialogClose as child", () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Close Child</DialogTitle>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("should call onOpenChange when close button is clicked", async () => {
    let open = true;
    const onOpenChange = (value: boolean) => {
      open = value;
    };

    render(
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Close Test</DialogTitle>
        </DialogContent>
      </Dialog>,
    );

    const closeButton = screen.getByRole("button", { name: "Close" });
    await userEvent.click(closeButton);
    expect(open).toBe(false);
  });

  it("should be hidden when open is false", () => {
    render(
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Hidden Dialog</DialogTitle>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText("Hidden Dialog")).toBeNull();
  });

  it("should have displayName", () => {
    expect(DialogContent.displayName).toBeDefined();
    expect(DialogTitle.displayName).toBeDefined();
    expect(DialogDescription.displayName).toBeDefined();
    expect(DialogHeader.displayName).toBeDefined();
    expect(DialogFooter.displayName).toBeDefined();
    expect(DialogOverlay.displayName).toBeDefined();
  });
});

describe("Dialog controlled", () => {
  function ControlledDialog() {
    const [open, setOpen] = useState(false);

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Open</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Controlled Dialog</DialogTitle>
          <DialogDescription>
            This dialog is controlled with state.
          </DialogDescription>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Close Dialog</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  it("should open dialog when trigger is clicked", async () => {
    render(<ControlledDialog />);
    const trigger = screen.getByText("Open");
    await userEvent.click(trigger);
    expect(screen.getByText("Controlled Dialog")).toBeDefined();
  });

  it("should close dialog when close button is clicked", async () => {
    render(<ControlledDialog />);
    const trigger = screen.getByText("Open");
    await userEvent.click(trigger);
    expect(screen.getByText("Controlled Dialog")).toBeDefined();

    const closeButton = screen.getByRole("button", { name: "Close Dialog" });
    await userEvent.click(closeButton);
    expect(screen.queryByText("Controlled Dialog")).toBeNull();
  });
});
