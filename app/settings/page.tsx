"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { saveApiSettings, getApiSettings, testApiConnection } from "./actions"
import { Loader2, Check, AlertCircle, Key, BrainCircuit, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const [activeProvider, setActiveProvider] = useState<string>("openai")
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    openai: "",
    anthropic: "",
    cohere: "",
    mistral: "",
    custom: "",
  })
  const [customEndpoint, setCustomEndpoint] = useState<string>("")
  const [customModel, setCustomModel] = useState<string>("")
  const [saving, setSaving] = useState<boolean>(false)
  const [testing, setTesting] = useState<boolean>(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [selectedModels, setSelectedModels] = useState<Record<string, string>>({
    openai: "gpt-4o",
    anthropic: "claude-3-opus-20240229",
    cohere: "command",
    mistral: "mistral-large-latest",
    custom: "",
  })
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await getApiSettings()
      if (settings) {
        setActiveProvider(settings.activeProvider || "openai")
        setApiKeys(
          settings.apiKeys || {
            openai: "",
            anthropic: "",
            cohere: "",
            mistral: "",
            custom: "",
          },
        )
        setCustomEndpoint(settings.customEndpoint || "")
        setCustomModel(settings.customModel || "")
        setSelectedModels(
          settings.selectedModels || {
            openai: "gpt-4o",
            anthropic: "claude-3-opus-20240229",
            cohere: "command",
            mistral: "mistral-large-latest",
            custom: "",
          },
        )
      }
    }

    loadSettings()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await saveApiSettings({
        activeProvider,
        apiKeys,
        customEndpoint,
        customModel,
        selectedModels,
      })

      toast({
        title: "Settings saved",
        description: "Your API settings have been saved successfully",
      })

      // Redirect to the main page
      router.push("/")
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)

    try {
      const result = await testApiConnection({
        provider: activeProvider,
        apiKey: apiKeys[activeProvider],
        model: selectedModels[activeProvider],
        endpoint: activeProvider === "custom" ? customEndpoint : undefined,
      })

      setTestResult(result)

      if (result.success) {
        toast({
          title: "Connection successful",
          description: result.message,
        })
      } else {
        toast({
          title: "Connection failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      setTestResult({
        success: false,
        message: "An unexpected error occurred while testing the connection.",
      })

      toast({
        title: "Error",
        description: "Failed to test connection. Please check your settings.",
        variant: "destructive",
      })
    } finally {
      setTesting(false)
    }
  }

  const models = {
    openai: [
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    anthropic: [
      { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
      { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
      { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" },
    ],
    cohere: [
      { value: "command", label: "Command" },
      { value: "command-light", label: "Command Light" },
      { value: "command-r", label: "Command R" },
      { value: "command-r-plus", label: "Command R+" },
    ],
    mistral: [
      { value: "mistral-large-latest", label: "Mistral Large" },
      { value: "mistral-medium-latest", label: "Mistral Medium" },
      { value: "mistral-small-latest", label: "Mistral Small" },
    ],
  }

  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col space-y-2 mb-8">
          <h1 className="text-3xl font-bold">AI Model Settings</h1>
          <p className="text-muted-foreground">
            Configure the AI models and API settings for your Business Intelligence Agent
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BrainCircuit className="mr-2 h-5 w-5" />
              LLM Provider Configuration
            </CardTitle>
            <CardDescription>Choose and configure your preferred AI model provider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="provider">Active Provider</Label>
                <Select value={activeProvider} onValueChange={setActiveProvider}>
                  <SelectTrigger id="provider" className="w-full">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (Default)</SelectItem>
                    <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                    <SelectItem value="cohere">Cohere</SelectItem>
                    <SelectItem value="mistral">Mistral AI</SelectItem>
                    <SelectItem value="custom">Custom Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs value={activeProvider} onValueChange={setActiveProvider} className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  <TabsTrigger value="openai">OpenAI</TabsTrigger>
                  <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
                  <TabsTrigger value="cohere">Cohere</TabsTrigger>
                  <TabsTrigger value="mistral">Mistral</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>

                {/* OpenAI Settings */}
                <TabsContent value="openai" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="openai-key" className="flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      OpenAI API Key
                    </Label>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openai-model">Model</Label>
                    <Select
                      value={selectedModels.openai}
                      onValueChange={(value) => setSelectedModels({ ...selectedModels, openai: value })}
                    >
                      <SelectTrigger id="openai-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.openai.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Anthropic Settings */}
                <TabsContent value="anthropic" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key" className="flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      Anthropic API Key
                    </Label>
                    <Input
                      id="anthropic-key"
                      type="password"
                      placeholder="sk_ant-..."
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anthropic-model">Model</Label>
                    <Select
                      value={selectedModels.anthropic}
                      onValueChange={(value) => setSelectedModels({ ...selectedModels, anthropic: value })}
                    >
                      <SelectTrigger id="anthropic-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.anthropic.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Cohere Settings */}
                <TabsContent value="cohere" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="cohere-key" className="flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      Cohere API Key
                    </Label>
                    <Input
                      id="cohere-key"
                      type="password"
                      placeholder="..."
                      value={apiKeys.cohere}
                      onChange={(e) => setApiKeys({ ...apiKeys, cohere: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cohere-model">Model</Label>
                    <Select
                      value={selectedModels.cohere}
                      onValueChange={(value) => setSelectedModels({ ...selectedModels, cohere: value })}
                    >
                      <SelectTrigger id="cohere-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.cohere.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Mistral Settings */}
                <TabsContent value="mistral" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="mistral-key" className="flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      Mistral API Key
                    </Label>
                    <Input
                      id="mistral-key"
                      type="password"
                      placeholder="..."
                      value={apiKeys.mistral}
                      onChange={(e) => setApiKeys({ ...apiKeys, mistral: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mistral-model">Model</Label>
                    <Select
                      value={selectedModels.mistral}
                      onValueChange={(value) => setSelectedModels({ ...selectedModels, mistral: value })}
                    >
                      <SelectTrigger id="mistral-model">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.mistral.map((model) => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Custom Provider Settings */}
                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-endpoint">API Endpoint</Label>
                    <Input
                      id="custom-endpoint"
                      type="text"
                      placeholder="https://api.example.com/v1/chat/completions"
                      value={customEndpoint}
                      onChange={(e) => setCustomEndpoint(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-key" className="flex items-center">
                      <Key className="h-4 w-4 mr-2" />
                      API Key
                    </Label>
                    <Input
                      id="custom-key"
                      type="password"
                      placeholder="Your API key"
                      value={apiKeys.custom}
                      onChange={(e) => setApiKeys({ ...apiKeys, custom: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-model">Model Name</Label>
                    <Input
                      id="custom-model"
                      type="text"
                      placeholder="model-name"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || !apiKeys[activeProvider] || (activeProvider === "custom" && !customEndpoint)}
                >
                  {testing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>Test Connection</>
                  )}
                </Button>

                {testResult && (
                  <div className={`flex items-center ${testResult.success ? "text-green-500" : "text-red-500"}`}>
                    {testResult.success ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
                    <span className="text-sm">
                      {testResult.success ? "Connection successful" : "Connection failed"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              disabled={
                saving || !apiKeys[activeProvider] || (activeProvider === "custom" && (!customEndpoint || !customModel))
              }
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  )
}

