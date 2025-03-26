"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { getApiSettings } from "../settings/actions"

export async function generateChatResponse(message: string, provider = "openai", model = "gpt-4o-mini") {
  try {
    const settings = await getApiSettings()

    // System prompt for all models
    const systemPrompt = `You are a business intelligence assistant that helps users analyze data and generate insights.
You have access to a SQLite database called leads_scored.db that contains tables for customers, products, orders, and sales.
When asked about data, you should generate SQL queries to answer the question and explain your reasoning.
Keep your responses concise and focused on providing actionable business insights.`

    // Handle different providers
    if (provider === "openai") {
      // Use OpenAI
      const apiKey = settings?.apiKeys?.openai || process.env.OPENAI_API_KEY

      if (!apiKey) {
        throw new Error("No API key found for OpenAI")
      }

      const { text } = await generateText({
        model: openai(model, {
          apiKey,
        }),
        system: systemPrompt,
        prompt: message,
      })

      return { text }
    } else if (provider === "anthropic") {
      // Use Anthropic
      const apiKey = settings?.apiKeys?.anthropic

      if (!apiKey) {
        throw new Error("No API key found for Anthropic")
      }

      // Import Anthropic provider dynamically
      const { anthropic } = await import("@ai-sdk/anthropic")

      const { text } = await generateText({
        model: anthropic(model, {
          apiKey,
        }),
        system: systemPrompt,
        prompt: message,
      })

      return { text }
    } else if (provider === "cohere") {
      // Use Cohere
      const apiKey = settings?.apiKeys?.cohere

      if (!apiKey) {
        throw new Error("No API key found for Cohere")
      }

      // Import Cohere provider dynamically
      const { cohere } = await import("@ai-sdk/cohere")

      const { text } = await generateText({
        model: cohere(model, {
          apiKey,
        }),
        system: systemPrompt,
        prompt: message,
      })

      return { text }
    } else if (provider === "mistral") {
      // Use Mistral
      const apiKey = settings?.apiKeys?.mistral

      if (!apiKey) {
        throw new Error("No API key found for Mistral")
      }

      // Import Mistral provider dynamically
      const { mistral } = await import("@ai-sdk/mistral")

      const { text } = await generateText({
        model: mistral(model, {
          apiKey,
        }),
        system: systemPrompt,
        prompt: message,
      })

      return { text }
    } else if (provider === "custom") {
      // Use custom provider
      const apiKey = settings?.apiKeys?.custom
      const endpoint = settings?.customEndpoint
      const customModel = settings?.customModel || model

      if (!apiKey || !endpoint) {
        throw new Error("Missing API key or endpoint for custom provider")
      }

      // Use OpenAI-compatible API with custom endpoint
      const { createOpenAI } = await import("@ai-sdk/openai")
      const customProvider = createOpenAI({
        baseURL: endpoint,
        apiKey,
      })

      const { text } = await generateText({
        model: customProvider(customModel),
        system: systemPrompt,
        prompt: message,
      })

      return { text }
    } else {
      // Fallback to OpenAI if provider is not recognized
      console.warn(`Provider ${provider} not recognized, falling back to OpenAI`)

      const apiKey = process.env.OPENAI_API_KEY

      if (!apiKey) {
        throw new Error("No API key found for OpenAI fallback")
      }

      const { text } = await generateText({
        model: openai("gpt-4o", {
          apiKey,
        }),
        system: systemPrompt,
        prompt: message,
      })

      return { text }
    }
  } catch (error) {
    console.error("Error generating chat response:", error)
    throw new Error(`Failed to generate chat response: ${error.message}`)
  }
}

