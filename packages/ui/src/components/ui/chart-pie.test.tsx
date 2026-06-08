import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChartPie } from "./chart-pie";

const data = [
  { name: "A", value: 400, color: "#3b82f6" },
  { name: "B", value: 300, color: "#10b981" },
];

describe("ChartPie", () => {
  it("should render", () => {
    const { container } = render(<ChartPie data={data} />);
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeDefined();
  });

  it("should apply custom height", () => {
    const { container } = render(<ChartPie data={data} height={400} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe("400px");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChartPie data={data} className="custom-pie" />,
    );
    expect(container.firstChild).toHaveClass("custom-pie");
  });
});
