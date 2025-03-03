"""Chat engine for processing user queries and generating responses."""

import logging
import json
import re
from typing import Dict, List, Any, Optional, Tuple

# Import Gemini API if available
try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

# Setup logging
logger = logging.getLogger(__name__)

# Predefined topics and responses for fallback
TOPIC_RESPONSES = {
    "social media": "Social media platforms facilitate rapid information spread, but this can include both reliable and unreliable content. Analysis of our Reddit dataset shows that posts in politically aligned subreddits often create echo chambers with limited exposure to diverse perspectives.",
    
    "misinformation": "Misinformation spreads quickly on social media. Our analysis shows that posts with emotional content tend to receive higher engagement regardless of factual accuracy. The echo chamber effect in subreddits like r/politics and r/Conservative can amplify misinformation within specific communities.",
    
    "trends": "Current trends in our Reddit dataset show increased activity around political topics, with peak posting periods occurring on weekday evenings. Content related to elections and international relations generates the most engagement, with an average of 68.3 comments per post.",
    
    "engagement": "Engagement patterns vary by topic and subreddit. Our data shows that controversial topics like politics generate significantly more comments (average 65.1 comments per post) compared to other topics. Posts with detailed explanations and unique insights tend to receive the most upvotes.",
    
    "sentiment": "Sentiment analysis of our Reddit data reveals mixed patterns across different communities. Political subreddits show more polarized sentiment, while technology-focused communities maintain more neutral tones. Overall sentiment across all posts leans slightly negative.",
    
    "help": "I can help you analyze Reddit data trends, understand engagement patterns, explore sentiment across different communities, and identify potential misinformation patterns. Try asking about specific topics, subreddits, or time periods in our dataset."
}

