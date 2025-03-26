import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

interface QueryExplainerProps {
  explanation: string
  sqlQuery?: string
}

export default function QueryExplainer({ explanation, sqlQuery }: QueryExplainerProps) {
  // Format the explanation to be line by line if SQL query is provided
  const formattedExplanation = () => {
    if (!sqlQuery) return <p>{explanation}</p>

    // Split the SQL query into lines
    const sqlLines = sqlQuery
      .trim()
      .split("\n")
      .filter((line) => line.trim().length > 0)

    // If the explanation is short or there's only one SQL line, just return the explanation
    if (sqlLines.length <= 1 || explanation.length < 100) {
      return <p>{explanation}</p>
    }

    // Try to split the explanation into roughly the same number of parts as SQL lines
    // This is a simple approach - in a real app, you'd want more sophisticated parsing
    const parts = []
    const avgCharsPerLine = Math.ceil(explanation.length / sqlLines.length)
    const currentPos = 0

    // Create explanation parts based on sentence boundaries
    const sentences = explanation.match(/[^.!?]+[.!?]+/g) || [explanation]
    let currentPart = ""

    for (const sentence of sentences) {
      if (currentPart.length + sentence.length > avgCharsPerLine && currentPart.length > 0) {
        parts.push(currentPart.trim())
        currentPart = sentence
      } else {
        currentPart += sentence
      }
    }

    if (currentPart.length > 0) {
      parts.push(currentPart.trim())
    }

    // Ensure we have at least as many parts as SQL lines
    while (parts.length < sqlLines.length) {
      parts.push("")
    }

    // Create the line-by-line explanation
    return (
      <div className="space-y-4">
        {sqlLines.map((line, index) => (
          <div key={index} className="space-y-2">
            <pre className="bg-secondary/30 p-2 rounded-md overflow-x-auto text-xs">
              <code>{line}</code>
            </pre>
            {parts[index] && <p className="text-sm pl-4 border-l-2 border-primary/30">{parts[index]}</p>}
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Query Explanation
        </CardTitle>
        <CardDescription>Here's what this SQL query does in plain English</CardDescription>
      </CardHeader>
      <CardContent>{formattedExplanation()}</CardContent>
    </Card>
  )
}

