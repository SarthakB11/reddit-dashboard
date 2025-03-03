import duckdb
import os
import logging
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_keywords(query: str):
    """Extract potential keywords from the query."""
    # Remove common words
    stopwords = {"the", "a", "an", "in", "on", "at", "to", "for", "with", "by", 
                "about", "like", "and", "or", "what", "when", "where", "who", 
                "why", "how", "is", "are", "was", "were", "be", "been", "being",
                "have", "has", "had", "do", "does", "did", "can", "could", "will",
                "would", "should", "shall", "may", "might", "must", "tell", "me",
                "show", "give", "find", "search", "look", "get", "information"}
    
    # Split query into words and filter out stopwords
    words = query.lower().split()
    return [word for word in words if word not in stopwords and len(word) > 2]

def check_database():
    """Check the database contents directly."""
    try:
        logger.info("Connecting to database...")
        data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'data.jsonl')
        logger.info(f"Data path: {data_path}")
        
        # Check if file exists
        if not os.path.exists(data_path):
            logger.error(f"Data file not found at {data_path}")
            return
        
        # Initialize DuckDB connection
        con = duckdb.connect(database=':memory:')
        
        # Load data
        logger.info("Loading data into DuckDB...")
        con.execute(f"""
            CREATE TABLE IF NOT EXISTS reddit_posts AS 
            SELECT * FROM read_json_auto('{data_path}', format='auto');
        """)
        
        # Create view
        con.execute("""
            CREATE OR REPLACE VIEW reddit_posts_view AS
            SELECT 
                kind,
                data->>'id' AS id,
                data->>'subreddit' AS subreddit,
                data->>'author' AS author,
                data->>'title' AS title,
                data->>'selftext' AS selftext,
                CAST(data->>'created_utc' AS FLOAT) AS created_utc,
                CAST(data->>'score' AS INTEGER) AS score,
                CAST(data->>'num_comments' AS INTEGER) AS num_comments,
                data->>'permalink' AS permalink,
                data->>'url' AS url,
                CAST(data->>'upvote_ratio' AS FLOAT) AS upvote_ratio,
                data->>'domain' AS domain
            FROM reddit_posts;
        """)
        
        # Check total posts
        result = con.execute("SELECT COUNT(*) FROM reddit_posts_view").fetchone()
        total_posts = result[0] if result else 0
        logger.info(f"Total posts in database: {total_posts}")
        
        # Check subreddits
        result = con.execute("""
            SELECT subreddit, COUNT(*) as count
            FROM reddit_posts_view
            GROUP BY subreddit
            ORDER BY count DESC
            LIMIT 10
        """).fetchall()
        
        logger.info("Top subreddits:")
        for subreddit, count in result:
            logger.info(f"  - {subreddit}: {count} posts")
        
        # Test the chat_engine query
        test_query = "What are the most popular subreddits in the dataset?"
        logger.info(f"Testing chat_engine query: '{test_query}'")
        
        # Extract keywords
        keywords = extract_keywords(test_query)
        logger.info(f"Extracted keywords: {keywords}")
        
        # Build query conditions
        conditions = []
        params = []
        
        if "subreddit" in test_query.lower():
            # Extract potential subreddit names
            subreddit_match = re.search(r'r/(\w+)', test_query)
            if subreddit_match:
                subreddit = subreddit_match.group(1)
                conditions.append("LOWER(subreddit) = LOWER(?)")
                params.append(subreddit)
                logger.info(f"Added subreddit condition for: {subreddit}")
        
        # Add keyword conditions
        for keyword in keywords:
            if len(keyword) > 3:  # Only use meaningful keywords
                conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
                params.append(keyword)
                params.append(keyword)
                logger.info(f"Added keyword condition for: {keyword}")
        
        # If no conditions, return None
        if not conditions:
            logger.info("No query conditions generated")
            return
            
        # Create WHERE clause
        where_clause = " AND ".join(conditions)
        logger.info(f"Generated WHERE clause: {where_clause}")
        logger.info(f"Query parameters: {params}")
        
        # Execute query to get basic stats
        query_sql = f"""
            SELECT 
                COUNT(*) as total_posts,
                AVG(score) as avg_score,
                AVG(num_comments) as avg_comments,
                SUM(score) as total_score,
                SUM(num_comments) as total_comments
            FROM reddit_posts_view
            WHERE {where_clause}
        """
        logger.info(f"Executing SQL query: {query_sql}")
        
        result = con.execute(query_sql, params).fetchone()
        logger.info(f"Query result: {result}")
        
        # Get top subreddits
        subreddit_query = f"""
            SELECT subreddit, COUNT(*) as count
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY subreddit
            ORDER BY count DESC
            LIMIT 5
        """
        
        subreddits = con.execute(subreddit_query, params).fetchall()
        logger.info(f"Top subreddits: {subreddits}")
        
        # Test with modified conditions
        logger.info("Testing with modified conditions...")
        
        # Try with just 'popular' keyword
        test_query2 = "SELECT COUNT(*) FROM reddit_posts_view WHERE LOWER(title) LIKE '%popular%' OR LOWER(selftext) LIKE '%popular%'"
        result = con.execute(test_query2).fetchone()
        logger.info(f"Posts containing 'popular': {result[0]}")
        
        # Try with just 'subreddit' keyword
        test_query3 = "SELECT COUNT(*) FROM reddit_posts_view WHERE LOWER(title) LIKE '%subreddit%' OR LOWER(selftext) LIKE '%subreddit%'"
        result = con.execute(test_query3).fetchone()
        logger.info(f"Posts containing 'subreddit': {result[0]}")
        
        # Try with no conditions
        test_query4 = "SELECT COUNT(*) FROM reddit_posts_view"
        result = con.execute(test_query4).fetchone()
        logger.info(f"Total posts (no conditions): {result[0]}")
        
    except Exception as e:
        logger.error(f"Error checking database: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")

if __name__ == "__main__":
    check_database() 