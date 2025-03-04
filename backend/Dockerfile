FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Rust for tokenizers
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Copy requirements first for better caching
COPY requirements.txt .

RUN pip install --upgrade pip
RUN pip install setuptools wheel

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install tokenizers
RUN pip install duckdb transformers
RUN pip install google-generativeai

# Create data directory and copy data file
RUN mkdir -p /app/data
COPY data/data.jsonl /app/data/

# Copy the rest of the application
COPY . .

# Download NLTK data
RUN python -m nltk.downloader punkt averaged_perceptron_tagger wordnet stopwords

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"] 