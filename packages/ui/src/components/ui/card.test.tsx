import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./card";
import React from "react";

describe("Card", () => {
  it("should render", () => {
    const { container } = render(<Card>Content</Card>);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("rounded-xl");
    expect(container.firstChild).toHaveClass("border");
    expect(container.firstChild).toHaveClass("bg-card");
  });

  it("should apply custom className", () => {
    const { container } = render(<Card className="custom-class">Custom</Card>);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should forward ref to div element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>With Ref</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should have displayName", () => {
    expect(Card.displayName).toBe("Card");
  });
});

describe("CardHeader", () => {
  it("should render", () => {
    const { container } = render(<CardHeader>Header</CardHeader>);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("flex");
    expect(container.firstChild).toHaveClass("flex-col");
    expect(container.firstChild).toHaveClass("space-y-1.5");
    expect(container.firstChild).toHaveClass("p-6");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CardHeader className="custom-header">Header</CardHeader>,
    );
    expect(container.firstChild).toHaveClass("custom-header");
  });

  it("should forward ref to div element", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<CardHeader ref={ref}>Header</CardHeader>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("should have displayName", () => {
    expect(CardHeader.displayName).toBe("CardHeader");
  });
});

describe("CardTitle", () => {
  it("should render", () => {
    const { container } = render(<CardTitle>Title</CardTitle>);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("font-semibold");
    expect(container.firstChild).toHaveClass("leading-none");
    expect(container.firstChild).toHaveClass("tracking-tight");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CardTitle className="custom-title">Title</CardTitle>,
    );
    expect(container.firstChild).toHaveClass("custom-title");
  });

  it("should have displayName", () => {
    expect(CardTitle.displayName).toBe("CardTitle");
  });
});

describe("CardDescription", () => {
  it("should render", () => {
    const { container } = render(
      <CardDescription>Description</CardDescription>,
    );
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("text-sm");
    expect(container.firstChild).toHaveClass("text-muted-foreground");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CardDescription className="custom-desc">Desc</CardDescription>,
    );
    expect(container.firstChild).toHaveClass("custom-desc");
  });

  it("should have displayName", () => {
    expect(CardDescription.displayName).toBe("CardDescription");
  });
});

describe("CardContent", () => {
  it("should render", () => {
    const { container } = render(<CardContent>Content</CardContent>);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("p-6");
    expect(container.firstChild).toHaveClass("pt-0");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CardContent className="custom-content">Content</CardContent>,
    );
    expect(container.firstChild).toHaveClass("custom-content");
  });

  it("should have displayName", () => {
    expect(CardContent.displayName).toBe("CardContent");
  });
});

describe("CardFooter", () => {
  it("should render", () => {
    const { container } = render(<CardFooter>Footer</CardFooter>);
    expect(container.firstChild).toBeDefined();
    expect(container.firstChild).toHaveClass("flex");
    expect(container.firstChild).toHaveClass("items-center");
    expect(container.firstChild).toHaveClass("p-6");
    expect(container.firstChild).toHaveClass("pt-0");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <CardFooter className="custom-footer">Footer</CardFooter>,
    );
    expect(container.firstChild).toHaveClass("custom-footer");
  });

  it("should have displayName", () => {
    expect(CardFooter.displayName).toBe("CardFooter");
  });
});
