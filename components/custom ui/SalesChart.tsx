"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Helper to format large numbers
const formatNumber = (num: number) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
};

const SalesChart = ({ data }: { data: any[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, bottom: 30, left: 0 }}
      >
        {/* Grid */}
        <CartesianGrid stroke="#e0e0e0" strokeDasharray="5 5" />
        
        {/* X-Axis */}
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: "#555" }}
          angle={-45}         // Rotate labels for better mobile readability
          textAnchor="end"
          interval={0}         // Show all labels
          height={60}          // Make space for rotated labels
        />
        
        {/* Y-Axis */}
        <YAxis
          tickFormatter={formatNumber}
          tick={{ fontSize: 12, fill: "#555" }}
        />

        {/* Tooltip */}
        <Tooltip
          formatter={(value: any) =>
            typeof value === "number" ? formatNumber(value) : value
          }
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "10px",
            fontSize: "14px",
          }}
        />

        {/* Line */}
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#4f46e5"      // prettier color
          strokeWidth={3}
          dot={{ r: 4, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
