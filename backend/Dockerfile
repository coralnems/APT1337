FROM python:3.9

WORKDIR /app

# Install Redis client
RUN apt-get update && apt-get install -y redis-tools

COPY requirements.txt .
RUN pip install -r requirements.txt

# Add Node.js repository and install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs

# Copy package.json files
COPY package*.json ./
RUN npm install

COPY . .

# Make the entrypoint script executable
RUN chmod +x entrypoint.sh

# Set environment variables for Redis connection
ENV REDIS_URL=redis://redis:6379
ENV REDIS_HOST=redis
ENV REDIS_PORT=6379

CMD ["./entrypoint.sh", "python", "app.py"]