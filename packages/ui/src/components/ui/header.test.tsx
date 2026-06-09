import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";
describe("Header", () => {
  it("should render with title", () => {
    render(<Header title="Test Header" />);
    expect(screen.getByText("Test Header")).toBeDefined();
  });

  it("should render children in right slot", () => {
    render(
      <Header title="Test">
        <button>Action</button>
      </Header>,
    );
    expect(screen.getByText("Action")).toBeDefined();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <Header title="Test" className="custom-class" />,
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should render start slot content", () => {
    render(
      <Header title="Test" start={<button>Start Btn</button>}>
        <button>Child Btn</button>
      </Header>,
    );
    expect(screen.getByText("Start Btn")).toBeDefined();
  });

  it("should render start before title in DOM order", () => {
    const { container } = render(
      <Header title="Title Text" start={<button>Start Btn</button>} />,
    );
    const header = container.firstChild!;
    const children = Array.from(header.childNodes);
    const startNode = children[0] as HTMLElement;
    const titleNode = children[1] as HTMLElement;

    expect(startNode).toContainElement(screen.getByText("Start Btn"));
    expect(titleNode.tagName).toBe("H1");
    expect(titleNode).toHaveTextContent("Title Text");
  });

  it("should render children after title in DOM order", () => {
    const { container } = render(
      <Header title="Title Text">
        <button>Child Btn</button>
      </Header>,
    );
    const header = container.firstChild!;
    const children = Array.from(header.childNodes);
    const titleNode = children[0] as HTMLElement;
    const rightSlot = children[1] as HTMLElement;

    expect(titleNode.tagName).toBe("H1");
    expect(rightSlot).toContainElement(screen.getByText("Child Btn"));
  });

  it("should render start, title, children in correct order", () => {
    const { container } = render(
      <Header title="Title" start={<span>Left</span>}>
        <span>Right</span>
      </Header>,
    );
    const header = container.firstChild!;
    const children = Array.from(header.childNodes);

    expect(children[0]).toContainElement(screen.getByText("Left"));
    expect(children[1]).toHaveTextContent("Title");
    expect(children[2]).toContainElement(screen.getByText("Right"));
  });

  it("should not render start wrapper when start is omitted", () => {
    const { container } = render(<Header title="Test" />);
    const header = container.firstChild!;
    // Only h1 should be present (no empty start/children/end div)
    expect(header.childNodes.length).toBe(1);
  });

  it("should render end slot content", () => {
    render(
      <Header
        title="Test"
        start={<button>Start Btn</button>}
        end={<button>End Btn</button>}
      >
        <button>Child Btn</button>
      </Header>,
    );
    expect(screen.getByText("End Btn")).toBeDefined();
  });

  it("should render end as last child in DOM order", () => {
    const { container } = render(
      <Header
        title="Title"
        start={<span>Start</span>}
        end={<span>End</span>}
      >
        <span>Child</span>
      </Header>,
    );
    const header = container.firstChild!;
    const nodes = Array.from(header.childNodes);

    expect(nodes[0]).toContainElement(screen.getByText("Start"));
    expect(nodes[1]).toHaveTextContent("Title");
    expect(nodes[2]).toContainElement(screen.getByText("Child"));
    expect(nodes[3]).toContainElement(screen.getByText("End"));
  });

  it("should apply ml-auto to end wrapper", () => {
    const { container } = render(
      <Header title="Test" end={<button>End</button>} />,
    );
    const header = container.firstChild!;
    const nodes = Array.from(header.childNodes) as HTMLElement[];
    const endWrapper = nodes[nodes.length - 1];

    expect(endWrapper.classList).toContain("ml-auto");
  });

  it("should not render end wrapper when end is omitted", () => {
    const { container } = render(
      <Header title="Test" start={<button>Start</button>}>
        <button>Child</button>
      </Header>,
    );
    const header = container.firstChild!;
    const nodes = Array.from(header.childNodes) as HTMLElement[];

    // When end is omitted, no element should have ml-auto
    const hasMlAuto = nodes.some((n) => n.classList?.contains("ml-auto"));
    expect(hasMlAuto).toBe(false);
    // With start + title + children, expect 3 child nodes
    expect(nodes.length).toBe(3);
  });

  it("should have displayName", () => {
    expect(Header.displayName).toBe("Header");
  });
});
