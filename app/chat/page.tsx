"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Bot, User, ChevronDown, Settings } from "lucide-react"
import { getApiSettings } from "../settings/actions"
import { generateChatResponse } from "./actions"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { saveApiSettings } from "../settings/actions"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [apiSettings, setApiSettings] = useState<any>(null)
  const [exampleQuestions, setExampleQuestions] = useState<string[]>([
    "Show me the top 5 customers by revenue",
    "What's the monthly sales trend for the past year?",
    "Compare product performance across different regions",
    "Identify customers at risk of churning",
    "What's our average order value by product category?",
  ])
  const [showExamples, setShowExamples] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getApiSettings()
      setApiSettings(settings)
    }

    loadSettings()

    // Add initial assistant message
    setMessages([
      {
        role: "assistant",
        content:
          "I'm a handy business intelligence agent that connects up to the leads_scored.db SQLite database that mimics an ERP System for a company. You can ask me Business Intelligence, Customer Analytics, and Data Visualization Questions. I will report the results.",
      },
    ])
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage: Message = {
      role: "user",
      content: input,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Save the current model selection
      if (apiSettings) {
        await saveApiSettings(apiSettings)
      }

      const response = await generateChatResponse(
        userMessage.content,
        apiSettings?.activeProvider || "openai",
        apiSettings?.selectedModels?.[apiSettings?.activeProvider || "openai"] || "gpt-4o",
      )

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.text,
        },
      ])
    } catch (error) {
      console.error("Error generating response:", error)
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive",
      })

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error while processing your request. Please try again or check your API settings.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleExampleClick = (example: string) => {
    setInput(example)
    setShowExamples(false)
  }

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex bg-slate-800 text-white p-4 justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select
            value={apiSettings?.activeProvider || "openai"}
            onValueChange={(value) => {
              setApiSettings({
                ...apiSettings,
                activeProvider: value,
              })
            }}
            disabled={!apiSettings}
          >
            <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
              <SelectValue placeholder="Choose provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="cohere">Cohere</SelectItem>
              <SelectItem value="mistral">Mistral AI</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={apiSettings?.selectedModels?.[apiSettings?.activeProvider || "openai"]}
            onValueChange={(value) => {
              setApiSettings({
                ...apiSettings,
                selectedModels: {
                  ...apiSettings?.selectedModels,
                  [apiSettings?.activeProvider || "openai"]: value,
                },
              })
            }}
            disabled={!apiSettings}
          >
            <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
              <SelectValue placeholder="Choose model" />
            </SelectTrigger>
            <SelectContent>
              {apiSettings?.activeProvider === "openai" && (
                <>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </>
              )}
              {apiSettings?.activeProvider === "anthropic" && (
                <>
                  <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                  <SelectItem value="claude-3-sonnet-20240229">Claude 3 Sonnet</SelectItem>
                  <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                </>
              )}
              {apiSettings?.activeProvider === "cohere" && (
                <>
                  <SelectItem value="command">Command</SelectItem>
                  <SelectItem value="command-light">Command Light</SelectItem>
                  <SelectItem value="command-r">Command R</SelectItem>
                  <SelectItem value="command-r-plus">Command R+</SelectItem>
                </>
              )}
              {apiSettings?.activeProvider === "mistral" && (
                <>
                  <SelectItem value="mistral-large-latest">Mistral Large</SelectItem>
                  <SelectItem value="mistral-medium-latest">Mistral Medium</SelectItem>
                  <SelectItem value="mistral-small-latest">Mistral Small</SelectItem>
                </>
              )}
              {apiSettings?.activeProvider === "custom" && (
                <SelectItem value={apiSettings?.customModel || ""}>
                  {apiSettings?.customModel || "Custom Model"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Link href="/settings">
          <Button variant="ghost" className="text-white hover:bg-slate-700">
            <Settings className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4">
        <Card className="flex-1 flex flex-col mb-4 overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Your Business Intelligence AI Copilot</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pb-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`flex max-w-[80%] ${
                      message.role === "assistant"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground"
                    } rounded-lg px-4 py-2`}
                  >
                    <div className="mr-2 mt-0.5">
                      {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div>{message.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          {showExamples && (
            <div className="absolute bottom-full mb-2 w-full bg-card border rounded-lg shadow-lg z-10">
              <div className="p-2">
                <h3 className="text-sm font-medium mb-2">Try out example questions</h3>
                <div className="space-y-1">
                  {exampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full justify-start text-left text-sm py-1.5"
                      onClick={() => handleExampleClick(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your question here..."
                className="pr-10"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowExamples(!showExamples)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${showExamples ? "rotate-180" : ""}`} />
              </Button>
            </div>
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

