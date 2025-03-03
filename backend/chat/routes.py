"""API routes for the chat functionality."""

import logging
import json
from flask import Blueprint, request, jsonify
from typing import Dict, Any, Optional

from .chat_engine import ChatEngine
from .query_engine import QueryEngine
from .vector_store import VectorStore

# Setup logging
logger = logging.getLogger(__name__)

# Create Blueprint
chat_bp = Blueprint('chat', __name__, url_prefix='/api/chat')

# Global instances
chat_engine = None
query_engine = None
vector_store = None

def init_chat_module(app, db_connection, gemini_model=None):
    """Initialize the chat module with the Flask app and database connection.
    
    Args:
        app: Flask application instance
        db_connection: Database connection
        gemini_model: Gemini generative model instance
    """
    global chat_engine, query_engine, vector_store
    
    # Initialize vector store
    vector_store = VectorStore(db_connection)
    
    # Initialize query engine
    query_engine = QueryEngine(db_connection, vector_store)
    
    # Initialize chat engine with Gemini model if available
    chat_engine = ChatEngine(db_connection, gemini_model)
    
    # Register blueprint
    app.register_blueprint(chat_bp)
    
    logger.info(f"Chat module initialized with Gemini model: {gemini_model is not None}")

@chat_bp.route('/message', methods=['POST'])
def process_message():
    """Process a chat message and return a response.
    
    Request JSON:
    {
        "message": "User's message",
        "conversation_id": "optional-conversation-id"
    }
    
    Returns:
        JSON response with the AI's reply
    """
    try:
        data = request.json
        
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
            
        message = data.get('message', '').strip()
        conversation_id = data.get('conversation_id')
        
        if not message:
            return jsonify({"error": "Message cannot be empty"}), 400
            
        # Process the message
        if chat_engine:
            result = chat_engine.process_query(message)
            
            return jsonify({
                "response": result.get("response", "I'm sorry, I couldn't process your request."),
                "conversation_id": conversation_id,
                "source": result.get("source", "unknown"),
                "confidence": result.get("confidence", 0.0),
                "data": result.get("data")
            })
        else:
            return jsonify({"error": "Chat engine not initialized"}), 500
            
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return jsonify({"error": "An error occurred while processing your message"}), 500

@chat_bp.route('/query', methods=['POST'])
def process_query():
    """Process a data query and return structured results.
    
    Request JSON:
    {
        "query": "User's query about Reddit data"
    }
    
    Returns:
        JSON response with structured data results
    """
    try:
        data = request.json
        
        if not data or 'query' not in data:
            return jsonify({"error": "Query is required"}), 400
            
        query = data.get('query', '').strip()
        
        if not query:
            return jsonify({"error": "Query cannot be empty"}), 400
            
        # Process the query
        if query_engine:
            result = query_engine.process_query(query)
            
            return jsonify({
                "query": result.get("query", query),
                "intent": result.get("intent", "general"),
                "entities": result.get("entities", {}),
                "results": result.get("db_results", {}),
                "semantic_results": result.get("semantic_results", [])
            })
        else:
            return jsonify({"error": "Query engine not initialized"}), 500
            
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        return jsonify({"error": "An error occurred while processing your query"}), 500

@chat_bp.route('/history', methods=['GET'])
def get_history():
    """Get chat history for a conversation.
    
    Query parameters:
    - conversation_id: ID of the conversation
    
    Returns:
        JSON response with the conversation history
    """
    try:
        conversation_id = request.args.get('conversation_id')
        
        if not conversation_id:
            return jsonify({"error": "Conversation ID is required"}), 400
            
        # This is a placeholder - in a real implementation, you would:
        # 1. Retrieve the conversation history from a database
        # 2. Return it in a structured format
        
        # For now, return a mock response
        return jsonify({
            "conversation_id": conversation_id,
            "messages": [
                {
                    "role": "user",
                    "content": "Hello, I'd like to know about Reddit trends.",
                    "timestamp": "2023-06-01T12:00:00Z"
                },
                {
                    "role": "assistant",
                    "content": "I can help with that! Our data shows increased posting activity in February 2025, with the most active day being February 14 (633 posts). Political content tends to generate the highest engagement. What specific trends are you interested in?",
                    "timestamp": "2023-06-01T12:00:05Z"
                }
            ]
        })
            
    except Exception as e:
        logger.error(f"Error retrieving chat history: {str(e)}")
        return jsonify({"error": "An error occurred while retrieving chat history"}), 500

@chat_bp.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test the Gemini integration and return diagnostic information.
    
    Returns:
        JSON response with test results
    """
    try:
        if not chat_engine:
            return jsonify({"error": "Chat engine not initialized"}), 500
            
        results = chat_engine.test_gemini_integration()
        return jsonify(results)
            
    except Exception as e:
        logger.error(f"Error testing Gemini integration: {str(e)}")
        return jsonify({"error": str(e)}), 500