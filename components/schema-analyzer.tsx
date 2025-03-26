"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { analyzeSchema, generateQuerySuggestions } from "@/app/actions"
import { Loader2, Database, Lightbulb, FileCode } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface SchemaAnalyzerProps {
  onSchemaAnalyzed: (analysis: any) => void
  onSuggestionsGenerated?: (suggestions: any) => void
}

export default function SchemaAnalyzer({ onSchemaAnalyzed, onSuggestionsGenerated }: SchemaAnalyzerProps) {
  const [schema, setSchema] = useState("")
  const [loading, setLoading] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>("schema")
  const [generatingSuggestions, setGeneratingSuggestions] = useState<boolean>(false)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!schema.trim()) return

    setLoading(true)
    try {
      const analysis = await analyzeSchema(schema)
      onSchemaAnalyzed(analysis)

      // Generate suggestions automatically after schema analysis
      await generateSuggestions()
    } catch (error) {
      console.error("Error analyzing schema:", error)
      toast({
        title: "Error",
        description: "Failed to analyze schema. Please check your SQL syntax.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSuggestions = async () => {
    if (!schema.trim()) return

    setGeneratingSuggestions(true)
    try {
      // Get query suggestions
      const querySuggestions = await generateQuerySuggestions(schema)

      // Get insights and optimization suggestions
      const insightSuggestions = await analyzeSchema(schema, "insights")

      const allSuggestions = {
        queries: querySuggestions,
        insights: insightSuggestions.insights || [],
        optimizations: insightSuggestions.optimizations || [],
      }

      setSuggestions(allSuggestions)

      if (onSuggestionsGenerated) {
        onSuggestionsGenerated(allSuggestions)
      }

      // Switch to suggestions tab
      setActiveTab("suggestions")

      toast({
        title: "Suggestions Generated",
        description: "Query and insight suggestions have been generated based on your schema.",
      })
    } catch (error) {
      console.error("Error generating suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to generate suggestions.",
        variant: "destructive",
      })
    } finally {
      setGeneratingSuggestions(false)
    }
  }

  const exampleSchema = `
CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  signup_date DATE,
  status VARCHAR(20)
);

CREATE TABLE products (
  product_id INT PRIMARY KEY,
  name VARCHAR(100),
  category VARCHAR(50),
  price DECIMAL(10, 2),
  inventory INT
);

CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_id INT REFERENCES customers(customer_id),
  order_date DATE,
  total_amount DECIMAL(10, 2),
  status VARCHAR(20)
);

CREATE TABLE order_items (
  item_id INT PRIMARY KEY,
  order_id INT REFERENCES orders(order_id),
  product_id INT REFERENCES products(product_id),
  quantity INT,
  price DECIMAL(10, 2)
);`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5" />
          Database Schema Analyzer
        </CardTitle>
        <CardDescription>Paste your database schema to get insights and improve query generation</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="schema">Schema Input</TabsTrigger>
            <TabsTrigger value="suggestions" disabled={!suggestions}>
              Suggestions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="schema" className="text-sm font-medium">
                  Database Schema (SQL CREATE statements)
                </label>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSchema(exampleSchema)}
                    className="text-xs"
                  >
                    Use Example
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSchema("")}
                    className="text-xs"
                    disabled={!schema.trim()}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <Textarea
                id="schema"
                placeholder="Paste your CREATE TABLE statements here..."
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleAnalyze} disabled={loading || !schema.trim()} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>Analyze Schema</>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard
                    .readText()
                    .then((text) => {
                      if (text.trim()) {
                        setSchema(text)
                        toast({
                          title: "Pasted from clipboard",
                          description: "Schema has been pasted from your clipboard",
                        })
                      }
                    })
                    .catch((err) => {
                      console.error("Failed to read clipboard:", err)
                      toast({
                        title: "Error",
                        description: "Failed to read from clipboard",
                        variant: "destructive",
                      })
                    })
                }}
              >
                <FileCode className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4">
            {suggestions ? (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-medium flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                    Suggested Queries
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {suggestions.queries.map((query: string, index: number) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="justify-start h-auto py-2 px-3 text-left"
                        onClick={() => {
                          if (onSuggestionsGenerated) {
                            onSuggestionsGenerated({ selectedQuery: query })
                          }
                        }}
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>

                {suggestions.insights && suggestions.insights.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Potential Insights</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      {suggestions.insights.map((insight: string, index: number) => (
                        <li key={index} className="text-sm">
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {suggestions.optimizations && suggestions.optimizations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Schema Optimization Tips</h3>
                    <ul className="space-y-2 list-disc pl-5">
                      {suggestions.optimizations.map((tip: string, index: number) => (
                        <li key={index} className="text-sm">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button
                  onClick={generateSuggestions}
                  variant="outline"
                  disabled={generatingSuggestions}
                  className="w-full"
                >
                  {generatingSuggestions ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>Regenerate Suggestions</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Suggestions Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Analyze your schema first to get query and insight suggestions
                </p>
                <Button onClick={handleAnalyze} disabled={loading || !schema.trim()}>
                  Analyze Schema
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

