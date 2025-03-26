"use server"

import { cookies } from "next/headers"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

// Define the settings interface
interface ApiSettings {
  activeProvider: string
  apiKeys: Record<string, string>
  customEndpoint?: string
  customModel?: string
  selectedModels: Record<string, string>
}

export async function saveApiSettings(settings: ApiSettings) {
  try {
    // In a real application, you would store these in a database
    // For this demo, we'll use cookies (not recommended for API keys in production)
    const cookieStore = cookies()

    // Store the active provider and selected models
    cookieStore.set("activeProvider", settings.activeProvider)
    cookieStore.set("selectedModels", JSON.stringify(settings.selectedModels))

    // Store API keys (in a real app, use a secure storage method)
    // WARNING: This is just for demo purposes
    cookieStore.set("apiKeys", JSON.stringify(settings.apiKeys))

    if (settings.customEndpoint) {
      cookieStore.set("customEndpoint", settings.customEndpoint)
    }

    if (settings.customModel) {
      cookieStore.set("customModel", settings.customModel)
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving API settings:", error)
    throw new Error("Failed to save API settings")
  }
}

export async function getApiSettings(): Promise<ApiSettings | null> {
  try {
    const cookieStore = cookies()

    const activeProvider = cookieStore.get("activeProvider")?.value || "openai"

    let selectedModels: Record<string, string> = {
      openai: "gpt-4o-mini", // Changed from gpt-4o to gpt-4o-mini
      anthropic: "claude-3-opus-20240229",
      cohere: "command",
      mistral: "mistral-large-latest",
      custom: "",
    }

    const selectedModelsStr = cookieStore.get("selectedModels")?.value
    if (selectedModelsStr) {
      selectedModels = JSON.parse(selectedModelsStr)
    }

    let apiKeys: Record<string, string> = {
      openai: "",
      anthropic: "",
      cohere: "",
      mistral: "",
      custom: "",
    }

    const apiKeysStr = cookieStore.get("apiKeys")?.value
    if (apiKeysStr) {
      apiKeys = JSON.parse(apiKeysStr)
    }

    const customEndpoint = cookieStore.get("customEndpoint")?.value || ""
    const customModel = cookieStore.get("customModel")?.value || ""

    return {
      activeProvider,
      apiKeys,
      customEndpoint,
      customModel,
      selectedModels,
    }
  } catch (error) {
    console.error("Error getting API settings:", error)
    return null
  }
}

export async function testApiConnection(params: {
  provider: string
  apiKey: string
  model: string
  endpoint?: string
}) {
  try {
    // Test connection based on provider
    if (params.provider === "openai") {
      // Test OpenAI connection
      try {
        const { text } = await generateText({
          model: openai(params.model, {
            apiKey: params.apiKey,
          }),
          prompt: "Hello, this is a test message. Please respond with 'Connection successful'.",
          maxTokens: 10,
        })

        return {
          success: true,
          message: "Successfully connected to OpenAI API",
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to connect to OpenAI API",
        }
      }
    } else if (params.provider === "anthropic") {
      // Test Anthropic connection
      try {
        const { anthropic } = await import("@ai-sdk/anthropic")

        const { text } = await generateText({
          model: anthropic(params.model, {
            apiKey: params.apiKey,
          }),
          prompt: "Hello, this is a test message. Please respond with 'Connection successful'.",
          maxTokens: 10,
        })

        return {
          success: true,
          message: "Successfully connected to Anthropic API",
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to connect to Anthropic API",
        }
      }
    } else if (params.provider === "cohere") {
      // Test Cohere connection
      try {
        const { cohere } = await import("@ai-sdk/cohere")

        const { text } = await generateText({
          model: cohere(params.model, {
            apiKey: params.apiKey,
          }),
          prompt: "Hello, this is a test message. Please respond with 'Connection successful'.",
          maxTokens: 10,
        })

        return {
          success: true,
          message: "Successfully connected to Cohere API",
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to connect to Cohere API",
        }
      }
    } else if (params.provider === "mistral") {
      // Test Mistral connection
      try {
        const { mistral } = await import("@ai-sdk/mistral")

        const { text } = await generateText({
          model: mistral(params.model, {
            apiKey: params.apiKey,
          }),
          prompt: "Hello, this is a test message. Please respond with 'Connection successful'.",
          maxTokens: 10,
        })

        return {
          success: true,
          message: "Successfully connected to Mistral API",
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to connect to Mistral API",
        }
      }
    } else if (params.provider === "custom") {
      // Test custom provider
      try {
        if (!params.endpoint) {
          return {
            success: false,
            message: "No endpoint provided for custom provider",
          }
        }

        const { createOpenAI } = await import("@ai-sdk/openai")
        const customProvider = createOpenAI({
          baseURL: params.endpoint,
          apiKey: params.apiKey,
        })

        const { text } = await generateText({
          model: customProvider(params.model || "model"),
          prompt: "Hello, this is a test message. Please respond with 'Connection successful'.",
          maxTokens: 10,
        })

        return {
          success: true,
          message: "Successfully connected to custom API endpoint",
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || "Failed to connect to custom API endpoint",
        }
      }
    } else {
      return {
        success: false,
        message: `Provider ${params.provider} not supported`,
      }
    }
  } catch (error: any) {
    console.error("Error testing API connection:", error)
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
    }
  }
}

