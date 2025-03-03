"""Vector store for storing and retrieving embeddings for chat functionality."""

import logging
import sqlite3
import json
from typing import Dict, List, Any, Optional, Tuple
import numpy as np

# Setup logging
logger = logging.getLogger(__name__)

class VectorStore:
    """Vector store for storing and retrieving embeddings."""
    
    def __init__(self, db_connection=None):
        """Initialize the vector store.
        
        Args:
            db_connection: SQLite database connection
        """
        self.db_connection = db_connection
        self._ensure_tables_exist()
    
    def _ensure_tables_exist(self):
        """Ensure that the necessary tables exist in the database."""
        if not self.db_connection:
            logger.warning("No database connection provided to VectorStore")
            return
            
        try:
            # Create embeddings table if it doesn't exist
            self.db_connection.execute("""
                CREATE TABLE IF NOT EXISTS chat_embeddings (
                    id INTEGER PRIMARY KEY,
                    text TEXT NOT NULL,
                    embedding BLOB NOT NULL,
                    metadata TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create index on id
            self.db_connection.execute("""
                CREATE INDEX IF NOT EXISTS idx_chat_embeddings_id ON chat_embeddings(id)
            """)
            
            self.db_connection.commit()
            logger.info("Vector store tables initialized")
            
        except Exception as e:
            logger.error(f"Error initializing vector store tables: {str(e)}")
    
    def add_embedding(self, text: str, embedding: List[float], metadata: Optional[Dict[str, Any]] = None) -> int:
        """Add an embedding to the vector store.
        
        Args:
            text: The text that was embedded
            embedding: The embedding vector
            metadata: Optional metadata about the embedding
            
        Returns:
            ID of the inserted embedding
        """
        if not self.db_connection:
            logger.warning("No database connection provided to VectorStore")
            return -1
            
        try:
            # Convert embedding to bytes
            embedding_bytes = self._vector_to_bytes(embedding)
            
            # Convert metadata to JSON string
            metadata_json = json.dumps(metadata) if metadata else None
            
            # Insert into database
            cursor = self.db_connection.execute(
                "INSERT INTO chat_embeddings (text, embedding, metadata) VALUES (?, ?, ?)",
                (text, embedding_bytes, metadata_json)
            )
            
            self.db_connection.commit()
            return cursor.lastrowid
            
        except Exception as e:
            logger.error(f"Error adding embedding: {str(e)}")
            return -1
    
    def search_similar(self, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar embeddings in the vector store.
        
        Args:
            query_embedding: The embedding vector to search for
            limit: Maximum number of results to return
            
        Returns:
            List of dictionaries containing the similar embeddings and their metadata
        """
        if not self.db_connection:
            logger.warning("No database connection provided to VectorStore")
            return []
            
        try:
            # Get all embeddings
            cursor = self.db_connection.execute("SELECT id, text, embedding, metadata FROM chat_embeddings")
            results = cursor.fetchall()
            
            if not results:
                return []
                
            # Calculate similarities
            similarities = []
            for row in results:
                id, text, embedding_bytes, metadata_json = row
                embedding = self._bytes_to_vector(embedding_bytes)
                similarity = self._cosine_similarity(query_embedding, embedding)
                metadata = json.loads(metadata_json) if metadata_json else {}
                
                similarities.append({
                    "id": id,
                    "text": text,
                    "similarity": similarity,
                    "metadata": metadata
                })
            
            # Sort by similarity (highest first)
            similarities.sort(key=lambda x: x["similarity"], reverse=True)
            
            # Return top results
            return similarities[:limit]
            
        except Exception as e:
            logger.error(f"Error searching similar embeddings: {str(e)}")
            return []
    
    def get_embedding_by_id(self, embedding_id: int) -> Optional[Dict[str, Any]]:
        """Get an embedding by its ID.
        
        Args:
            embedding_id: ID of the embedding to retrieve
            
        Returns:
            Dictionary containing the embedding and its metadata, or None if not found
        """
        if not self.db_connection:
            logger.warning("No database connection provided to VectorStore")
            return None
            
        try:
            cursor = self.db_connection.execute(
                "SELECT id, text, embedding, metadata FROM chat_embeddings WHERE id = ?",
                (embedding_id,)
            )
            
            result = cursor.fetchone()
            if not result:
                return None
                
            id, text, embedding_bytes, metadata_json = result
            embedding = self._bytes_to_vector(embedding_bytes)
            metadata = json.loads(metadata_json) if metadata_json else {}
            
            return {
                "id": id,
                "text": text,
                "embedding": embedding,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Error getting embedding by ID: {str(e)}")
            return None
    
    def delete_embedding(self, embedding_id: int) -> bool:
        """Delete an embedding from the vector store.
        
        Args:
            embedding_id: ID of the embedding to delete
            
        Returns:
            True if successful, False otherwise
        """
        if not self.db_connection:
            logger.warning("No database connection provided to VectorStore")
            return False
            
        try:
            self.db_connection.execute(
                "DELETE FROM chat_embeddings WHERE id = ?",
                (embedding_id,)
            )
            
            self.db_connection.commit()
            return True
            
        except Exception as e:
            logger.error(f"Error deleting embedding: {str(e)}")
            return False
    
    def _vector_to_bytes(self, vector: List[float]) -> bytes:
        """Convert a vector to bytes for storage.
        
        Args:
            vector: The embedding vector
            
        Returns:
            Bytes representation of the vector
        """
        return np.array(vector, dtype=np.float32).tobytes()
    
    def _bytes_to_vector(self, bytes_data: bytes) -> List[float]:
        """Convert bytes back to a vector.
        
        Args:
            bytes_data: Bytes representation of the vector
            
        Returns:
            The embedding vector
        """
        return np.frombuffer(bytes_data, dtype=np.float32).tolist()
    
    def _cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors.
        
        Args:
            vec1: First vector
            vec2: Second vector
            
        Returns:
            Cosine similarity score
        """
        # Convert to numpy arrays
        a = np.array(vec1)
        b = np.array(vec2)
        
        # Calculate cosine similarity
        dot_product = np.dot(a, b)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        
        # Avoid division by zero
        if norm_a == 0 or norm_b == 0:
            return 0.0
            
        return dot_product / (norm_a * norm_b)
    
    def get_all_embeddings(self) -> List[Dict[str, Any]]:
        """Get all embeddings from the vector store.
        
        Returns:
            List of dictionaries containing all embeddings and their metadata
        """
        if not self.db_connection:
            logger.warning("No database connection provided to VectorStore")
            return []
            
        try:
            cursor = self.db_connection.execute(
                "SELECT id, text, metadata FROM chat_embeddings ORDER BY id"
            )
            
            results = cursor.fetchall()
            embeddings = []
            
            for row in results:
                id, text, metadata_json = row
                metadata = json.loads(metadata_json) if metadata_json else {}
                
                embeddings.append({
                    "id": id,
                    "text": text,
                    "metadata": metadata
                })
                
            return embeddings
            
        except Exception as e:
            logger.error(f"Error getting all embeddings: {str(e)}")
            return [] 