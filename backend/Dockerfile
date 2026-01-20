# 1. Use Python 3.10
FROM python:3.10-slim

# 2. Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. Set working directory
WORKDIR /app

# 4. Install dependencies with increased timeout
COPY requirements.txt .
# Update pip first to get better networking logic
RUN pip install --upgrade pip
# Set timeout to 1000 seconds (approx 16 mins) to prevent drops on large files
RUN pip install --no-cache-dir --default-timeout=1000 -r requirements.txt

# 5. Copy your source code
COPY . .

# 6. Build the Risk Database inside the image
RUN python ingest_data.py

# 7. Expose the port
EXPOSE 8000

# 8. Start the server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]