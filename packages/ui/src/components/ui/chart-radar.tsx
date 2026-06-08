"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "../../lib/utils";

interface ChartRadarProps {
  data: Record<string, unknown>[];
  axes: string[];
  series: { key: string; color: string; name?: string }[];
  height?: number;
  className?: string;
}

function ChartRadar({
  data,
  axes,
  series,
  height = 300,
  className,
}: ChartRadarProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid className="stroke-muted" />
          <PolarAngleAxis dataKey={axes[0]} className="text-xs" />
          {axes.slice(1).map((axis) => (
            <PolarAngleAxis key={axis} dataKey={axis} className="text-xs" />
          ))}
          <PolarRadiusAxis className="text-xs" />
          {series.map((s) => (
            <Radar
              key={s.key}
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.2}
              name={s.name ?? s.key}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export { ChartRadar };
export type { ChartRadarProps };
