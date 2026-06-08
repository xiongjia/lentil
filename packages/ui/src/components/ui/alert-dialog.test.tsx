import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogOverlay,
} from "./alert-dialog";
import { Button } from "./button";

describe("AlertDialog", () => {
  it("should render trigger element", () => {
    render(
      <AlertDialog open onOpenChange={() => {}}>
        <AlertDialogTrigger asChild>
          <button>Delete account</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Delete account")).toBeDefined();
  });

  it("should render content when open", () => {
    render(
      <AlertDialog open onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
          <p>Body content</p>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Are you sure?")).toBeDefined();
    expect(screen.getByText("This action cannot be undone.")).toBeDefined();
    expect(screen.getByText("Body content")).toBeDefined();
  });

  it("should render AlertDialogHeader", () => {
    render(
      <AlertDialog open onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Header Title</AlertDialogTitle>
            <AlertDialogDescription>Header description</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Header Title")).toBeDefined();
    expect(screen.getByText("Header description")).toBeDefined();
  });

  it("should render AlertDialogFooter with action and cancel", () => {
    render(
      <AlertDialog open onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure about this?
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.getByText("Confirm")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
    expect(screen.getByText("Continue")).toBeDefined();
  });

  it("should call onOpenChange when cancel is clicked", async () => {
    let open = true;
    const onOpenChange = (value: boolean) => {
      open = value;
    };

    render(
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);
    expect(open).toBe(false);
  });

  it("should call onOpenChange when action is clicked", async () => {
    let open = true;
    const onOpenChange = (value: boolean) => {
      open = value;
    };

    render(
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    const actionButton = screen.getByText("Continue");
    await userEvent.click(actionButton);
    expect(open).toBe(false);
  });

  it("should be hidden when open is false", () => {
    render(
      <AlertDialog open={false} onOpenChange={() => {}}>
        <AlertDialogContent>
          <AlertDialogTitle>Hidden</AlertDialogTitle>
        </AlertDialogContent>
      </AlertDialog>,
    );
    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("should have displayName", () => {
    expect(AlertDialogContent.displayName).toBeDefined();
    expect(AlertDialogTitle.displayName).toBeDefined();
    expect(AlertDialogDescription.displayName).toBeDefined();
    expect(AlertDialogHeader.displayName).toBeDefined();
    expect(AlertDialogFooter.displayName).toBeDefined();
    expect(AlertDialogAction.displayName).toBeDefined();
    expect(AlertDialogCancel.displayName).toBeDefined();
    expect(AlertDialogOverlay.displayName).toBeDefined();
  });
});

describe("AlertDialog controlled", () => {
  function ControlledAlertDialog() {
    const [open, setOpen] = useState(false);

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  it("should open dialog when trigger is clicked", async () => {
    render(<ControlledAlertDialog />);
    const trigger = screen.getByText("Delete");
    await userEvent.click(trigger);
    expect(screen.getByText("Delete Account")).toBeDefined();
  });

  it("should close dialog when cancel is clicked", async () => {
    render(<ControlledAlertDialog />);
    const trigger = screen.getByText("Delete");
    await userEvent.click(trigger);
    expect(screen.getByText("Delete Account")).toBeDefined();

    const cancelButton = screen.getByText("Cancel");
    await userEvent.click(cancelButton);
    expect(screen.queryByText("Delete Account")).toBeNull();
  });

  it("should close dialog when action is clicked", async () => {
    render(<ControlledAlertDialog />);
    const trigger = screen.getByText("Delete");
    await userEvent.click(trigger);
    expect(screen.getByText("Delete Account")).toBeDefined();

    const deleteButton = screen.getByText("Confirm Delete");
    await userEvent.click(deleteButton);
    expect(screen.queryByText("Delete Account")).toBeNull();
  });
});
