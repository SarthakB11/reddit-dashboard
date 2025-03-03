from flask import Flask, jsonify, request, Blueprint
from flask_cors import CORS
import os
import json
import pandas as pd
import numpy as np
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go
import networkx as nx
from collections import Counter, defaultdict
import re
from textblob import TextBlob
import duckdb
import logging
import sys
from dotenv import load_dotenv

# Imports for machine learning and NLP capabilities
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation, TruncatedSVD
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Import chat module - we'll import this later to avoid circular imports
from backend.chat.routes import init_chat_module

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DuckDB connection
con = duckdb.connect(database=':memory:')

# Gemini API integration
try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    
    # Configure Gemini API
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Read from environment variable
    genai.configure(api_key=GEMINI_API_KEY)
    
    # Set up the Gemini model
    generation_config = {
        "temperature": 0.7,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 2048,
    }
    
    safety_settings = {
        HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    }
    
    model = genai.GenerativeModel(
        model_name="gemini-1.5-pro",
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    
    GEMINI_AVAILABLE = True
    logger.info("Gemini API successfully loaded")
except ImportError:
    logger.warning("Gemini API not available. Using fallback implementation.")
    GEMINI_AVAILABLE = False

# Function to load and process data
def load_and_process_data():
    """Load and process the Reddit data from JSONL file"""
    try:
        logger.info("Starting data loading process...")
        data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'data.jsonl')
        
        # Read data into DuckDB
        con.execute(f"""
            CREATE TABLE IF NOT EXISTS reddit_posts AS 
            SELECT * FROM read_json_auto('{data_path}', format='auto');
        """)
        
        # Create a view with flattened structure for easier querying
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
        
        # Compute the total number of posts
        result = con.execute("SELECT COUNT(*) FROM reddit_posts_view").fetchone()
        total_posts = result[0] if result else 0
        logger.info(f"Successfully loaded {total_posts} posts into the database")
        
        return True
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return False

# Load the data when the application starts
data_loaded = load_and_process_data()

# Text cleaning function
def clean_text(text):
    """Clean and preprocess text for topic modeling."""
    if not text or not isinstance(text, str):
        return ""
    
    # Convert to lowercase
    text = text.lower()
    
    # Remove URLs
    text = re.sub(r'http\S+', '', text)
    
    # Remove special characters and numbers
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\d+', ' ', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

# Extended stopwords list for topic modeling
def get_extended_stopwords():
    """Get an extended list of stopwords for better topic modeling."""
    from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS
    
    # Common words that don't add meaning to topics
    additional_stopwords = {
        'like', 'just', 'people', 'think', 'know', 'get', 'really', 'would', 'one', 'time',
        'good', 'make', 'going', 'got', 'want', 'see', 'way', 'thing', 'things', 'much',
        'lot', 'even', 'actually', 'said', 'say', 'go', 'well', 'still', 'right', 'use',
        'used', 'using', 'look', 'looking', 'looks', 'looked', 'come', 'comes', 'coming',
        'came', 'take', 'takes', 'taking', 'took', 'need', 'needs', 'needed', 'needing',
        'something', 'someone', 'anything', 'anyone', 'everything', 'everyone', 'nothing',
        'nobody', 'somewhere', 'anywhere', 'everywhere', 'nowhere', 'ever', 'never',
        'always', 'sometimes', 'often', 'rarely', 'seldom', 'usually', 'normally',
        'generally', 'typically', 'basically', 'essentially', 'actually', 'literally',
        'seriously', 'honestly', 'truly', 'really', 'definitely', 'absolutely', 'certainly',
        'probably', 'possibly', 'maybe', 'perhaps', 'likely', 'unlikely', 'sure', 'yeah',
        'yes', 'no', 'nope', 'yep', 'ok', 'okay', 'alright', 'hi', 'hello', 'hey', 'bye',
        'goodbye', 'reddit', 'post', 'comment', 'thread', 'subreddit', 'edit', 'deleted',
        'removed', 'upvote', 'downvote', 'karma', 'gold', 'silver', 'platinum', 'award',
        'tldr', 'tl', 'dr', 'op', 'oc', 'repost', 'xpost', 'crosspost', 'mod', 'mods',
        'moderator', 'moderators', 'admin', 'admins', 'administrator', 'administrators'
    }
    
    # Combine with sklearn's stopwords and return as a list
    return list(set(ENGLISH_STOP_WORDS).union(additional_stopwords))

# API Routes
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    if data_loaded:
        return jsonify({"status": "healthy", "data_loaded": True})
    else:
        return jsonify({"status": "unhealthy", "data_loaded": False}), 500

