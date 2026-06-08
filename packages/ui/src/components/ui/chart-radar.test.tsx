import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChartRadar } from "./chart-radar";

const data = [
  { subject: "Speed", A: 120, B: 110 },
  { subject: "Power", A: 98, B: 130 },
];

const series = [
  { key: "A", color: "#3b82f6", name: "Player A" },
  { key: "B", color: "#ef4444", name: "Player B" },
];

describe("ChartRadar", () => {
  it("should render", () => {
    const { container } = render(
      <ChartRadar data={data} axes={["subject"]} series={series} />,
    );
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeDefined();
  });

  it("should apply custom height", () => {
    const { container } = render(
      <ChartRadar
        data={data}
        axes={["subject"]}
        series={series}
        height={400}
      />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe("400px");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChartRadar
        data={data}
        axes={["subject"]}
        series={series}
        className="custom-radar"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-radar");
  });
});
