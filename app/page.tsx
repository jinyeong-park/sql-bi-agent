"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateSqlQuery, generateQuerySuggestions } from "./actions"
import { Loader2, Copy, Check, Database, Code, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import SchemaAnalyzer from "@/components/schema-analyzer"
import SchemaVisualizer from "@/components/schema-visualizer"
import QuerySuggestions from "@/components/query-suggestions"
import QueryHistory from "@/components/query-history"
import { v4 as uuidv4 } from "uuid"

// Update the QueryHistoryItem interface to include a summary field
interface QueryHistoryItem {
  id: string
  prompt: string
  sqlQuery: string
  explanation: string
  summary: string
  timestamp: Date
}

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [schema, setSchema] = useState("")
  const [sqlQuery, setSqlQuery] = useState("")
  const [explanation, setExplanation] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("generate") // Default to generate tab
  const [schemaAnalysis, setSchemaAnalysis] = useState<any>(null)
  const [querySuggestions, setQuerySuggestions] = useState<string[]>([])
  const [queryResults, setQueryResults] = useState<any[]>([])
  const [schemaSuggestions, setSchemaSuggestions] = useState<any>(null)
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([])
  const { toast } = useToast()

  // Load query history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("queryHistory")
    if (savedHistory) {
      try {
        setQueryHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse query history:", e)
      }
    }
  }, [])

  // Save query history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("queryHistory", JSON.stringify(queryHistory))
  }, [queryHistory])

  // Modify the handleSubmit function to generate a summary
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const result = await generateSqlQuery(prompt, schema)
      setSqlQuery(result.sqlQuery)
      setExplanation(result.explanation)
      setActiveTab("generate")

      // Generate a summary (first 100 characters of explanation or up to the first period)
      const summary =
        result.explanation.length > 100
          ? result.explanation.substring(0, 100) + "..."
          : result.explanation.split(".")[0] + "."

      // Add to query history with summary
      const newHistoryItem: QueryHistoryItem = {
        id: uuidv4(),
        prompt,
        sqlQuery: result.sqlQuery,
        explanation: result.explanation,
        summary,
        timestamp: new Date(),
      }

      setQueryHistory((prev) => [newHistoryItem, ...prev.slice(0, 19)]) // Keep only the 20 most recent queries
    } catch (error) {
      console.error("Error generating SQL:", error)
      toast({
        title: "Error",
        description: "Failed to generate SQL query. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlQuery)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast({
      title: "Copied!",
      description: "SQL query copied to clipboard",
    })
  }

  const handleSchemaAnalyzed = async (analysis: any) => {
    setSchemaAnalysis(analysis)
    setSchema(schema) // Keep the original schema text

    // Generate query suggestions based on the schema
    try {
      const suggestions = await generateQuerySuggestions(schema)
      setQuerySuggestions(suggestions)
    } catch (error) {
      console.error("Error generating suggestions:", error)
    }

    toast({
      title: "Schema Analyzed",
      description: `Analyzed ${analysis.tables.length} tables in your schema`,
    })
  }

  const handleSuggestionsGenerated = (suggestions: any) => {
    setSchemaSuggestions(suggestions)

    // If a specific query was selected, use it
    if (suggestions.selectedQuery) {
      setPrompt(suggestions.selectedQuery)
      // Switch to the generate tab
      setActiveTab("generate")
      // Scroll to the query input
      document.getElementById("query-input")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSelectSuggestion = (suggestion: string) => {
    setPrompt(suggestion)
    // Automatically scroll to the query input
    document.getElementById("query-input")?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSelectHistoryItem = (item: QueryHistoryItem) => {
    setPrompt(item.prompt)
    setSqlQuery(item.sqlQuery)
    setExplanation(item.explanation)

    // Switch to the generate tab if not already there
    if (activeTab !== "generate") {
      setActiveTab("generate")
    }
  }

  const handleClearHistory = () => {
    setQueryHistory([])
    toast({
      title: "History Cleared",
      description: "Your query history has been cleared",
    })
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        {/* Query History Sidebar */}
        <div className="w-80 border-r p-4 hidden lg:block">
          <QueryHistory
            history={queryHistory}
            onSelectQuery={handleSelectHistoryItem}
            onClearHistory={handleClearHistory}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col space-y-2 mb-8">
              <h1 className="text-3xl font-bold">SQL Business Intelligence Agent</h1>
              <p className="text-muted-foreground">Generate, analyze, and execute SQL queries using natural language</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="generate">Generate Query</TabsTrigger>
                <TabsTrigger value="schema">Schema Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Query Input */}
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="query-input" className="text-sm font-medium">
                          What do you want to query?
                        </label>
                        <Textarea
                          id="query-input"
                          placeholder="Describe the SQL query you need in plain English..."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={loading || !prompt.trim()}>
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>Generate SQL Query</>
                        )}
                      </Button>
                    </form>

                    {schemaSuggestions && schemaSuggestions.queries && schemaSuggestions.queries.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                            Schema-Based Suggestions
                          </CardTitle>
                          <CardDescription>Query suggestions based on your database schema</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-2">
                            {schemaSuggestions.queries.slice(0, 5).map((suggestion: string, index: number) => (
                              <Button
                                key={index}
                                variant="outline"
                                className="justify-start h-auto py-2 px-3 text-left"
                                onClick={() => setPrompt(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {querySuggestions.length > 0 && !schemaSuggestions && (
                      <QuerySuggestions suggestions={querySuggestions} onSelectSuggestion={handleSelectSuggestion} />
                    )}
                  </div>

                  {/* Query Output - Simplified to just show SQL */}
                  <div className="space-y-6">
                    {sqlQuery ? (
                      <div className="space-y-4">
                        {/* SQL Query Card */}
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center">
                              <Code className="mr-2 h-4 w-4" />
                              Generated SQL Query
                            </CardTitle>
                            <CardDescription>Ready to use in your database</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <pre className="bg-secondary/50 p-4 rounded-md overflow-x-auto text-sm">
                              <code>{sqlQuery}</code>
                            </pre>
                          </CardContent>
                          <CardFooter className="flex justify-end">
                            <Button variant="outline" size="sm" onClick={copyToClipboard}>
                              {copied ? (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy
                                </>
                              )}
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed rounded-lg p-8 text-center">
                        <Database className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No SQL Query Generated Yet</h3>
                        <p className="text-muted-foreground">
                          Enter your query description, then click "Generate SQL Query"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="schema" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SchemaAnalyzer
                    onSchemaAnalyzed={handleSchemaAnalyzed}
                    onSuggestionsGenerated={handleSuggestionsGenerated}
                  />

                  {schemaAnalysis && <SchemaVisualizer schemaAnalysis={schemaAnalysis} />}
                </div>

                {schemaAnalysis && schemaAnalysis.tables && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Schema Details</CardTitle>
                      <CardDescription>Detailed information about your database schema</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {schemaAnalysis.tables.map((table: any, index: number) => (
                          <div key={index} className="space-y-3">
                            <h3 className="text-lg font-medium">{table.name}</h3>
                            <p className="text-sm text-muted-foreground">{table.description}</p>

                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-secondary">
                                    <th className="px-4 py-2 text-left text-sm">Column</th>
                                    <th className="px-4 py-2 text-left text-sm">Type</th>
                                    <th className="px-4 py-2 text-left text-sm">Description</th>
                                    <th className="px-4 py-2 text-left text-sm">Key</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.columns.map((column: any, colIndex: number) => (
                                    <tr key={colIndex} className="border-b border-secondary">
                                      <td className="px-4 py-2 text-sm font-medium">{column.name}</td>
                                      <td className="px-4 py-2 text-sm">{column.type}</td>
                                      <td className="px-4 py-2 text-sm">{column.description}</td>
                                      <td className="px-4 py-2 text-sm">
                                        {column.isPrimary && "Primary"}
                                        {column.isForeign && "Foreign"}
                                        {column.references && ` → ${column.references}`}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ))}

                        {schemaAnalysis.queryExamples && (
                          <div className="space-y-3">
                            <h3 className="text-lg font-medium">Example Queries</h3>
                            <div className="space-y-4">
                              {schemaAnalysis.queryExamples.map((example: any, index: number) => (
                                <div key={index} className="space-y-2">
                                  <p className="text-sm font-medium">{example.description}</p>
                                  <pre className="bg-secondary/50 p-3 rounded-md overflow-x-auto text-xs">
                                    <code>{example.query}</code>
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </main>
  )
}