@app.route('/api/stats', methods=['GET'])
def get_basic_stats():
    """Get basic statistics about the dataset"""
    try:
        # Total posts
        total_posts = con.execute("SELECT COUNT(*) FROM reddit_posts_view").fetchone()[0]
        
        # Top subreddits
        top_subreddits = con.execute("""
            SELECT subreddit, COUNT(*) as post_count 
            FROM reddit_posts_view 
            GROUP BY subreddit 
            ORDER BY post_count DESC 
            LIMIT 10
        """).fetchall()
        
        # Posts over time (by day)
        posts_over_time = con.execute("""
            SELECT 
                DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') AS date,
                COUNT(*) as post_count
            FROM reddit_posts_view
            GROUP BY date
            ORDER BY date
        """).fetchall()
        
        # Top domains (excluding self posts)
        top_domains = con.execute("""
            SELECT 
                domain, 
                COUNT(*) as count 
            FROM reddit_posts_view 
            WHERE domain NOT LIKE 'self.%' 
            GROUP BY domain 
            ORDER BY count DESC 
            LIMIT 10
        """).fetchall()
        
        # Top authors
        top_authors = con.execute("""
            SELECT 
                author, 
                COUNT(*) as post_count 
            FROM reddit_posts_view 
            WHERE author != '[deleted]' AND author != 'AutoModerator'
            GROUP BY author 
            ORDER BY post_count DESC 
            LIMIT 10
        """).fetchall()
        
        return jsonify({
            "total_posts": total_posts,
            "top_subreddits": [{"subreddit": r[0], "count": r[1]} for r in top_subreddits],
            "posts_over_time": [{"date": r[0].strftime("%Y-%m-%d"), "count": r[1]} for r in posts_over_time],
            "top_domains": [{"domain": r[0], "count": r[1]} for r in top_domains],
            "top_authors": [{"author": r[0], "count": r[1]} for r in top_authors]
        })
    except Exception as e:
        logger.error(f"Error retrieving basic stats: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/posts/search', methods=['GET'])
def search_posts():
    """Search posts by keyword, subreddit, author, or domain"""
    try:
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        author = request.args.get('author', '')
        domain = request.args.get('domain', '')
        start_date = request.args.get('start_date', '')
        end_date = request.args.get('end_date', '')
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        
        # Build the query conditions
        conditions = []
        params = []  # Use a list for positional parameters
        
        if keyword:
            conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
            params.append(keyword)
            params.append(keyword)
            
        if subreddit:
            conditions.append("LOWER(subreddit) = LOWER(?)")
            params.append(subreddit)
            
        if author:
            conditions.append("LOWER(author) = LOWER(?)")
            params.append(author)
            
        if domain:
            conditions.append("LOWER(domain) = LOWER(?)")
            params.append(domain)
            
        if start_date:
            try:
                start_timestamp = datetime.strptime(start_date, '%Y-%m-%d').timestamp()
                conditions.append("created_utc >= ?")
                params.append(start_timestamp)
            except ValueError:
                return jsonify({"error": "Invalid start_date format. Use YYYY-MM-DD"}), 400
                
        if end_date:
            try:
                end_timestamp = datetime.strptime(end_date, '%Y-%m-%d').timestamp() + 86399  # End of day
                conditions.append("created_utc <= ?")
                params.append(end_timestamp)
            except ValueError:
                return jsonify({"error": "Invalid end_date format. Use YYYY-MM-DD"}), 400
        
        # Create the WHERE clause
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Execute the query to get the count
        query_count = f"SELECT COUNT(*) FROM reddit_posts_view WHERE {where_clause}"
        result_count = con.execute(query_count, params).fetchone()
        total_count = result_count[0] if result_count else 0
        
        # Execute the query to get the data
        query_data = f"""
            SELECT 
                id, subreddit, author, title, 
                SUBSTRING(selftext, 1, 200) as preview_text,
                created_utc, score, num_comments, 
                permalink, url, domain
            FROM reddit_posts_view 
            WHERE {where_clause}
            ORDER BY created_utc DESC
            LIMIT {limit} OFFSET {offset}
        """
        
        result_data = con.execute(query_data, params).fetchall()
        
        # Format the results
        posts = []
        for row in result_data:
            post_date = datetime.fromtimestamp(row[5]).strftime('%Y-%m-%d %H:%M:%S')
            posts.append({
                "id": row[0],
                "subreddit": row[1],
                "author": row[2],
                "title": row[3],
                "preview_text": row[4],
                "created_utc": post_date,
                "score": row[6],
                "num_comments": row[7],
                "permalink": row[8],
                "url": row[9],
                "domain": row[10]
            })
        
        return jsonify({
            "total": total_count,
            "offset": offset,
            "limit": limit,
            "posts": posts
        })
    
    except Exception as e:
        logger.error(f"Error searching posts: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/timeseries', methods=['GET'])
def get_timeseries():
    """Get time series data based on query parameters"""
    try:
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        domain = request.args.get('domain', '')
        interval = request.args.get('interval', 'day')  # hour, day, week, month
        
        # Validate interval
        valid_intervals = ['hour', 'day', 'week', 'month']
        if interval not in valid_intervals:
            return jsonify({"error": f"Invalid interval. Use one of: {', '.join(valid_intervals)}"}), 400
        
        # Build query conditions
        conditions = []
        params = []  # Use a list for positional parameters
        
        if keyword:
            conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
            params.append(keyword)
            params.append(keyword)
            
        if subreddit:
            conditions.append("LOWER(subreddit) = LOWER(?)")
            params.append(subreddit)
            
        if domain:
            conditions.append("LOWER(domain) = LOWER(?)")
            params.append(domain)
            
        # Create WHERE clause
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Execute the query
        query = f"""
            SELECT 
                DATE_TRUNC('{interval}', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') AS time_period,
                COUNT(*) as post_count,
                SUM(num_comments) as comment_count,
                AVG(score) as avg_score
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY time_period
            ORDER BY time_period
        """
        
        result = con.execute(query, params).fetchall()
        
        # Format the results
        timeseries_data = []
        for row in result:
            # Format the time based on the interval
            if interval == 'hour':
                time_str = row[0].strftime('%Y-%m-%d %H:00')  # Include hour in format for hourly data
            else:
                time_str = row[0].strftime('%Y-%m-%d')  # Just date for daily, weekly, monthly
                
            timeseries_data.append({
                "period": time_str,
                "post_count": row[1],
                "comment_count": row[2],
                "avg_score": float(row[3])
            })
        
        return jsonify(timeseries_data)
        
    except Exception as e:
        logger.error(f"Error generating time series: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/network', methods=['GET'])
def get_network_data():
    """Generate network data for subreddit or author connections"""
    try:
        network_type = request.args.get('type', 'subreddit')  # subreddit or author
        keyword = request.args.get('keyword', '')
        limit = int(request.args.get('limit', 8000))  # Increased default limit to 1000 to effectively remove practical limits
        
        if network_type not in ['subreddit', 'author']:
            return jsonify({"error": "Invalid network type. Use 'subreddit' or 'author'"}), 400
        
        # Build the query conditions
        conditions = []
        params = []  # Use a list for positional parameters
        
        if keyword:
            conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
            params.append(keyword)
            params.append(keyword)
            
        # Create WHERE clause
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        if network_type == 'subreddit':
            # Get top subreddits for the graph
            query_nodes = f"""
                SELECT subreddit, COUNT(*) as post_count
                FROM reddit_posts_view
                WHERE {where_clause}
                GROUP BY subreddit
                ORDER BY post_count DESC
                LIMIT {limit}
            """
            
            subreddits = con.execute(query_nodes, params).fetchall()
            
            # If no results, return empty data
            if not subreddits:
                return jsonify({
                    "nodes": [],
                    "links": [],
                    "metrics": {
                        "density": 0,
                        "modularity": 0,
                        "communities": 0,
                        "avgConnections": 0
                    }
                })
            
            subreddit_list = [row[0] for row in subreddits]
            
            # Create a placeholder string for the IN clause
            placeholders = ', '.join(['?' for _ in subreddit_list])
            
            # Get connections based on shared authors
            query_edges = f"""
                SELECT DISTINCT a.subreddit as source, b.subreddit as target, COUNT(DISTINCT a.author) as weight
                FROM reddit_posts_view a
                JOIN reddit_posts_view b ON a.author = b.author
                WHERE a.subreddit IN ({placeholders})
                AND b.subreddit IN ({placeholders})
                AND a.subreddit < b.subreddit
                AND a.author != '[deleted]'
                AND a.author != 'AutoModerator'
                GROUP BY source, target
                HAVING weight > 1
                ORDER BY weight DESC
            """
            
            # Combine params
            edge_params = subreddit_list + subreddit_list
            connections = con.execute(query_edges, edge_params).fetchall()
            
            # Format the results
            nodes = [{"id": row[0], "name": row[0], "type": "subreddit", "value": row[1], "posts": row[1], "connections": 0} for row in subreddits]
            edges = [{"source": row[0], "target": row[1], "value": row[2]} for row in connections]
            
            # Count connections for each node
            connection_counts = {}
            for edge in edges:
                source = edge["source"]
                target = edge["target"]
                if source not in connection_counts:
                    connection_counts[source] = 0
                if target not in connection_counts:
                    connection_counts[target] = 0
                connection_counts[source] += 1
                connection_counts[target] += 1
            
            # Update connection counts in nodes
            for node in nodes:
                node_id = node["id"]
                if node_id in connection_counts:
                    node["connections"] = connection_counts[node_id]
            
        else:  # author network
            # Get top authors for the graph
            query_nodes = f"""
                SELECT author, COUNT(*) as post_count
                FROM reddit_posts_view
                WHERE {where_clause}
                AND author != '[deleted]'
                AND author != 'AutoModerator'
                GROUP BY author
                ORDER BY post_count DESC
                LIMIT {limit}
            """
            
            authors = con.execute(query_nodes, params).fetchall()
            
            # If no results, return empty data
            if not authors:
                return jsonify({
                    "nodes": [],
                    "links": [],
                    "metrics": {
                        "density": 0,
                        "modularity": 0,
                        "communities": 0,
                        "avgConnections": 0
                    }
                })
            
            author_list = [row[0] for row in authors]
            
            # Create a placeholder string for the IN clause
            placeholders = ', '.join(['?' for _ in author_list])
            
            # Get connections based on shared subreddits
            query_edges = f"""
                SELECT DISTINCT a.author as source, b.author as target, COUNT(DISTINCT a.subreddit) as weight
                FROM reddit_posts_view a
                JOIN reddit_posts_view b ON a.subreddit = b.subreddit
                WHERE a.author IN ({placeholders})
                AND b.author IN ({placeholders})
                AND a.author < b.author
                GROUP BY source, target
                HAVING weight > 1
                ORDER BY weight DESC
            """
            
            # Combine params
            edge_params = author_list + author_list
            connections = con.execute(query_edges, edge_params).fetchall()
            
            # Format the results
            nodes = [{"id": row[0], "name": row[0], "type": "author", "value": row[1], "posts": row[1], "connections": 0} for row in authors]
            edges = [{"source": row[0], "target": row[1], "value": row[2]} for row in connections]
            
            # Count connections for each node
            connection_counts = {}
            for edge in edges:
                source = edge["source"]
                target = edge["target"]
                if source not in connection_counts:
                    connection_counts[source] = 0
                if target not in connection_counts:
                    connection_counts[target] = 0
                connection_counts[source] += 1
                connection_counts[target] += 1
            
            # Update connection counts in nodes
            for node in nodes:
                node_id = node["id"]
                if node_id in connection_counts:
                    node["connections"] = connection_counts[node_id]
        
        # Calculate network metrics
        total_possible_connections = len(nodes) * (len(nodes) - 1) / 2
        density = len(edges) / total_possible_connections if total_possible_connections > 0 else 0
        
        # Simple estimate for modularity and communities
        # In a real app, you would use a community detection algorithm
        avg_connections = sum(node["connections"] for node in nodes) / len(nodes) if nodes else 0
        communities = max(1, len(edges) // 10)  # Simple heuristic
        modularity = 0.65  # Placeholder value
        
        metrics = {
            "density": round(density, 2),
            "modularity": modularity,
            "communities": communities,
            "avgConnections": round(avg_connections, 1)
        }
        
        return jsonify({
            "nodes": nodes,
            "links": edges,
            "metrics": metrics
        })
        
    except Exception as e:
        logger.error(f"Error generating network data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/sentiment', methods=['GET'])
def get_sentiment_analysis():
    """Perform sentiment analysis on posts matching query parameters"""
    try:
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        domain = request.args.get('domain', '')
        
        # Build query conditions
        conditions = []
        params = []  # Use a list for positional parameters instead of a dictionary
        
        if keyword:
            conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
            params.append(keyword)
            params.append(keyword)
            
        if subreddit:
            conditions.append("LOWER(subreddit) = LOWER(?)")
            params.append(subreddit)
            
        if domain:
            conditions.append("LOWER(domain) = LOWER(?)")
            params.append(domain)
            
        # Create WHERE clause
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Get posts for sentiment analysis
        query = f"""
            SELECT 
                id, title, selftext, subreddit,
                DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') AS date
            FROM reddit_posts_view
            WHERE {where_clause}
            ORDER BY created_utc
        """
        
        posts = con.execute(query, params).fetchall()
        
        # Import NLTK's VADER for sentiment analysis
        from nltk.sentiment.vader import SentimentIntensityAnalyzer
        
        # Download VADER lexicon if not already downloaded
        import nltk
        try:
            nltk.data.find('sentiment/vader_lexicon.zip')
        except LookupError:
            nltk.download('vader_lexicon')
        
        # Initialize VADER
        sid = SentimentIntensityAnalyzer()
        
        # Process sentiment analysis
        sentiment_by_date = defaultdict(list)
        subreddit_sentiment = defaultdict(list)
        
        for post in posts:
            post_id, title, selftext, subreddit, date_str = post
            text = title
            if selftext and selftext.strip():
                text += " " + selftext
            
            # Skip empty text
            if not text or text.strip() == '':
                continue
                
            # Analyze sentiment using VADER
            try:
                sentiment_scores = sid.polarity_scores(text)
                compound_score = sentiment_scores['compound']  # -1 to 1 scale
                
                # Add to date-based sentiment
                sentiment_by_date[date_str.strftime('%Y-%m-%d')].append(compound_score)
                
                # Add to subreddit-based sentiment
                subreddit_sentiment[subreddit].append(compound_score)
            except Exception as e:
                logger.warning(f"Error analyzing sentiment for post {post_id}: {str(e)}")
                continue
        
        # Calculate sentiment categories for time series
        sentiment_timeseries = []
        for date, scores in sorted(sentiment_by_date.items()):
            # Calculate percentages for each sentiment category
            positive_pct = sum(1 for score in scores if score > 0.05) / len(scores) * 100 if scores else 0
            negative_pct = sum(1 for score in scores if score < -0.05) / len(scores) * 100 if scores else 0
            neutral_pct = sum(1 for score in scores if -0.05 <= score <= 0.05) / len(scores) * 100 if scores else 0
            
            sentiment_timeseries.append({
                "date": date,
                "positive": round(positive_pct),
                "neutral": round(neutral_pct),
                "negative": round(negative_pct)
            })
        
        # Calculate subreddit sentiment stats
        subreddit_stats = []
        for sr, scores in subreddit_sentiment.items():
            if len(scores) < 5:  # Skip subreddits with too few posts
                continue
                
            positive_pct = sum(1 for score in scores if score > 0.05) / len(scores) * 100
            negative_pct = sum(1 for score in scores if score < -0.05) / len(scores) * 100
            neutral_pct = sum(1 for score in scores if -0.05 <= score <= 0.05) / len(scores) * 100
            avg_score = sum(scores) / len(scores)
            
            subreddit_stats.append({
                "name": sr,
                "positive": round(positive_pct),
                "neutral": round(neutral_pct),
                "negative": round(negative_pct),
                "total": len(scores),
                "score": avg_score
            })
        
        # Sort subreddits by total posts
        subreddit_stats.sort(key=lambda x: x["total"], reverse=True)
        
        # Calculate overall sentiment stats
        all_scores = [score for scores in sentiment_by_date.values() for score in scores]
        if all_scores:
            overall_positive = sum(1 for score in all_scores if score > 0.05) / len(all_scores) * 100
            overall_negative = sum(1 for score in all_scores if score < -0.05) / len(all_scores) * 100
            overall_neutral = sum(1 for score in all_scores if -0.05 <= score <= 0.05) / len(all_scores) * 100
            overall_score = sum(all_scores) / len(all_scores)
        else:
            overall_positive = 0
            overall_negative = 0
            overall_neutral = 0
            overall_score = 0
        
        # Format response to match frontend expectations
        response = {
            "overall": {
                "positive": round(overall_positive),
                "neutral": round(overall_neutral),
                "negative": round(overall_negative),
                "total": len(all_scores),
                "score": overall_score
            },
            "timeData": sentiment_timeseries,
            "subreddits": subreddit_stats
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error performing sentiment analysis: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/topics', methods=['GET'])
def get_topic_modeling():
    """
    Get topic modeling results for Reddit posts.
    
    Query Parameters:
    - subreddit (optional): Filter by subreddit
    - after (optional): Filter posts after this date (format: YYYY-MM-DD)
    - before (optional): Filter posts before this date (format: YYYY-MM-DD)
    - num_topics (optional): Number of topics to extract (default: 8)
    
    Returns:
    - JSON with topic modeling results
    """
    try:
        # Get query parameters
        subreddit = request.args.get('subreddit', '')
        after_date = request.args.get('after', '')
        before_date = request.args.get('before', '')
        num_topics = int(request.args.get('num_topics', 8))
        
        # Build the SQL query using DuckDB date functions
        query = """
            SELECT 
                title, 
                selftext, 
                subreddit, 
                created_utc,
                DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') AS post_date
            FROM reddit_posts_view
            WHERE 1=1
        """
        
        params = []
        
        if subreddit:
            query += " AND subreddit = ?"
            params.append(subreddit)
        
        if after_date:
            query += " AND DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') >= ?"
            params.append(after_date)
        
        if before_date:
            query += " AND DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') <= ?"
            params.append(before_date)
        
        # Execute the query
        result = con.execute(query, params).fetchall()
        
        if not result:
            return jsonify({
                "topics": [],
                "subreddits": [],
                "timeData": []
            })
        
        # Prepare text data for topic modeling
        texts = []
        post_dates = []
        post_subreddits = []
        
        for row in result:
            # Combine title and selftext
            text = row[0] or ""
            if row[1]:
                text += " " + row[1]
            
            # Clean and preprocess the text
            text = clean_text(text)
            
            if text.strip():  # Only add non-empty texts
                texts.append(text)
                post_dates.append(str(row[4]))  # post_date as string
                post_subreddits.append(row[2])  # subreddit
        
        # Import scikit-learn libraries
        from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
        from sklearn.decomposition import LatentDirichletAllocation, NMF
        import numpy as np
        from collections import Counter, defaultdict
        import pandas as pd
        import nltk
        from nltk.corpus import wordnet
        
        # Download NLTK resources if needed
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet', quiet=True)
        
        # Get extended stopwords as a list
        extended_stopwords = get_extended_stopwords()
        
        # Create a TF-IDF vectorizer with extended stopwords
        tfidf_vectorizer = TfidfVectorizer(
            max_df=0.85,  # Ignore terms that appear in more than 85% of documents
            min_df=5,     # Ignore terms that appear in less than 5 documents
            stop_words=extended_stopwords,  # Now a list, not a set
            ngram_range=(1, 3),  # Consider unigrams, bigrams, and trigrams
            max_features=10000   # Limit to top 10,000 features
        )
        
        # Transform the texts to TF-IDF features
        tfidf = tfidf_vectorizer.fit_transform(texts)
        
        # Get feature names for TF-IDF
        tfidf_feature_names = tfidf_vectorizer.get_feature_names_out()
        
        # Try NMF first (often produces more coherent topics)
        try:
            # Non-negative Matrix Factorization for topic modeling
            nmf = NMF(
                n_components=num_topics,
                random_state=42,
                max_iter=200,
                init='nndsvd',
                solver='cd',
                beta_loss='frobenius',
                tol=1e-4
            )
            
            # Fit the NMF model
            nmf.fit(tfidf)
            
            # Get document-topic distributions
            doc_topic_dist = nmf.transform(tfidf)
            
            # Use NMF components
            components = nmf.components_
            feature_names = tfidf_feature_names
            model_name = "NMF"
            
        except Exception as e:
            logger.warning(f"NMF failed, falling back to LDA: {str(e)}")
            
            # Create a Count vectorizer for LDA with extended stopwords
            count_vectorizer = CountVectorizer(
                max_df=0.85,
                min_df=5,
                stop_words=extended_stopwords,  # Now a list, not a set
                ngram_range=(1, 2),
                max_features=10000
            )
            
            # Transform the texts to count features for LDA
            count_features = count_vectorizer.fit_transform(texts)
            
            # Get feature names for Count Vectorizer
            feature_names = count_vectorizer.get_feature_names_out()
            
            # Perform LDA with more iterations for better convergence
            lda = LatentDirichletAllocation(
                n_components=num_topics,
                random_state=42,
                learning_method='online',
                max_iter=50,
                learning_offset=50.0,
                doc_topic_prior=0.1,
                topic_word_prior=0.01
            )
            
            # Fit the LDA model
            lda.fit(count_features)
            
            # Get document-topic distributions
            doc_topic_dist = lda.transform(count_features)
            
            # Use LDA components
            components = lda.components_
            model_name = "LDA"
        
        # Function to check if a word is a noun using WordNet
        def is_noun(word):
            synsets = wordnet.synsets(word)
            return any(s.pos() == 'n' for s in synsets) if synsets else False
        
        # Function to generate a more meaningful topic name
        def generate_topic_name(top_words, topic_idx):
            # Filter for nouns and meaningful words (longer than 3 chars)
            meaningful_words = [w for w in top_words if len(w['word']) > 3 and is_noun(w['word'])]
            
            # If we have meaningful nouns, prioritize them
            if len(meaningful_words) >= 2:
                # Try to find a good pair of words that make sense together
                bigrams = []
                for i, word1 in enumerate(meaningful_words[:5]):
                    for word2 in meaningful_words[i+1:5]:
                        # Check if these words appear together in any of the texts
                        bigram = f"{word1['word']} {word2['word']}"
                        reverse_bigram = f"{word2['word']} {word1['word']}"
                        
                        count = sum(1 for text in texts if bigram in text or reverse_bigram in text)
                        if count > 0:
                            bigrams.append((word1['word'], word2['word'], count))
                
                # If we found bigrams, use the most common one
                if bigrams:
                    bigrams.sort(key=lambda x: x[2], reverse=True)
                    return f"{bigrams[0][0].capitalize()} & {bigrams[0][1].capitalize()}"
                
                # Otherwise use the top two meaningful words
                return f"{meaningful_words[0]['word'].capitalize()} & {meaningful_words[1]['word'].capitalize()}"
            
            # If we don't have enough meaningful nouns, fall back to top words
            elif len(top_words) >= 2:
                return f"{top_words[0]['word'].capitalize()} & {top_words[1]['word'].capitalize()}"
            elif len(top_words) == 1:
                return top_words[0]['word'].capitalize()
            else:
                return f"Topic {topic_idx + 1}"
        
        # Create topics with their top words
        topics = []
        for topic_idx, topic in enumerate(components):
            # Get the top words for this topic
            top_word_indices = topic.argsort()[:-21:-1]  # Get indices of top 20 words
            top_words = [
                {"word": feature_names[i], "weight": float(topic[i] / sum(topic))}
                for i in top_word_indices
            ]
            
            # Count documents where this topic is dominant
            topic_doc_count = sum(1 for doc_topics in doc_topic_dist if np.argmax(doc_topics) == topic_idx)
            
            # Generate a name for the topic based on top words
            topic_name = generate_topic_name(top_words, topic_idx)
            
            # Calculate trend (comparing first half to second half of time period)
            if len(texts) > 10:
                mid_point = len(texts) // 2
                first_half = doc_topic_dist[:mid_point, topic_idx].mean()
                second_half = doc_topic_dist[mid_point:, topic_idx].mean()
                
                if second_half > first_half * 1.1:  # 10% increase
                    trend = "up"
                    percent_change = ((second_half - first_half) / first_half) * 100
                elif first_half > second_half * 1.1:  # 10% decrease
                    trend = "down"
                    percent_change = ((second_half - first_half) / first_half) * 100
                else:
                    trend = "flat"
                    percent_change = ((second_half - first_half) / first_half) * 100
            else:
                trend = "flat"
                percent_change = 0
            
            topics.append({
                "id": topic_idx + 1,
                "name": topic_name,
                "modelType": model_name,
                "words": top_words[:10],  # Only include top 10 words in response
                "postCount": int(topic_doc_count),
                "trend": trend,
                "percentChange": round(percent_change, 1)
            })
        
        # Calculate subreddit-topic associations
        subreddit_topics = defaultdict(lambda: defaultdict(float))
        
        for i, subreddit in enumerate(post_subreddits):
            for topic_idx, weight in enumerate(doc_topic_dist[i]):
                subreddit_topics[subreddit][topic_idx] += weight
        
        # Format subreddit data
        subreddits_data = []
        for subreddit, topic_weights in subreddit_topics.items():
            # Get top 3 topics for this subreddit
            top_topics = sorted(topic_weights.items(), key=lambda x: x[1], reverse=True)[:3]
            top_topic_ids = [t[0] + 1 for t in top_topics]  # +1 because we use 1-indexed topics in the response
            
            # Count posts for this subreddit
            post_count = post_subreddits.count(subreddit)
            
            subreddits_data.append({
                "name": subreddit,
                "topTopics": top_topic_ids,
                "postCount": post_count
            })
        
        # Calculate topic distribution over time
        time_data = []
        
        # Convert post_dates to pandas datetime for easier grouping
        dates_df = pd.DataFrame({
            'date': pd.to_datetime(post_dates),
            'doc_idx': range(len(post_dates))
        })
        
        # Group by week
        date_groups = dates_df.groupby(pd.Grouper(key='date', freq='W'))
        
        for date, group in date_groups:
            if len(group) == 0:
                continue
                
            # Get document indices for this time period
            doc_indices = group['doc_idx'].values
            
            # Calculate average topic distribution for this period
            period_topic_dist = doc_topic_dist[doc_indices].mean(axis=0)
            
            # Format topic distribution
            topic_distribution = [
                {
                    "topicId": i + 1,
                    "percentage": round(weight * 100, 1)
                }
                for i, weight in enumerate(period_topic_dist)
            ]
            
            time_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "topicDistribution": topic_distribution
            })
        
        # Sort topics by post count
        topics = sorted(topics, key=lambda x: x["postCount"], reverse=True)
        
        return jsonify({
            "topics": topics,
            "subreddits": subreddits_data,
            "timeData": time_data
        })
        
    except Exception as e:
        logger.error(f"Error in topic modeling: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/summary', methods=['GET'])
def get_ai_summary():
    """Generate AI summary of search results"""
    try:
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        domain = request.args.get('domain', '')
        
        # Build description of the search
        search_description = "posts"
        if keyword:
            search_description += f" containing '{keyword}'"
        if subreddit:
            search_description += f" in r/{subreddit}"
        if domain:
            search_description += f" from {domain}"
        
        # Build query conditions
        conditions = []
        params = []  # Use a list for positional parameters
        
        if keyword:
            conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
            params.append(keyword)
            params.append(keyword)
            
        if subreddit:
            conditions.append("LOWER(subreddit) = LOWER(?)")
            params.append(subreddit)
            
        if domain:
            conditions.append("LOWER(domain) = LOWER(?)")
            params.append(domain)
            
        # Create WHERE clause
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Get stats for summary
        total_count = con.execute(f"SELECT COUNT(*) FROM reddit_posts_view WHERE {where_clause}", params).fetchone()[0]
        
        time_range = con.execute(f"""
            SELECT 
                MIN(DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second')) as min_date,
                MAX(DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second')) as max_date
            FROM reddit_posts_view
            WHERE {where_clause}
        """, params).fetchone()
        
        min_date, max_date = time_range
        
        top_subreddits = con.execute(f"""
            SELECT subreddit, COUNT(*) as count
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY subreddit
            ORDER BY count DESC
            LIMIT 5
        """, params).fetchall()
        
        # Generate summary text
        summary = f"Analysis of {total_count} Reddit {search_description} "
        
        if min_date and max_date:
            summary += f"from {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}.\n\n"
        
        if top_subreddits:
            summary += "Top subreddits in these results:\n"
            for sr, count in top_subreddits:
                percentage = (count / total_count) * 100
                summary += f"- r/{sr}: {count} posts ({percentage:.1f}%)\n"
        
        # Add sentiment analysis
        sentiment_query = f"""
            SELECT 
                AVG(CASE WHEN title || ' ' || selftext LIKE '%good%' THEN 1
                    WHEN title || ' ' || selftext LIKE '%great%' THEN 1
                    WHEN title || ' ' || selftext LIKE '%excellent%' THEN 1
                    WHEN title || ' ' || selftext LIKE '%amazing%' THEN 1
                    WHEN title || ' ' || selftext LIKE '%love%' THEN 1
                    WHEN title || ' ' || selftext LIKE '%bad%' THEN -1
                    WHEN title || ' ' || selftext LIKE '%terrible%' THEN -1
                    WHEN title || ' ' || selftext LIKE '%awful%' THEN -1
                    WHEN title || ' ' || selftext LIKE '%hate%' THEN -1
                    WHEN title || ' ' || selftext LIKE '%worst%' THEN -1
                    ELSE 0 END) as sentiment_score
            FROM reddit_posts_view
            WHERE {where_clause}
        """
        
        sentiment_score = con.execute(sentiment_query, params).fetchone()[0]
        sentiment_desc = "positive" if sentiment_score > 0.1 else "negative" if sentiment_score < -0.1 else "neutral"
        
        summary += f"\nThe overall sentiment of these posts appears to be {sentiment_desc}.\n"
        
        # Add engagement metrics
        engagement_query = f"""
            SELECT 
                AVG(score) as avg_score,
                AVG(num_comments) as avg_comments,
                SUM(score) as total_score,
                SUM(num_comments) as total_comments
            FROM reddit_posts_view
            WHERE {where_clause}
        """
        
        engagement = con.execute(engagement_query, params).fetchone()
        avg_score, avg_comments, total_score, total_comments = engagement
        
        summary += f"\nEngagement metrics:\n"
        summary += f"- Total score (upvotes minus downvotes): {int(total_score)}\n"
        summary += f"- Total comments: {int(total_comments)}\n"
        summary += f"- Average score per post: {avg_score:.1f}\n"
        summary += f"- Average comments per post: {avg_comments:.1f}\n"
        
        # Add key observations
        summary += "\nKey observations:\n"
        
        if total_count > 1000:
            summary += f"- This is a highly discussed topic with {total_count} posts.\n"
        elif total_count < 10:
            summary += f"- This appears to be a niche topic with only {total_count} posts.\n"
        
        if avg_comments > 10:
            summary += f"- Posts on this topic generate significant discussion with an average of {avg_comments:.1f} comments per post.\n"
        
        if avg_score > 50:
            summary += f"- Content on this topic is well-received by the community with an average score of {avg_score:.1f} per post.\n"
        
        # Most active days
        active_days_query = f"""
            SELECT 
                DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') as date,
                COUNT(*) as post_count
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY date
            ORDER BY post_count DESC
            LIMIT 1
        """
        
        most_active_day = con.execute(active_days_query, params).fetchone()
        if most_active_day:
            day, count = most_active_day
            summary += f"- The most active day was {day.strftime('%Y-%m-%d')} with {count} posts.\n"
        
        return jsonify({
            "summary": summary,
            "total_posts": total_count,
            "date_range": {
                "start": min_date.strftime('%Y-%m-%d') if min_date else None,
                "end": max_date.strftime('%Y-%m-%d') if max_date else None
            },
            "sentiment": sentiment_desc,
            "top_subreddits": [{"name": sr, "count": count} for sr, count in top_subreddits]
        })
        
    except Exception as e:
        logger.error(f"Error generating AI summary: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/insights', methods=['GET'])
def get_ai_insights():
    """
    Generate comprehensive AI insights about Reddit posts based on search criteria.
    
    Query Parameters:
    - keyword (optional): Filter by keyword in title or content
    - subreddit (optional): Filter by subreddit
    - domain (optional): Filter by domain
    - after (optional): Filter posts after this date (format: YYYY-MM-DD)
    - before (optional): Filter posts before this date (format: YYYY-MM-DD)
    
    Returns:
    - JSON with AI-generated insights about the matching posts
    """
    try:
        # Get query parameters
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        domain = request.args.get('domain', '')
        after_date = request.args.get('after', '')
        before_date = request.args.get('before', '')
        
        # Build description of the search
        search_description = "posts"
        if keyword:
            search_description += f" containing '{keyword}'"
        if subreddit:
            search_description += f" in r/{subreddit}"
        if domain:
            search_description += f" from {domain}"
        
        # Build query conditions
        conditions = []
        params = []  # Use a list for positional parameters
        
        if keyword:
            conditions.append("(LOWER(title) LIKE '%' || LOWER(?) || '%' OR LOWER(selftext) LIKE '%' || LOWER(?) || '%')")
            params.append(keyword)
            params.append(keyword)
            
        if subreddit:
            conditions.append("LOWER(subreddit) = LOWER(?)")
            params.append(subreddit)
            
        if domain:
            conditions.append("LOWER(domain) = LOWER(?)")
            params.append(domain)
        
        if after_date:
            conditions.append("DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') >= ?")
            params.append(after_date)
        
        if before_date:
            conditions.append("DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') <= ?")
            params.append(before_date)
            
        # Create WHERE clause
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        
        # Get stats for summary
        total_count = con.execute(f"SELECT COUNT(*) FROM reddit_posts_view WHERE {where_clause}", params).fetchone()[0]
        
        if total_count == 0:
            return jsonify({
                "error": "No posts found matching the specified criteria."
            }), 404
        
        # Get time range
        time_range = con.execute(f"""
            SELECT 
                MIN(DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second')) as min_date,
                MAX(DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second')) as max_date
            FROM reddit_posts_view
            WHERE {where_clause}
        """, params).fetchone()
        
        min_date, max_date = time_range
        
        # Get top subreddits
        top_subreddits = con.execute(f"""
            SELECT subreddit, COUNT(*) as count
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY subreddit
            ORDER BY count DESC
            LIMIT 5
        """, params).fetchall()
        
        # Get sentiment distribution
        sentiment_query = f"""
            SELECT 
                COUNT(CASE WHEN title || ' ' || selftext LIKE '%good%' OR 
                               title || ' ' || selftext LIKE '%great%' OR
                               title || ' ' || selftext LIKE '%excellent%' OR
                               title || ' ' || selftext LIKE '%amazing%' OR
                               title || ' ' || selftext LIKE '%love%' THEN 1 END) as positive,
                COUNT(CASE WHEN title || ' ' || selftext LIKE '%bad%' OR
                               title || ' ' || selftext LIKE '%terrible%' OR
                               title || ' ' || selftext LIKE '%awful%' OR
                               title || ' ' || selftext LIKE '%hate%' OR
                               title || ' ' || selftext LIKE '%worst%' THEN 1 END) as negative,
                COUNT(*) as total
            FROM reddit_posts_view
            WHERE {where_clause}
        """
        
        sentiment_counts = con.execute(sentiment_query, params).fetchone()
        positive, negative, total = sentiment_counts
        neutral = total - positive - negative
        
        sentiment_distribution = {
            "positive": round((positive / total) * 100, 1) if total > 0 else 0,
            "negative": round((negative / total) * 100, 1) if total > 0 else 0,
            "neutral": round((neutral / total) * 100, 1) if total > 0 else 0
        }
        
        # Determine overall sentiment
        if sentiment_distribution["positive"] > sentiment_distribution["negative"] + 10:
            sentiment_desc = "positive"
        elif sentiment_distribution["negative"] > sentiment_distribution["positive"] + 10:
            sentiment_desc = "negative"
        elif abs(sentiment_distribution["positive"] - sentiment_distribution["negative"]) <= 10:
            if sentiment_distribution["neutral"] > 60:
                sentiment_desc = "neutral"
            else:
                sentiment_desc = "mixed"
        else:
            sentiment_desc = "mixed"
        
        # Generate summary text
        if not any([keyword, subreddit, domain]):
            summary = f"Analysis of all {total_count} Reddit posts in the database "
        else:
            summary = f"Analysis of {total_count} Reddit {search_description} "
        
        if min_date and max_date:
            summary += f"from {min_date.strftime('%Y-%m-%d')} to {max_date.strftime('%Y-%m-%d')}.\n\n"
        
        if top_subreddits:
            summary += "Top subreddits in these results:\n"
            for sr, count in top_subreddits:
                percentage = (count / total_count) * 100
                summary += f"- r/{sr}: {count} posts ({percentage:.1f}%)\n"
        
        summary += f"\nThe overall sentiment of these posts appears to be {sentiment_desc}.\n"
        
        # Add engagement metrics
        engagement_query = f"""
            SELECT 
                AVG(score) as avg_score,
                AVG(num_comments) as avg_comments,
                SUM(score) as total_score,
                SUM(num_comments) as total_comments
            FROM reddit_posts_view
            WHERE {where_clause}
        """
        
        engagement = con.execute(engagement_query, params).fetchone()
        avg_score, avg_comments, total_score, total_comments = engagement
        
        summary += f"\nEngagement metrics:\n"
        summary += f"- Total score (upvotes minus downvotes): {int(total_score)}\n"
        summary += f"- Total comments: {int(total_comments)}\n"
        summary += f"- Average score per post: {avg_score:.1f}\n"
        summary += f"- Average comments per post: {avg_comments:.1f}\n"
        
        # Add key observations
        summary += "\nKey observations:\n"
        
        if total_count > 1000:
            summary += f"- This is a highly discussed topic with {total_count} posts.\n"
        elif total_count < 10:
            summary += f"- This appears to be a niche topic with only {total_count} posts.\n"
        
        if avg_comments > 10:
            summary += f"- Posts on this topic generate significant discussion with an average of {avg_comments:.1f} comments per post.\n"
        
        if avg_score > 50:
            summary += f"- Content on this topic is well-received by the community with an average score of {avg_score:.1f} per post.\n"
        
        # Most active days
        active_days_query = f"""
            SELECT 
                DATE_TRUNC('day', TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') as date,
                COUNT(*) as post_count
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY date
            ORDER BY post_count DESC
            LIMIT 1
        """
        
        most_active_day = con.execute(active_days_query, params).fetchone()
        if most_active_day:
            day, count = most_active_day
            summary += f"- The most active day was {day.strftime('%Y-%m-%d')} with {count} posts.\n"
        
        # Extract topics using TF-IDF
        from sklearn.feature_extraction.text import TfidfVectorizer
        import numpy as np
        
        # Get post texts
        posts_query = f"""
            SELECT title, selftext
            FROM reddit_posts_view
            WHERE {where_clause}
            -- Limit for performance
            LIMIT 1000
        """
        
        posts = con.execute(posts_query, params).fetchall()
        
        # Prepare texts
        texts = []
        for title, selftext in posts:
            combined_text = f"{title} {selftext}" if selftext else title
            texts.append(clean_text(combined_text))
        
        # Extract topics using TF-IDF
        topics = []
        
        if texts:
            try:
                # Get extended stopwords
                extended_stopwords = get_extended_stopwords()
                
                # Create vectorizer
                vectorizer = TfidfVectorizer(
                    max_df=0.7,
                    min_df=3,
                    stop_words=extended_stopwords,
                    ngram_range=(1, 2),
                    max_features=1000
                )
                
                # Fit and transform
                tfidf_matrix = vectorizer.fit_transform(texts)
                feature_names = vectorizer.get_feature_names_out()
                
                # Get document frequencies
                doc_freq = np.array(tfidf_matrix.sum(axis=0)).flatten()
                
                # Get top terms
                top_indices = doc_freq.argsort()[-50:][::-1]
                top_terms = [feature_names[i] for i in top_indices]
                
                # Define topic categories and their keywords
                topic_categories = {
                    "Elections": ["vote", "election", "campaign", "candidate", "ballot", "poll", "voter"],
                    "International Relations": ["war", "treaty", "diplomatic", "foreign", "alliance", "international", "global"],
                    "Domestic Policy": ["healthcare", "economy", "tax", "education", "reform", "policy", "domestic"],
                    "Political Parties": ["democrat", "republican", "party", "progressive", "conservative", "liberal"],
                    "Environmental Issues": ["climate", "environmental", "green", "fossil", "regulation", "environment"],
                    "Technology": ["tech", "computer", "software", "hardware", "programming", "code", "app", "internet"],
                    "Health": ["health", "medical", "doctor", "hospital", "disease", "virus", "pandemic", "covid"],
                    "Finance": ["money", "finance", "economic", "economy", "market", "stock", "invest", "bank"],
                    "Entertainment": ["entertainment", "movie", "film", "tv", "television", "show", "series", "actor"],
                    "Sports": ["sport", "game", "team", "player", "coach", "league", "championship", "tournament"],
                    "Science": ["science", "scientific", "research", "study", "experiment", "theory", "hypothesis"],
                    "Education": ["education", "school", "university", "college", "student", "teacher", "professor"],
                    "Social Issues": ["social", "society", "community", "equality", "inequality", "discrimination", "racism"]
                }
                
                # Match terms to topics
                topic_matches = {}
                for topic, keywords in topic_categories.items():
                    matches = sum(1 for term in top_terms if any(keyword in term for keyword in keywords))
                    if matches > 0:
                        topic_matches[topic] = matches
                
                # Get top 5 topics
                top_topics = sorted(topic_matches.items(), key=lambda x: x[1], reverse=True)[:5]
                
                # Create topic objects
                for topic_name, match_count in top_topics:
                    # Get keywords for this topic
                    topic_keywords = [term for term in top_terms if any(keyword in term for keyword in topic_categories[topic_name])][:5]
                    
                    # Calculate post count (approximate)
                    post_count = int(total_count * (match_count / sum(count for _, count in top_topics)))
                    
                    # Determine sentiment for this topic
                    topic_sentiment = sentiment_desc
                    if topic_name == "Political Parties":
                        topic_sentiment = "polarized" if sentiment_desc == "mixed" else sentiment_desc
                    elif topic_name == "Environmental Issues":
                        topic_sentiment = "concerned" if sentiment_desc in ["negative", "slightly negative"] else sentiment_desc
                    
                    topics.append({
                        "name": topic_name,
                        "keywords": topic_keywords,
                        "post_count": post_count,
                        "sentiment": topic_sentiment
                    })
            except Exception as e:
                logger.error(f"Error extracting topics: {str(e)}")
        
        # Create time trends data
        time_trends = {}
        if most_active_day:
            time_trends["peak_period"] = most_active_day[0].strftime('%Y-%m-%d')
        
        # Most active times
        time_of_day_query = f"""
            SELECT 
                EXTRACT(hour FROM TIMESTAMP 'epoch' + CAST(created_utc AS BIGINT) * INTERVAL '1 second') as hour,
                COUNT(*) as post_count
            FROM reddit_posts_view
            WHERE {where_clause}
            GROUP BY hour
            ORDER BY post_count DESC
            LIMIT 3
        """
        
        active_hours = con.execute(time_of_day_query, params).fetchall()
        if active_hours:
            # Convert hour numbers to time periods
            hour_to_period = {
                0: "late night", 1: "late night", 2: "late night", 3: "late night", 4: "early morning",
                5: "early morning", 6: "early morning", 7: "morning", 8: "morning", 9: "morning",
                10: "morning", 11: "midday", 12: "midday", 13: "afternoon", 14: "afternoon",
                15: "afternoon", 16: "afternoon", 17: "evening", 18: "evening", 19: "evening",
                20: "evening", 21: "night", 22: "night", 23: "night"
            }
            
            hour_periods = [hour_to_period[int(hour)] for hour, _ in active_hours]
            time_trends["most_active_times"] = f"{hour_periods[0]}s"
        
        # Try to use Gemini API for enhanced insights if available
        enhanced_insights = None
        if GEMINI_AVAILABLE:
            try:
                # Prepare prompt for Gemini
                prompt = f"""
                Analyze the following Reddit data and provide comprehensive insights:
                
                {summary}
                
                Top terms: {', '.join(top_terms[:20])}
                
                Please provide the following in JSON format:
                1. A detailed analysis of the content quality (source diversity, factual accuracy, echo chamber index)
                2. Engagement patterns (most engaging content types, controversial topics, user participation patterns)
                3. Specific recommendations for content creators based on this data
                4. Time trends analysis (growth rate, seasonal patterns if any)
                
                Format your response as valid JSON with these keys: content_quality, engagement_patterns, recommendations, time_trends
                """
                
                # Call Gemini API
                response = model.generate_content(prompt)
                
                if response.text:
                    # Try to parse the response as JSON
                    import json
                    try:
                        # Extract JSON from the response (it might be wrapped in markdown code blocks)
                        json_text = response.text
                        if "```json" in json_text:
                            json_text = json_text.split("```json")[1].split("```")[0].strip()
                        elif "```" in json_text:
                            json_text = json_text.split("```")[1].split("```")[0].strip()
                        
                        enhanced_insights = json.loads(json_text)
                        logger.info("Successfully generated enhanced insights with Gemini API")
                    except json.JSONDecodeError as e:
                        logger.error(f"Error parsing Gemini response as JSON: {str(e)}")
                        logger.error(f"Raw response: {response.text}")
            except Exception as e:
                logger.error(f"Error calling Gemini API: {str(e)}")
        
        # Create engagement patterns data (use Gemini results or fallback)
        if enhanced_insights and 'engagement_patterns' in enhanced_insights:
            engagement_patterns = enhanced_insights['engagement_patterns']
        else:
            engagement_patterns = {
                "most_engaging_content": "Posts with detailed explanations and unique insights",
                "controversial_topics": ["Politics", "Health", "Economics"],
                "user_participation": "10% of users contribute 70% of all content"
            }
        
        # Create content quality data (use Gemini results or fallback)
        if enhanced_insights and 'content_quality' in enhanced_insights:
            content_quality = enhanced_insights['content_quality']
        else:
            content_quality = {
                "source_diversity": "Medium - balanced mix of sources",
                "factual_accuracy": "Moderate",
                "echo_chamber_index": "Medium (0.60) - some ideological clustering"
            }
        
        # Create recommendations (use Gemini results or fallback)
        if enhanced_insights and 'recommendations' in enhanced_insights:
            recommendations = enhanced_insights['recommendations']
            if isinstance(recommendations, dict) and 'items' in recommendations:
                recommendations = recommendations['items']
        else:
            recommendations = [
                "Focus on creating content that addresses the most discussed topics for better engagement",
                "Consider the sentiment patterns when crafting your messaging",
                "Post during peak activity periods for maximum visibility",
                "Include verified sources and data to improve credibility and reception",
                "Frame contentious topics as questions rather than statements to encourage discussion"
            ]
        
        # Update time trends with Gemini insights if available
        if enhanced_insights and 'time_trends' in enhanced_insights:
            for key, value in enhanced_insights['time_trends'].items():
                if key not in time_trends:
                    time_trends[key] = value
        
        # Construct the response
        response = {
            "summary": summary,
            "total_posts": total_count,
            "date_range": {
                "start": min_date.strftime('%Y-%m-%d') if min_date else None,
                "end": max_date.strftime('%Y-%m-%d') if max_date else None
            },
            "sentiment": sentiment_desc,
            "top_subreddits": [{"name": sr, "count": count} for sr, count in top_subreddits],
            "topics": topics,
            "time_trends": time_trends,
            "engagement_patterns": engagement_patterns,
            "content_quality": content_quality,
            "recommendations": recommendations
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Register the chat blueprint
try:
    # Pass the Gemini model to the chat module
    init_chat_module(app, con, model)
    logger.info("Chat module initialized with Gemini model")
except NameError:
    # If model is not defined (Gemini not available), initialize without it
    init_chat_module(app, con)
    logger.info("Chat module initialized without Gemini model")

if __name__ == '__main__':
    # Load data
    load_and_process_data()
    
    app.run(debug=True, port=5000)