class ChatEngine:
    """Engine for processing chat queries and generating responses."""
    
    def __init__(self, db_connection=None, gemini_model=None):
        """Initialize the chat engine.
        
        Args:
            db_connection: Database connection for querying data
            gemini_model: Pre-configured Gemini model for generating responses
        """
        self.db_connection = db_connection
        self.gemini_model = gemini_model
        
        # Add test logging to verify initialization
        logger.info(f"ChatEngine initialized with Gemini available: {GEMINI_AVAILABLE}")
        logger.info(f"Gemini model provided: {self.gemini_model is not None}")
        
        self.context = self._build_initial_context()
    
    def _build_initial_context(self) -> str:
        """Build initial context about the Reddit dataset for the AI.
        
        Returns:
            String containing context information
        """
        return """
        You are an AI assistant specialized in analyzing Reddit data. You have access to a dataset 
        of Reddit posts from various subreddits spanning from July 2024 to February 2025.
        
        Key statistics about the dataset:
        - Total posts: 8,799
        - Top subreddits: r/neoliberal (11.3%), r/politics (11.3%), r/worldpolitics (11.2%), r/socialism (11.2%), r/Liberal (11.2%)
        - Average engagement: 68.3 comments per post, 388.9 score per post
        - Most active day: February 14, 2025 with 633 posts
        
        The dataset contains information about post content, engagement metrics, sentiment, and community interactions.
        Your goal is to provide insightful analysis about social media trends, potential misinformation patterns,
        and engagement dynamics based on this data.
        """
    
    def process_query(self, query: str) -> Dict[str, Any]:
        """Process a user query and generate a response.
        
        Args:
            query: User's question or prompt
            
        Returns:
            Dictionary containing the response and any additional data
        """
        # Add detailed logging
        logger.info(f"Processing query: {query}")
        logger.info(f"Gemini available: {GEMINI_AVAILABLE}")
        logger.info(f"Gemini model provided: {self.gemini_model is not None}")
        
        # Clean and normalize the query
        clean_query = self._clean_query(query)
        
        # Check for predefined topics first
        for topic, response in TOPIC_RESPONSES.items():
            if topic.lower() in clean_query.lower():
                logger.info(f"Using predefined response for topic: {topic}")
                return {
                    "response": response,
                    "source": "predefined",
                    "confidence": 0.95
                }
        
        # Get database results
        db_results = self._query_database(clean_query) if self.db_connection else None
        logger.info(f"Database results found: {db_results is not None}")
        
        # Try Gemini first (add more detailed error handling)
        if GEMINI_AVAILABLE and self.gemini_model:
            try:
                logger.info("Attempting to use Gemini for response")
                prompt = self._build_prompt(clean_query, db_results)
                logger.info(f"Built prompt with length: {len(prompt)}")
                response = self._generate_ai_response(prompt)
                logger.info("Successfully generated AI response")
                return {
                    "response": response,
                    "source": "gemini",
                    "confidence": 0.9,
                    "data": db_results
                }
            except Exception as e:
                logger.error(f"Gemini generation failed: {str(e)}")
                logger.error("Falling back to rule-based response")
        else:
            logger.warning(f"Gemini not available or model not provided. GEMINI_AVAILABLE={GEMINI_AVAILABLE}, model={self.gemini_model is not None}")
        
        # Fall back to rule-based response generation
        logger.info("Using rule-based response generation")
        return {
            "response": self._generate_rule_based_response(clean_query, db_results),
            "source": "rule_based",
            "confidence": 0.7,
            "data": db_results
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
    
    def _query_database(self, query: str) -> Optional[Dict[str, Any]]:
        """Query the database for relevant information based on the user query.
        
        Args:
            query: User's question
            
        Returns:
            Dictionary of relevant data or None if no data found
        """
        if not self.db_connection:
            return None
            
        try:
            # Extract potential keywords from query
            keywords = self._extract_keywords(query)
            logger.info(f"Extracted keywords: {keywords}")
            
            # Build query conditions
            subreddit_conditions = []
            keyword_conditions = []
            params = []
            
            if "subreddit" in query.lower():
                # Extract potential subreddit names
                subreddit_match = re.search(r'r/(\w+)', query)
                if subreddit_match:
                    subreddit = subreddit_match.group(1)
                    subreddit_conditions.append("LOWER(subreddit) = LOWER(?)")
                    params.append(subreddit)
                    logger.info(f"Added subreddit condition for: {subreddit}")
            
            # Add keyword conditions
            for keyword in keywords:
                if len(keyword) > 3:  # Only use meaningful keywords
                    keyword_conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
                    params.append(keyword)
                    params.append(keyword)
                    logger.info(f"Added keyword condition for: {keyword}")
            
            # If no conditions, return None
            if not subreddit_conditions and not keyword_conditions:
                logger.info("No query conditions generated, returning None")
                return None
                
            # Create WHERE clause - use AND between subreddit conditions, but OR between keyword conditions
            conditions = []
            
            if subreddit_conditions:
                conditions.append("(" + " AND ".join(subreddit_conditions) + ")")
                
            if keyword_conditions:
                conditions.append("(" + " OR ".join(keyword_conditions) + ")")
                
            where_clause = " AND ".join(conditions)
            logger.info(f"Generated WHERE clause: {where_clause}")
            logger.info(f"Query parameters: {params}")
            
            # For general questions about subreddits with no specific conditions,
            # just return the top subreddits
            if not where_clause and "subreddit" in query.lower():
                logger.info("General subreddit question detected, returning top subreddits")
                
                # Get top subreddits
                subreddit_query = """
                    SELECT subreddit, COUNT(*) as count
                    FROM reddit_posts_view
                    GROUP BY subreddit
                    ORDER BY count DESC
                    LIMIT 5
                """
                
                subreddits = self.db_connection.execute(subreddit_query).fetchall()
                logger.info(f"Top subreddits: {subreddits}")
                
                return {
                    "total_posts": 8799,  # Total posts in the database
                    "avg_score": None,
                    "avg_comments": None,
                    "total_score": None,
                    "total_comments": None,
                    "top_subreddits": [{"name": sr, "count": count} for sr, count in subreddits]
                }
            
            # Execute query to get basic stats
            query_sql = f"""
                SELECT 
                    COUNT(*) as total_posts,
                    AVG(score) as avg_score,
                    AVG(num_comments) as avg_comments,
                    SUM(score) as total_score,
                    SUM(num_comments) as total_comments
                FROM reddit_posts_view
                {f"WHERE {where_clause}" if where_clause else ""}
            """
            logger.info(f"Executing SQL query: {query_sql}")
            
            result = self.db_connection.execute(query_sql, params).fetchone()
            logger.info(f"Query result: {result}")
            
            # Get top subreddits
            subreddit_query = f"""
                SELECT subreddit, COUNT(*) as count
                FROM reddit_posts_view
                {f"WHERE {where_clause}" if where_clause else ""}
                GROUP BY subreddit
                ORDER BY count DESC
                LIMIT 5
            """
            
            subreddits = self.db_connection.execute(subreddit_query, params).fetchall()
            logger.info(f"Top subreddits: {subreddits}")
            
            return {
                "total_posts": result[0],
                "avg_score": result[1],
                "avg_comments": result[2],
                "total_score": result[3],
                "total_comments": result[4],
                "top_subreddits": [{"name": sr, "count": count} for sr, count in subreddits]
            }
            
        except Exception as e:
            logger.error(f"Database query error: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            return None
    
    def _extract_keywords(self, query: str) -> List[str]:
        """Extract potential keywords from the query.
        
        Args:
            query: User query
            
        Returns:
            List of potential keywords
        """
        # Remove common words
        stopwords = {"the", "a", "an", "in", "on", "at", "to", "for", "with", "by", 
                    "about", "like", "and", "or", "what", "when", "where", "who", 
                    "why", "how", "is", "are", "was", "were", "be", "been", "being",
                    "have", "has", "had", "do", "does", "did", "can", "could", "will",
                    "would", "should", "shall", "may", "might", "must", "tell", "me",
                    "show", "give", "find", "search", "look", "get", "information"}
        
        # Split query into words and filter out stopwords
        words = query.lower().split()
        keywords = [word for word in words if word not in stopwords and len(word) > 2]
        
        return keywords
    
    def _build_prompt(self, query: str, db_results: Optional[Dict[str, Any]]) -> str:
        """Build a prompt for the AI model.
        
        Args:
            query: User query
            db_results: Database query results
            
        Returns:
            Formatted prompt string
        """
        prompt = f"{self.context}\n\nUser question: {query}\n\n"
        
        if db_results:
            prompt += "Relevant data from the database:\n"
            
            # Safely format values, handling None values
            total_posts = db_results.get('total_posts', 0) or 0
            avg_score = db_results.get('avg_score') or 0
            avg_comments = db_results.get('avg_comments') or 0
            
            prompt += f"- Total posts: {total_posts}\n"
            prompt += f"- Average score per post: {avg_score:.1f}\n"
            prompt += f"- Average comments per post: {avg_comments:.1f}\n"
            
            # Add top subreddits if available
            top_subreddits = db_results.get('top_subreddits', [])
            if top_subreddits:
                prompt += "- Top subreddits:\n"
                for sr in top_subreddits[:5]:  # Limit to top 5
                    sr_name = sr.get('name', 'unknown')
                    sr_count = sr.get('count', 0) or 0
                    prompt += f"  - r/{sr_name}: {sr_count} posts\n"
        
        prompt += "\nPlease provide a concise, informative response based on this data. If the data doesn't fully answer the question, acknowledge the limitations and provide the best possible answer with the available information."
        
        return prompt
    
    def _generate_ai_response(self, prompt: str) -> str:
        """Generate a response using the Gemini AI model.
        
        Args:
            prompt: Formatted prompt
            
        Returns:
            AI-generated response
        """
        if not GEMINI_AVAILABLE:
            logger.error("Gemini API not available")
            raise ValueError("Gemini API not available")
        
        if not self.gemini_model:
            logger.error("Gemini model not provided")
            raise ValueError("Gemini model not provided")
        
        try:
            logger.info(f"Sending prompt to Gemini (length: {len(prompt)})")
            response = self.gemini_model.generate_content(prompt)
            
            if not response or not hasattr(response, 'text'):
                logger.error("Received invalid response from Gemini API")
                raise ValueError("Invalid response from Gemini API")
            
            logger.info("Successfully received response from Gemini API")
            return response.text
        except Exception as e:
            logger.error(f"Error generating AI response: {str(e)}")
            logger.error(f"Error type: {type(e).__name__}")
            raise
    
    def _generate_rule_based_response(self, query: str, db_results: Optional[Dict[str, Any]]) -> str:
        """Generate a rule-based response when AI is not available.
        
        Args:
            query: User query
            db_results: Database query results
            
        Returns:
            Generated response
        """
        # Check for question types
        if "how many" in query.lower() or "count" in query.lower() or "number" in query.lower():
            if db_results and db_results.get('total_posts'):
                return f"I found {db_results['total_posts']} posts matching your criteria. The average engagement was {db_results['avg_comments']:.1f} comments per post with an average score of {db_results['avg_score']:.1f}."
            else:
                return "I don't have specific count information for that query. Try asking about general trends or popular topics in our Reddit dataset."
                
        elif "most popular" in query.lower() or "top" in query.lower():
            if db_results and db_results.get('top_subreddits'):
                subreddits = ", ".join([f"r/{sr['name']} ({sr['count']} posts)" for sr in db_results['top_subreddits'][:3]])
                return f"The most popular subreddits matching your criteria are {subreddits}."
            else:
                return "The most active subreddits in our dataset are r/neoliberal, r/politics, r/worldpolitics, r/socialism, and r/Liberal, each with approximately 11% of the total posts."
                
        elif "trend" in query.lower() or "pattern" in query.lower():
            return "The data shows increased posting activity in February 2025, with the most active day being February 14 (633 posts). Political content tends to generate the highest engagement, with controversial topics receiving more comments but potentially lower scores."
            
        elif "sentiment" in query.lower() or "feeling" in query.lower() or "emotion" in query.lower():
            return "Sentiment analysis of the Reddit posts shows mixed patterns. Political subreddits tend to have more polarized sentiment, while the overall sentiment across all posts is relatively neutral."
            
        # Default response
        return "I can provide insights about Reddit posts, engagement patterns, and content trends from our dataset spanning July 2024 to February 2025. Try asking about specific topics, subreddits, or engagement metrics."
    
    def test_gemini_integration(self) -> Dict[str, Any]:
        """Test the Gemini integration and return diagnostic information."""
        results = {
            "gemini_available": GEMINI_AVAILABLE,
            "model_provided": self.gemini_model is not None,
            "test_generation": None,
            "error": None
        }
        
        if GEMINI_AVAILABLE and self.gemini_model:
            try:
                test_prompt = "Generate a one-sentence test response."
                response = self._generate_ai_response(test_prompt)
                results["test_generation"] = response
            except Exception as e:
                results["error"] = str(e)
        
        return results 
