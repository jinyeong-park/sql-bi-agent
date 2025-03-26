"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Clock, Trash2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface QueryHistoryItem {
  id: string;
  prompt: string;
  sqlQuery: string;
  summary?: string;
  timestamp: Date;
}

interface QueryHistoryProps {
  history: QueryHistoryItem[];
  onSelectQuery: (item: QueryHistoryItem) => void;
  onClearHistory: () => void;
}

export default function QueryHistory({
  history,
  onSelectQuery,
  onClearHistory,
}: QueryHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter history based on search term
  const filteredHistory = searchTerm
    ? history.filter(
        (item) =>
          item.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sqlQuery.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.summary &&
            item.summary.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : history;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <History className="mr-2 h-5 w-5" />
          Query History
        </CardTitle>
        <CardDescription>Your previous queries</CardDescription>

        {/* Add search input */}
        {history.length > 0 && (
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search history..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {history.length > 0 ? "No matching queries" : "No Query History"}
            </h3>
            <p className="text-muted-foreground">
              {history.length > 0
                ? "Try a different search term"
                : "Your previous queries will appear here"}
            </p>
            {history.length > 0 && searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <ScrollArea className="h-[calc(100vh-300px)] px-4">
              <div className="space-y-4 py-2">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-md p-3 hover:bg-secondary/50 cursor-pointer transition-colors"
                    onClick={() => onSelectQuery(item)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm line-clamp-1">
                        {item.prompt}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={onClearHistory}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
