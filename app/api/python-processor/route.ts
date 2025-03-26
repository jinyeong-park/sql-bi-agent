import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs/promises"
import path from "path"
import os from "os"

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { query, schema } = await request.json()

    // Create a temporary directory for Python script
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "bi-agent-"))
    const scriptPath = path.join(tempDir, "process_query.py")

    // Write Python script to process the query
    await fs.writeFile(
      scriptPath,
      `
import json
import sys
from typing import Dict, List, Any

def process_query(query: str, schema: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Process a natural language query and generate SQL.
    This is a simplified version - in a real implementation, 
    you would use an LLM or a specialized library here.
    
    Args:
        query: The natural language query
        schema: The database schema information
    
    Returns:
        Dict with SQL query and explanation
    """
    # This is where you would integrate with an LLM or specialized library
    # For this example, we'll return a simple query based on keywords
    
    table_name = schema[0]['tableName'] if schema else 'unknown_table'
    columns = [col['name'] for col in schema[0]['columns']] if schema and schema[0]['columns'] else ['*']
    
    # Very simple keyword matching
    if 'top' in query.lower() and any(num in query for num in ['5', 'five']):
        sql = f"SELECT {', '.join(columns[:3])} FROM {table_name} LIMIT 5"
        explanation = f"This query selects the first {', '.join(columns[:3])} columns from the {table_name} table and returns the top 5 rows."
    elif 'average' in query.lower() or 'avg' in query.lower():
        numeric_cols = [col['name'] for col in schema[0]['columns'] if col['type'] in ['integer', 'numeric', 'decimal', 'float']]
        if numeric_cols:
            sql = f"SELECT AVG({numeric_cols[0]}) FROM {table_name}"
            explanation = f"This query calculates the average of {numeric_cols[0]} from the {table_name} table."
        else:
            sql = f"SELECT * FROM {table_name} LIMIT 10"
            explanation = f"Could not find numeric columns for average. Showing sample data instead."
    else:
        sql = f"SELECT * FROM {table_name} LIMIT 10"
        explanation = f"This query selects all columns from the {table_name} table and returns the first 10 rows."
    
    return {
        "sqlQuery": sql,
        "explanation": explanation
    }

# Read input from command line arguments
input_data = json.loads(sys.argv[1])
result = process_query(input_data['query'], input_data['schema'])
print(json.dumps(result))
    `,
    )

    // Execute Python script
    const inputData = JSON.stringify({ query, schema })
    const { stdout, stderr } = await execAsync(`python ${scriptPath} '${inputData.replace(/'/g, "\\'")}'`)

    if (stderr) {
      console.error("Python script error:", stderr)
      return NextResponse.json({ error: "Error processing query" }, { status: 500 })
    }

    // Clean up temporary files
    await fs.rm(tempDir, { recursive: true, force: true })

    // Parse and return the result
    const result = JSON.parse(stdout)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in Python processor:", error)
    return NextResponse.json({ error: "Failed to process query" }, { status: 500 })
  }
}

