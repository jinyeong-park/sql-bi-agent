import argparse
import json
import sys
from typing import Dict, List, Any, Optional

def generate_sql(query: str, schema: List[Dict[str, Any]]) -> Dict[str, str]:
    """
    Generate SQL from natural language query.
    
    In a production environment, this would use an LLM API call or a specialized
    library for natural language to SQL conversion.
    
    Args:
        query: Natural language query
        schema: Database schema information
    
    Returns:
        Dictionary with SQL query and explanation
    """
    # Extract table and column information
    tables = [table['tableName'] for table in schema]
    
    # Simple keyword-based SQL generation
    # This is a very basic implementation - in production, use an LLM
    
    query_lower = query.lower()
    
    # Default table (first one in schema)
    table = tables[0] if tables else "unknown_table"
    
    # Try to find which table the query is about
    for t in tables:
        if t.lower() in query_lower:
            table = t
            break
    
    # Get columns for the selected table
    columns = []
    for t in schema:
        if t['tableName'] == table:
            columns = [col['name'] for col in t['columns']]
            break
    
    # Default to SELECT * if no columns found
    if not columns:
        columns = ["*"]
    
    # Basic query patterns
    if "count" in query_lower:
        sql = f"SELECT COUNT(*) FROM {table}"
        explanation = f"This query counts the total number of records in the {table} table."
    
    elif any(word in query_lower for word in ["average", "avg", "mean"]):
        # Find numeric columns
        numeric_col = next((col for col in columns if col != "id"), columns[0])
        sql = f"SELECT AVG({numeric_col}) FROM {table}"
        explanation = f"This query calculates the average of {numeric_col} in the {table} table."
    
    elif "top" in query_lower or "highest" in query_lower:
        # Extract number if present
        import re
        num_match = re.search(r'\b(\d+)\b', query_lower)
        limit = int(num_match.group(1)) if num_match else 5
        
        # Find a column to order by
        order_col = next((col for col in columns if col != "id"), columns[0])
        
        sql = f"SELECT {', '.join(columns)} FROM {table} ORDER BY {order_col} DESC LIMIT {limit}"
        explanation = f"This query returns the top {limit} records from {table} ordered by {order_col} in descending order."
    
    elif "group by" in query_lower:
        # Find a column to group by
        group_col = next((col for col in columns if col != "id"), columns[0])
        agg_col = next((col for col in columns if col != group_col), columns[0])
        
        sql = f"SELECT {group_col}, COUNT({agg_col}) FROM {table} GROUP BY {group_col}"
        explanation = f"This query groups the {table} data by {group_col} and counts the occurrences in each group."
    
    else:
        # Default query
        sql = f"SELECT {', '.join(columns)} FROM {table} LIMIT 10"
        explanation = f"This query selects all columns from the {table} table and returns the first 10 rows."
    
    return {
        "sqlQuery": sql,
        "explanation": explanation
    }

def main():
    parser = argparse.ArgumentParser(description='Generate SQL from natural language')
    parser.add_argument('--query', type=str, required=True, help='Natural language query')
    parser.add_argument('--schema', type=str, required=True, help='Database schema JSON')
    
    args = parser.parse_args()
    
    try:
        schema = json.loads(args.schema)
        result = generate_sql(args.query, schema)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

