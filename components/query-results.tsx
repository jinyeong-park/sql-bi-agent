"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface QueryResultsProps {
  results: any[]
}

export default function QueryResults({ results }: QueryResultsProps) {
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar")

  if (!results || results.length === 0) {
    return <div className="text-center py-4">No results to display</div>
  }

  // Get column names from the first result
  const columns = Object.keys(results[0])

  // Try to automatically determine numeric columns for charting
  const numericColumns = columns.filter(
    (col) => typeof results[0][col] === "number" || !isNaN(Number.parseFloat(results[0][col])),
  )

  // Try to find a good candidate for the X axis (non-numeric)
  const nonNumericColumns = columns.filter(
    (col) => typeof results[0][col] !== "number" && isNaN(Number.parseFloat(results[0][col])),
  )

  const xAxisColumn = nonNumericColumns.length > 0 ? nonNumericColumns[0] : columns[0]
  const yAxisColumn = numericColumns.length > 0 ? numericColumns[0] : columns[1] || columns[0]

  // Prepare data for charts
  const chartData = results.map((row) => ({
    ...row,
    [yAxisColumn]: typeof row[yAxisColumn] === "number" ? row[yAxisColumn] : Number.parseFloat(row[yAxisColumn]) || 0,
  }))

  // Colors for pie chart
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FCCDE5",
    "#8DD1E1",
    "#FFFFB3",
    "#FB8072",
  ]

  return (
    <div className="space-y-4">
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-secondary">
                  {columns.map((column, index) => (
                    <th key={index} className="px-4 py-2 text-left text-sm">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-secondary">
                    {columns.map((column, colIndex) => (
                      <td key={colIndex} className="px-4 py-2 text-sm">
                        {row[column] !== null ? String(row[column]) : "NULL"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="chart" className="mt-4">
          <div className="space-y-4">
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setChartType("bar")}
                className={`px-3 py-1 rounded text-xs ${chartType === "bar" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded text-xs ${chartType === "line" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                Line
              </button>
              <button
                onClick={() => setChartType("pie")}
                className={`px-3 py-1 rounded text-xs ${chartType === "pie" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}
              >
                Pie
              </button>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisColumn} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey={yAxisColumn} fill="#3b82f6" />
                  </BarChart>
                ) : chartType === "line" ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={xAxisColumn} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey={yAxisColumn} stroke="#3b82f6" />
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey={yAxisColumn}
                      nameKey={xAxisColumn}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

