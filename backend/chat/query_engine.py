"""Query engine for processing user queries and retrieving relevant information."""

import logging
import re
import json
from typing import Dict, List, Any, Optional, Tuple
import numpy as np

# Setup logging
logger = logging.getLogger(__name__)

class QueryEngine:
    """Engine for processing user queries and retrieving relevant information."""
    
    def __init__(self, db_connection=None, vector_store=None):
        """Initialize the query engine.
        
        Args:
            db_connection: Database connection for querying data
            vector_store: Vector store for semantic search
        """
        self.db_connection = db_connection
        self.vector_store = vector_store
        
        # Common query patterns
        self.query_patterns = {
            "count": re.compile(r"how many|count|number of", re.IGNORECASE),
            "popular": re.compile(r"most popular|top|best|highest", re.IGNORECASE),
            "trend": re.compile(r"trend|pattern|change over time", re.IGNORECASE),
            "sentiment": re.compile(r"sentiment|feeling|emotion|positive|negative", re.IGNORECASE),
            "compare": re.compile(r"compare|versus|vs|difference between", re.IGNORECASE),
            "subreddit": re.compile(r"subreddit|r/\w+", re.IGNORECASE),
            "time": re.compile(r"when|time|date|month|year|day", re.IGNORECASE)
        }
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Process a user query and retrieve relevant information.
        
        Args:
            query: User's question or prompt
            
        Returns:
            Dictionary containing the query results and metadata
        """
        # Clean and normalize the query
        clean_query = self._clean_query(query)
        
        # Identify query intent
        intent = self._identify_intent(clean_query)
        
        # Extract entities from query
        entities = self._extract_entities(clean_query)
        
        # Build and execute database query
        db_results = self._execute_db_query(intent, entities)
        
        # Perform semantic search if vector store is available
        semantic_results = self._semantic_search(clean_query) if self.vector_store else None
        
        # Combine results
        return {
            "query": clean_query,
            "intent": intent,
            "entities": entities,
            "db_results": db_results,
            "semantic_results": semantic_results
        }
    
    def _clean_query(self, query: str) -> str:
        """Clean and normalize the user query.
        
        Args:
            query: Raw user query
            
        Returns:
            Cleaned query string
        """
        # Remove extra whitespace
        query = re.sub(r'\s+', ' ', query.strip())
        
        # Remove special characters except question marks
        query = re.sub(r'[^\w\s\?]', '', query)
        
        return query
    
    def _identify_intent(self, query: str) -> str:
        """Identify the intent of the query.
        
        Args:
            query: Cleaned user query
            
        Returns:
            Intent string
        """
        for intent, pattern in self.query_patterns.items():
            if pattern.search(query):
                return intent
                
        return "general"
    
    def _extract_entities(self, query: str) -> Dict[str, Any]:
        """Extract entities from the query.
        
        Args:
            query: Cleaned user query
            
        Returns:
            Dictionary of extracted entities
        """
        entities = {
            "subreddits": [],
            "keywords": [],
            "time_period": None
        }
        
        # Extract subreddits
        subreddit_matches = re.findall(r'r/(\w+)', query)
        if subreddit_matches:
            entities["subreddits"] = subreddit_matches
        
        # Extract time periods
        time_matches = re.search(r'(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|202[0-9])', query, re.IGNORECASE)
        if time_matches:
            entities["time_period"] = time_matches.group(1)
        
        # Extract keywords (excluding common words)
        stopwords = {"the", "a", "an", "in", "on", "at", "to", "for", "with", "by", 
                    "about", "like", "and", "or", "what", "when", "where", "who", 
                    "why", "how", "is", "are", "was", "were", "be", "been", "being",
                    "have", "has", "had", "do", "does", "did", "can", "could", "will",
                    "would", "should", "shall", "may", "might", "must", "tell", "me",
                    "show", "give", "find", "search", "look", "get", "information"}
        
        words = query.lower().split()
        keywords = [word for word in words if word not in stopwords and len(word) > 3]
        entities["keywords"] = keywords
        
        return entities
    
    def _execute_db_query(self, intent: str, entities: Dict[str, Any]) -> Dict[str, Any]:
        """Build and execute a database query based on intent and entities.
        
        Args:
            intent: Query intent
            entities: Extracted entities
            
        Returns:
            Dictionary of query results
        """
        if not self.db_connection:
            logger.warning("No database connection provided to QueryEngine")
            return {"error": "Database connection not available"}
            
        try:
            # Build query conditions
            conditions = []
            params = []
            
            # Add subreddit conditions
            if entities["subreddits"]:
                subreddit_placeholders = ", ".join(["?" for _ in entities["subreddits"]])
                conditions.append(f"LOWER(subreddit) IN ({subreddit_placeholders})")
                params.extend([s.lower() for s in entities["subreddits"]])
            
            # Add keyword conditions
            for keyword in entities["keywords"]:
                conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
                params.append(keyword)
                params.append(keyword)
            
            # Add time period conditions
            if entities["time_period"]:
                # Convert month name to number if applicable
                month_map = {
                    "jan": "01", "january": "01",
                    "feb": "02", "february": "02",
                    "mar": "03", "march": "03",
                    "apr": "04", "april": "04",
                    "may": "05",
                    "jun": "06", "june": "06",
                    "jul": "07", "july": "07",
                    "aug": "08", "august": "08",
                    "sep": "09", "september": "09",
                    "oct": "10", "october": "10",
                    "nov": "11", "november": "11",
                    "dec": "12", "december": "12"
                }
                
                time_period = entities["time_period"].lower()
                
                if time_period in month_map:
                    month_num = month_map[time_period]
                    conditions.append("strftime('%m', created_utc) = ?")
                    params.append(month_num)
                elif re.match(r'202[0-9]', time_period):
                    conditions.append("strftime('%Y', created_utc) = ?")
                    params.append(time_period)
            
            # Create WHERE clause
            where_clause = " AND ".join(conditions) if conditions else "1=1"
            
            # Execute query based on intent
            if intent == "count":
                query = f"""
                    SELECT COUNT(*) as count
                    FROM reddit_posts_view
                    WHERE {where_clause}
                """
                result = self.db_connection.execute(query, params).fetchone()
                return {"count": result[0]}
                
            elif intent == "popular":
                query = f"""
                    SELECT subreddit, COUNT(*) as count
                    FROM reddit_posts_view
                    WHERE {where_clause}
                    GROUP BY subreddit
                    ORDER BY count DESC
                    LIMIT 5
                """
                results = self.db_connection.execute(query, params).fetchall()
                return {"popular_subreddits": [{"name": r[0], "count": r[1]} for r in results]}
                
            elif intent == "trend":
                query = f"""
                    SELECT strftime('%Y-%m-%d', created_utc) as date, COUNT(*) as count
                    FROM reddit_posts_view
                    WHERE {where_clause}
                    GROUP BY date
                    ORDER BY date
                """
                results = self.db_connection.execute(query, params).fetchall()
                return {"trends": [{"date": r[0], "count": r[1]} for r in results]}
                
            elif intent == "sentiment":
                query = f"""
                    SELECT 
                        CASE 
                            WHEN sentiment_score > 0.2 THEN 'positive'
                            WHEN sentiment_score < -0.2 THEN 'negative'
                            ELSE 'neutral'
                        END as sentiment,
                        COUNT(*) as count
                    FROM reddit_posts_view
                    WHERE {where_clause}
                    GROUP BY sentiment
                """
                results = self.db_connection.execute(query, params).fetchall()
                return {"sentiment": [{"category": r[0], "count": r[1]} for r in results]}
                
            elif intent == "compare" and len(entities["subreddits"]) >= 2:
                # Compare two subreddits
                subreddit1, subreddit2 = entities["subreddits"][:2]
                
                query = f"""
                    SELECT 
                        subreddit,
                        COUNT(*) as post_count,
                        AVG(score) as avg_score,
                        AVG(num_comments) as avg_comments,
                        AVG(sentiment_score) as avg_sentiment
                    FROM reddit_posts_view
                    WHERE LOWER(subreddit) IN (?, ?)
                    GROUP BY subreddit
                """
                
                results = self.db_connection.execute(query, [subreddit1.lower(), subreddit2.lower()]).fetchall()
                return {"comparison": [
                    {
                        "subreddit": r[0],
                        "post_count": r[1],
                        "avg_score": r[2],
                        "avg_comments": r[3],
                        "avg_sentiment": r[4]
                    } for r in results
                ]}
            
            else:
                # General query - get basic stats
                query = f"""
                    SELECT 
                        COUNT(*) as total_posts,
                        AVG(score) as avg_score,
                        AVG(num_comments) as avg_comments,
                        SUM(score) as total_score,
                        SUM(num_comments) as total_comments
                    FROM reddit_posts_view
                    WHERE {where_clause}
                """
                
                result = self.db_connection.execute(query, params).fetchone()
                
                # Get top subreddits
                subreddit_query = f"""
                    SELECT subreddit, COUNT(*) as count
                    FROM reddit_posts_view
                    WHERE {where_clause}
                    GROUP BY subreddit
                    ORDER BY count DESC
                    LIMIT 5
                """
                
                subreddits = self.db_connection.execute(subreddit_query, params).fetchall()
                
                return {
                    "total_posts": result[0],
                    "avg_score": result[1],
                    "avg_comments": result[2],
                    "total_score": result[3],
                    "total_comments": result[4],
                    "top_subreddits": [{"name": sr[0], "count": sr[1]} for sr in subreddits]
                }
                
        except Exception as e:
            logger.error(f"Error executing database query: {str(e)}")
            return {"error": str(e)}
    
    def _semantic_search(self, query: str, limit: int = 3) -> List[Dict[str, Any]]:
        """Perform semantic search using the vector store.
        
        Args:
            query: User query
            limit: Maximum number of results to return
            
        Returns:
            List of semantically similar results with their similarity scores
        """
        if not self.vector_store:
            logger.warning("No vector store provided to QueryEngine")
            return []
            
        try:
            # Get query embedding and search vector store
            results = self.vector_store.search(
                query=query,
                limit=limit
            )
            
            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "text": result.text,
                    "similarity": float(result.similarity),  # Convert numpy float to Python float
                    "metadata": result.metadata
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error performing semantic search: {str(e)}")
            return [] 