"use server"

import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { z } from "zod"
import { sql } from "@vercel/postgres"

// Define the schema for the SQL query response
const SqlResponseSchema = z.object({
  sqlQuery: z.string(),
  explanation: z.string(),
})

// Define the schema for the schema analysis response
const SchemaAnalysisSchema = z.object({
  tables: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      columns: z.array(
        z.object({
          name: z.string(),
          type: z.string(),
          description: z.string(),
          isPrimary: z.boolean().optional(),
          isForeign: z.boolean().optional(),
          references: z.string().optional(),
        }),
      ),
    }),
  ),
  relationships: z
    .array(
      z.object({
        from: z.string(),
        to: z.string(),
        type: z.string(),
        description: z.string(),
      }),
    )
    .optional(),
})

export async function generateSqlQuery(prompt: string, schema?: string) {
  try {
    console.log("API Key exists:", !!process.env.OPENAI_API_KEY); // 디버깅용
    
    // Create a system prompt that guides the model to generate SQL
    const systemPrompt = `You are an expert SQL query generator with deep knowledge of database design, optimization, and SQL best practices. Your task is to generate SQL queries based on natural language descriptions.

${
  schema
    ? `Here is the database schema provided by the user:
\`\`\`sql
${schema}
\`\`\``
    : `If no schema is provided, make reasonable assumptions about table and column names based on the query description.`
}

Follow these guidelines when generating SQL queries:
1. Use standard SQL syntax that works with PostgreSQL
2. Include appropriate JOINs when querying across multiple tables
3. Use meaningful aliases for tables and columns
4. Add comments for complex parts of the query
5. Consider performance by using appropriate indexes and avoiding unnecessary operations
6. Format the SQL query with proper indentation and line breaks for readability
7. Use parameterized queries with placeholders where appropriate
8. Include appropriate WHERE clauses to filter data as needed
9. For aggregations, include appropriate GROUP BY clauses
10. For sorting, use ORDER BY with clear direction (ASC/DESC)

Provide both the SQL query and a clear explanation of what the query does in plain English.`

    // Generate the SQL query using the AI SDK
    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Generate a SQL query for the following request: ${prompt}`,
      schema: SqlResponseSchema,
    })

    return result.object
  } catch (error) {
    console.error("Error generating SQL query:", error)
    throw new Error("Failed to generate SQL query")
  }
}

export async function analyzeSchema(schema: string) {
  try {
    const systemPrompt = `You are a database expert specializing in schema analysis. Your task is to analyze a SQL schema and provide insights about the tables, columns, and relationships.

Analyze the following database schema and provide:
1. A description of each table and its purpose
2. A description of each column, including its data type and purpose
3. Identify primary and foreign keys
4. Describe relationships between tables

Format your response as a structured JSON object.`

    const result = await generateObject({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: `Analyze this database schema:
\`\`\`sql
${schema}
\`\`\``,
      schema: SchemaAnalysisSchema,
    })

    return result.object
  } catch (error) {
    console.error("Error analyzing schema:", error)
    throw new Error("Failed to analyze schema")
  }
}

export async function executeQuery(sqlQuery: string) {
  try {
    // Execute the SQL query
    const result = await sql.query(sqlQuery)
    return result.rows
  } catch (error) {
    console.error("Error executing SQL query:", error)
    throw new Error("Failed to execute SQL query")
  }
}

