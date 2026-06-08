"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "../../lib/utils";

interface ChartPieProps {
  data: { name: string; value: number; color: string }[];
  height?: number;
  className?: string;
}

function ChartPie({ data, height = 300, className }: ChartPieProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data.map((d) => ({ ...d, fill: d.color }))}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          />
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export { ChartPie };
export type { ChartPieProps };
