import re
import numpy as np
import pandas as pd
from collections import Counter, defaultdict
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import LatentDirichletAllocation
from textblob import TextBlob
import networkx as nx
import logging

logger = logging.getLogger(__name__)

class RedditDataProcessor:
    """
    Helper class for processing Reddit data for advanced analytics
    """
    
    @staticmethod
    def extract_urls(text):
        """Extract URLs from text"""
        if not text or not isinstance(text, str):
            return []
            
        url_pattern = re.compile(r'https?://\S+')
        return url_pattern.findall(text)
    
    @staticmethod
    def extract_hashtags(text):
        """Extract hashtags from text"""
        if not text or not isinstance(text, str):
            return []
            
        hashtag_pattern = re.compile(r'#\w+')
        return hashtag_pattern.findall(text)
    
    @staticmethod
    def extract_mentions(text):
        """Extract user mentions from text"""
        if not text or not isinstance(text, str):
            return []
            
        mention_pattern = re.compile(r'@\w+')
        return mention_pattern.findall(text)
    
    @staticmethod
    def clean_text(text, remove_urls=True, remove_hashtags=False, remove_mentions=False):
        """Clean text for NLP processing"""
        if not text or not isinstance(text, str):
            return ""
            
        # Remove URLs if requested
        if remove_urls:
            text = re.sub(r'https?://\S+', '', text)
            
        # Remove hashtags if requested
        if remove_hashtags:
            text = re.sub(r'#\w+', '', text)
            
        # Remove mentions if requested
        if remove_mentions:
            text = re.sub(r'@\w+', '', text)
            
        # Remove non-alphanumeric characters except spaces
        text = re.sub(r'[^\w\s]', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    @staticmethod
    def get_sentiment(text):
        """Get sentiment score for text"""
        if not text or not isinstance(text, str) or text.strip() == "":
            return 0.0
            
        try:
            analysis = TextBlob(text)
            return analysis.sentiment.polarity
        except Exception as e:
            logger.warning(f"Error analyzing sentiment: {str(e)}")
            return 0.0
    
    @staticmethod
    def generate_topic_model(texts, num_topics=5, num_words=10):
        """Generate topic model from texts"""
        if not texts or len(texts) < 50:
            return {"error": "Not enough data for topic modeling"}
            
        try:
            # Vectorize the text
            vectorizer = CountVectorizer(max_df=0.95, min_df=2, stop_words='english')
            dtm = vectorizer.fit_transform(texts)
            
            # Create and fit the LDA model
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
            
            return {
                "topics": topics,
                "document_count": len(texts),
                "topic_model": lda,
                "vectorizer": vectorizer,
                "dtm": dtm
            }
        except Exception as e:
            logger.error(f"Error in topic modeling: {str(e)}")
            return {"error": str(e)}
    
    @staticmethod
    def create_network_graph(nodes, edges, graph_type='subreddit'):
        """Create a network graph from nodes and edges"""
        G = nx.Graph()
        
        # Add nodes
        for node in nodes:
            G.add_node(node['id'], name=node['name'], value=node['value'])
        
        # Add edges
        for edge in edges:
            G.add_edge(edge['source'], edge['target'], weight=edge['value'])
        
        # Calculate network metrics
        try:
            # Node degree (number of connections)
            degrees = dict(nx.degree(G))
            
            # Betweenness centrality (measure of node importance)
            betweenness = nx.betweenness_centrality(G, weight='weight')
            
            # Community detection using Louvain method
            communities = nx.community.greedy_modularity_communities(G, weight='weight')
            community_map = {}
            for i, comm in enumerate(communities):
                for node in comm:
                    community_map[node] = i
            
            # Update node data with calculated metrics
            node_metrics = []
            for node in nodes:
                node_id = node['id']
                node_metrics.append({
                    "id": node_id,
                    "name": node['name'],
                    "value": node['value'],
                    "degree": degrees.get(node_id, 0),
                    "betweenness": betweenness.get(node_id, 0),
                    "community": community_map.get(node_id, -1)
                })
            
            # Calculate community statistics
            community_stats = []
            for i in range(len(communities)):
                comm_nodes = [n for n in G.nodes if community_map.get(n, -1) == i]
                if not comm_nodes:
                    continue
                    
                # Get subgraph for this community
                subgraph = G.subgraph(comm_nodes)
                
                # Calculate density (connections within community)
                density = nx.density(subgraph)
                
                # Calculate average degree for nodes in this community
                avg_degree = sum(dict(nx.degree(subgraph)).values()) / len(comm_nodes)
                
                community_stats.append({
                    "id": i,
                    "size": len(comm_nodes),
                    "density": density,
                    "avg_degree": avg_degree
                })
            
            return {
                "nodes": node_metrics,
                "links": edges,
                "communities": community_stats,
                "graph_type": graph_type,
                "total_nodes": len(G.nodes),
                "total_edges": len(G.edges),
                "density": nx.density(G),
                "diameter": nx.diameter(G) if nx.is_connected(G) else -1,
                "connected_components": nx.number_connected_components(G)
            }
        except Exception as e:
            logger.error(f"Error calculating network metrics: {str(e)}")
            # Return basic graph data if metrics calculation fails
            return {
                "nodes": nodes,
                "links": edges,
                "graph_type": graph_type,
                "total_nodes": len(G.nodes),
                "total_edges": len(G.edges),
                "error": str(e)
            }
    
    @staticmethod
    def analyze_temporal_patterns(time_series_data):
        """Analyze temporal patterns in time series data"""
        if not time_series_data or len(time_series_data) < 3:
            return {"error": "Not enough data points for temporal analysis"}
            
        try:
            # Convert to pandas Series for time series analysis
            dates = [item["period"] for item in time_series_data]
            counts = [item["post_count"] for item in time_series_data]
            ts = pd.Series(counts, index=pd.to_datetime(dates))
            
            # Calculate basic statistics
            stats = {
                "min": float(ts.min()),
                "max": float(ts.max()),
                "mean": float(ts.mean()),
                "median": float(ts.median()),
                "std": float(ts.std())
            }
            
            # Identify peaks (local maxima)
            peaks = []
            for i in range(1, len(ts) - 1):
                if ts.iloc[i] > ts.iloc[i-1] and ts.iloc[i] > ts.iloc[i+1]:
                    peaks.append({
                        "date": ts.index[i].strftime('%Y-%m-%d'),
                        "value": float(ts.iloc[i])
                    })
            
            # Sort peaks by value descending
            peaks.sort(key=lambda x: x["value"], reverse=True)
            
            # Calculate growth rate
            growth_rates = []
            for i in range(1, len(ts)):
                prev_value = ts.iloc[i-1]
                curr_value = ts.iloc[i]
                
                if prev_value > 0:
                    growth_rate = (curr_value - prev_value) / prev_value
                else:
                    growth_rate = 0 if curr_value == 0 else float('inf')
                    
                growth_rates.append({
                    "date": ts.index[i].strftime('%Y-%m-%d'),
                    "growth_rate": float(growth_rate)
                })
            
            # Check for seasonality (if enough data points)
            seasonality = "unknown"
            if len(ts) >= 14:  # Need at least 2 weeks of data
                # Check weekly pattern
                weekly_pattern = ts.groupby(ts.index.dayofweek).mean()
                weekly_std = weekly_pattern.std()
                weekly_mean = weekly_pattern.mean()
                weekly_cv = weekly_std / weekly_mean if weekly_mean > 0 else 0
                
                if weekly_cv > 0.2:  # Coefficient of variation threshold
                    seasonality = "weekly"
                    
            return {
                "statistics": stats,
                "peaks": peaks[:5],  # Return top 5 peaks
                "growth_rates": growth_rates,
                "seasonality": seasonality,
                "trend": "increasing" if ts.iloc[-1] > ts.iloc[0] else "decreasing" if ts.iloc[-1] < ts.iloc[0] else "stable"
            }
        except Exception as e:
            logger.error(f"Error analyzing temporal patterns: {str(e)}")
            return {"error": str(e)}
    
    @classmethod
    def generate_ai_summary(cls, posts, search_params=None):
        """Generate an AI-powered summary of the data"""
        if not posts or len(posts) == 0:
            return "No data available for analysis."
            
        try:
            # Extract basic information
            total_posts = len(posts)
            
            # Extract dates
            dates = [post.get("created_utc") for post in posts if "created_utc" in post]
            date_range = f"from {min(dates)} to {max(dates)}" if dates else ""
            
            # Count subreddits
            subreddits = [post.get("subreddit") for post in posts if "subreddit" in post]
            subreddit_counts = Counter(subreddits)
            top_subreddits = subreddit_counts.most_common(5)
            
            # Analyze sentiment
            sentiment_scores = []
            for post in posts:
                title = post.get("title", "")
                selftext = post.get("selftext", "")
                
                text = title
                if selftext and selftext.strip():
                    text += " " + selftext
                    
                if text and text.strip():
                    sentiment = cls.get_sentiment(text)
                    sentiment_scores.append(sentiment)
            
            # Calculate average sentiment
            avg_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
            sentiment_desc = "positive" if avg_sentiment > 0.05 else "negative" if avg_sentiment < -0.05 else "neutral"
            
            # Generate summary
            summary = f"Analysis of {total_posts} Reddit posts "
            
            if search_params:
                if "keyword" in search_params and search_params["keyword"]:
                    summary += f"containing '{search_params['keyword']}' "
                if "subreddit" in search_params and search_params["subreddit"]:
                    summary += f"in r/{search_params['subreddit']} "
                if "domain" in search_params and search_params["domain"]:
                    summary += f"from {search_params['domain']} "
                    
            summary += date_range + ".\n\n"
            
            if top_subreddits:
                summary += "Top subreddits in these results:\n"
                for sr, count in top_subreddits:
                    percentage = (count / total_posts) * 100
                    summary += f"- r/{sr}: {count} posts ({percentage:.1f}%)\n"
            
            summary += f"\nThe overall sentiment of these posts appears to be {sentiment_desc}.\n"
            
            # Add engagement metrics
            scores = [post.get("score", 0) for post in posts]
            comments = [post.get("num_comments", 0) for post in posts]
            
            avg_score = sum(scores) / len(scores) if scores else 0
            avg_comments = sum(comments) / len(comments) if comments else 0
            
            summary += f"\nEngagement metrics:\n"
            summary += f"- Total score (upvotes minus downvotes): {sum(scores)}\n"
            summary += f"- Total comments: {sum(comments)}\n"
            summary += f"- Average score per post: {avg_score:.1f}\n"
            summary += f"- Average comments per post: {avg_comments:.1f}\n"
            
            # Add observations
            summary += "\nKey observations:\n"
            
            if total_posts > 1000:
                summary += f"- This is a highly discussed topic with {total_posts} posts.\n"
            elif total_posts < 10:
                summary += f"- This appears to be a niche topic with only {total_posts} posts.\n"
                
            if avg_comments > 10:
                summary += f"- Posts on this topic generate significant discussion with an average of {avg_comments:.1f} comments per post.\n"
                
            if avg_score > 50:
                summary += f"- Content on this topic is well-received by the community with an average score of {avg_score:.1f} per post.\n"
                
            return summary
            
        except Exception as e:
            logger.error(f"Error generating AI summary: {str(e)}")
            return f"Error generating summary: {str(e)}"