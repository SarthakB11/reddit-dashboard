from flask import Flask, jsonify, request
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

# Imports for machine learning and NLP capabilities
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation, TruncatedSVD
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize DuckDB connection
con = duckdb.connect(database=':memory:')

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
    """Perform topic modeling on posts matching query parameters"""
    try:
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        domain = request.args.get('domain', '')
        num_topics = int(request.args.get('num_topics', 5))
        num_words = int(request.args.get('num_words', 10))
        
        if num_topics < 2 or num_topics > 20:
            return jsonify({"error": "Number of topics must be between 2 and 20"}), 400
            
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
        
        # Get posts for topic modeling
        query = f"""
            SELECT 
                id, title, selftext
            FROM reddit_posts_view
            WHERE {where_clause}
            AND LENGTH(selftext) > 50
            LIMIT 5000
        """
        
        posts = con.execute(query, params).fetchall()
        
        if len(posts) < 50:
            return jsonify({"error": "Not enough data for meaningful topic modeling. Try broader search criteria."}), 400
        
        # Prepare text data
        texts = []
        for post in posts:
            post_id, title, selftext = post
            combined_text = title
            if selftext and selftext.strip():
                combined_text += " " + selftext
            
            # Clean text
            combined_text = re.sub(r'http\S+', '', combined_text)  # Remove URLs
            combined_text = re.sub(r'[^\w\s]', '', combined_text)  # Remove punctuation
            combined_text = re.sub(r'\s+', ' ', combined_text).strip()  # Remove extra whitespace
            
            if len(combined_text.split()) > 5:  # Only include if at least 5 words
                texts.append(combined_text)
        
        # Vectorize the text
        vectorizer = CountVectorizer(max_df=0.95, min_df=2, stop_words='english')
        dtm = vectorizer.fit_transform(texts)
        
        # Perform LDA
        lda = LatentDirichletAllocation(
            n_components=num_topics,
            random_state=42,
            max_iter=10
        )
        lda.fit(dtm)
        
        # Get feature names
        feature_names = vectorizer.get_feature_names_out()
        
        # Extract topics
        topics = []
        for topic_idx, topic in enumerate(lda.components_):
            top_features_ind = topic.argsort()[:-num_words-1:-1]
            top_features = [feature_names[i] for i in top_features_ind]
            top_weights = [topic[i] for i in top_features_ind]
            
            topics.append({
                "id": topic_idx,
                "words": top_features,
                "weights": [float(w) for w in top_weights],
                "prevalence": float(sum(lda.transform(dtm)[:, topic_idx]) / len(texts))
            })
        
        # Generate topic assignments for visualization
        topic_assignments = lda.transform(dtm)
        topic_distribution = []
        for idx, doc_topics in enumerate(topic_assignments):
            primary_topic = np.argmax(doc_topics)
            topic_distribution.append({
                "document_id": idx,
                "primary_topic": int(primary_topic),
                "topic_weights": [float(w) for w in doc_topics],
                "topic_confidence": float(doc_topics[primary_topic])
            })
        
        return jsonify({
            "topics": topics,
            "document_count": len(texts),
            "topic_distribution": topic_distribution[:100]  # Return first 100 for visualization
        })
        
    except Exception as e:
        logger.error(f"Error performing topic modeling: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/summary', methods=['GET'])
def get_ai_summary():
    """Generate AI summary of search results"""
    try:
        keyword = request.args.get('keyword', '')
        subreddit = request.args.get('subreddit', '')
        domain = request.args.get('domain', '')
        
        if not any([keyword, subreddit, domain]):
            return jsonify({"error": "Provide at least one search parameter (keyword, subreddit, or domain)"}), 400
        
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
    """Alias for AI summary to match frontend endpoint name"""
    return get_ai_summary()

if __name__ == '__main__':
    app.run(debug=True, port=5000)