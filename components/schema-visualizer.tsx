"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Share2 } from "lucide-react"

interface SchemaVisualizerProps {
  schemaAnalysis: any
}

export default function SchemaVisualizer({ schemaAnalysis }: SchemaVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !schemaAnalysis || !schemaAnalysis.tables) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = 500

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw tables
    const tables = schemaAnalysis.tables
    const tableWidth = 180
    const tableHeight = 30 + tables.reduce((max: number, table: any) => Math.max(max, table.columns.length), 0) * 20

    const padding = 20
    const horizontalSpacing = (canvas.width - tables.length * tableWidth) / (tables.length + 1)

    // Draw each table
    tables.forEach((table: any, index: number) => {
      const x = horizontalSpacing + index * (tableWidth + horizontalSpacing)
      const y = 50

      // Draw table header
      ctx.fillStyle = "#3b82f6"
      ctx.fillRect(x, y, tableWidth, 30)

      // Draw table name
      ctx.fillStyle = "white"
      ctx.font = "bold 14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(table.name, x + tableWidth / 2, y + 20)

      // Draw table body
      ctx.fillStyle = "#f8fafc"
      ctx.fillRect(x, y + 30, tableWidth, tableHeight - 30)

      // Draw columns
      ctx.fillStyle = "#334155"
      ctx.font = "12px Arial"
      ctx.textAlign = "left"

      table.columns.forEach((column: any, colIndex: number) => {
        const isPrimary = column.isPrimary
        const isForeign = column.isForeign

        // Indicate primary/foreign keys
        let prefix = ""
        if (isPrimary) prefix = "🔑 "
        else if (isForeign) prefix = "🔗 "

        ctx.fillText(`${prefix}${column.name} (${column.type})`, x + padding, y + 50 + colIndex * 20)
      })

      // Draw table border
      ctx.strokeStyle = "#cbd5e1"
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, tableWidth, tableHeight)
    })

    // Draw relationships if available
    if (schemaAnalysis.relationships) {
      ctx.strokeStyle = "#64748b"
      ctx.lineWidth = 1

      schemaAnalysis.relationships.forEach((rel: any) => {
        const fromTable = tables.findIndex((t: any) => t.name === rel.from.split(".")[0])
        const toTable = tables.findIndex((t: any) => t.name === rel.to.split(".")[0])

        if (fromTable !== -1 && toTable !== -1) {
          const fromX = horizontalSpacing + fromTable * (tableWidth + horizontalSpacing) + tableWidth
          const fromY = 50 + tableHeight / 2

          const toX = horizontalSpacing + toTable * (tableWidth + horizontalSpacing)
          const toY = 50 + tableHeight / 2

          // Draw line
          ctx.beginPath()
          ctx.moveTo(fromX, fromY)
          ctx.lineTo(toX, toY)
          ctx.stroke()

          // Draw arrow
          const arrowSize = 8
          const angle = Math.atan2(toY - fromY, toX - fromX)

          ctx.beginPath()
          ctx.moveTo(toX, toY)
          ctx.lineTo(toX - arrowSize * Math.cos(angle - Math.PI / 6), toY - arrowSize * Math.sin(angle - Math.PI / 6))
          ctx.lineTo(toX - arrowSize * Math.cos(angle + Math.PI / 6), toY - arrowSize * Math.sin(angle + Math.PI / 6))
          ctx.closePath()
          ctx.fillStyle = "#64748b"
          ctx.fill()
        }
      })
    }
  }, [schemaAnalysis])

  if (!schemaAnalysis || !schemaAnalysis.tables) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Share2 className="mr-2 h-5 w-5" />
          Schema Visualization
        </CardTitle>
        <CardDescription>Visual representation of your database schema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto">
          <canvas ref={canvasRef} className="w-full" style={{ minHeight: "500px" }} />
        </div>
      </CardContent>
    </Card>
  )
}

