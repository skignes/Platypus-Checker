"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BuildHistory, Section } from "@/lib/definitions";
import { calculatePassRate, getEllapsedTime } from "@/lib/utils";

interface TestResultsChartsProps {
  history: BuildHistory;
  sections: Section[];
}

export function TestResultsCharts({
  history,
  sections,
}: TestResultsChartsProps) {
  // if (!testData) {
  //   return (
  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //       <Card className="bg-zinc-900 border-zinc-800">
  //         <CardHeader className="pb-2">
  //           <CardTitle className="text-white">Pass Rate by Section</CardTitle>
  //           <CardDescription>Percentage of passing tests in each section</CardDescription>
  //         </CardHeader>
  //         <CardContent className="h-[240px] flex items-center justify-center">
  //           <p className="text-zinc-400">No chart data available</p>
  //         </CardContent>
  //       </Card>
  //       <Card className="bg-zinc-900 border-zinc-800">
  //         <CardHeader className="pb-2">
  //           <CardTitle className="text-white">Historical Performance</CardTitle>
  //           <CardDescription>Pass rate trend over time</CardDescription>
  //         </CardHeader>
  //         <CardContent className="h-[240px] flex items-center justify-center">
  //           <p className="text-zinc-400">No chart data available</p>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

  const passRateData = sections.map((section) => ({
    name: section.name,
    passRate: section.passRate,
    color: getColorForPassRate(section.passRate),
  }));

  const historyData = history
    .map((project) => ({
      date: getEllapsedTime(project.build.suites[0].timestamp),
      passRate: calculatePassRate(project),
    }))
    .reverse();

  if (passRateData.length === 0 || history.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Pass Rate by Section</CardTitle>
            <CardDescription>
              Percentage of passing tests in each section
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center">
            <p className="text-zinc-400">No chart data available</p>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Historical Performance</CardTitle>
            <CardDescription>Pass rate trend over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[240px] flex items-center justify-center">
            <p className="text-zinc-400">No chart data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartConfig = {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Pass Rate by Section</CardTitle>
          <CardDescription>
            Percentage of passing tests in each section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[240px]" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={passRateData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9ca3af" }}
                  axisLine={{ stroke: "#333" }}
                  tickLine={{ stroke: "#333" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af" }}
                  axisLine={{ stroke: "#333" }}
                  tickLine={{ stroke: "#333" }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltip>
                          <ChartTooltipContent
                            content={
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold">
                                  {payload[0].payload.name}
                                </span>
                                <span className="text-sm">
                                  Pass Rate: {payload[0].value}%
                                </span>
                              </div>
                            }
                          />
                        </ChartTooltip>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="passRate" radius={[4, 4, 0, 0]}>
                  {passRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-white">Historical Performance</CardTitle>
          <CardDescription>Pass rate trend over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer className="h-[240px]" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={historyData}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#333"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9ca3af" }}
                  axisLine={{ stroke: "#333" }}
                  tickLine={{ stroke: "#333" }}
                />
                <YAxis
                  tick={{ fill: "#9ca3af" }}
                  axisLine={{ stroke: "#333" }}
                  tickLine={{ stroke: "#333" }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <ChartTooltip>
                          <ChartTooltipContent
                            content={
                              <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-bold">
                                  {payload[0].payload.date}
                                </span>
                                <span className="text-sm">
                                  Pass Rate: {payload[0].value}%
                                </span>
                              </div>
                            }
                          />
                        </ChartTooltip>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="passRate"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function getColorForPassRate(passRate: number): string {
  if (passRate >= 90) return "#10b981"; // emerald-500
  if (passRate > 50) return "#f59e0b"; // amber-500
  return "#ef4444"; // red-500
}
