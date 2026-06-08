import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChartArea } from "./chart-area";

const data = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
];

const series = [{ key: "revenue", color: "#3b82f6", name: "Revenue" }];

describe("ChartArea", () => {
  it("should render", () => {
    const { container } = render(
      <ChartArea data={data} xKey="month" series={series} />,
    );
    expect(
      container.querySelector(".recharts-responsive-container"),
    ).toBeDefined();
  });

  it("should apply custom height", () => {
    const { container } = render(
      <ChartArea data={data} xKey="month" series={series} height={400} />,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.height).toBe("400px");
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ChartArea
        data={data}
        xKey="month"
        series={series}
        className="custom-chart"
      />,
    );
    expect(container.firstChild).toHaveClass("custom-chart");
  });
});
