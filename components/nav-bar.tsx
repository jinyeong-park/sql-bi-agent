import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Database, MessageSquare, Settings, BarChart4, LogIn } from "lucide-react"

export default function NavBar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl flex items-center mr-8">
          <Database className="h-5 w-5 mr-2" />
          <span>SQL BI Agent</span>
        </Link>

        <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
            <BarChart4 className="h-4 w-4 mr-2" />
            SQL Generator
          </Link>
          <Link href="/chat" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Chat
          </Link>
          <Link href="/settings" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            API Settings
          </Link>
        </nav>

        <div className="ml-auto flex items-center space-x-4">
          <Button variant="outline" size="sm">
            Sign Up
          </Button>
          <Button size="sm">
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}

