#!/bin/bash
set -e

# Generate JWT secret if it doesn't exist
if [ -z "$JWT_SECRET" ]; then
  echo "Generating JWT_SECRET..."
  export JWT_SECRET=$(openssl rand -hex 32)
  echo "JWT_SECRET=$JWT_SECRET"
fi

# Generate SESSION_SECRET if it doesn't exist
if [ -z "$SESSION_SECRET" ]; then
  echo "Generating SESSION_SECRET..."
  export SESSION_SECRET=$(openssl rand -hex 32)
  echo "SESSION_SECRET=$SESSION_SECRET"
fi

# Use postgres-specific tools instead of netcat
echo "Checking PostgreSQL connection..."
until pg_isready -h postgres -U dentist_user; do
  echo "Waiting for postgres..."
  sleep 1
done
echo "PostgreSQL is ready."

# Use redis-cli with more robust checking
echo "Checking Redis connection..."
until redis-cli -h ${REDIS_HOST:-redis} -p ${REDIS_PORT:-6379} ping | grep -q PONG; do
  echo "Waiting for redis at ${REDIS_HOST:-redis}:${REDIS_PORT:-6379}..."
  sleep 1
done
echo "Redis is ready."

# Log the environment for debugging
echo "Environment variables:"
echo "NODE_ENV: ${NODE_ENV:-development}"
echo "REDIS_HOST: ${REDIS_HOST:-redis}"
echo "REDIS_PORT: ${REDIS_PORT:-6379}"
echo "REDIS_URL: ${REDIS_URL:-redis://redis:6379}"

# Start the app
echo "Starting application..."
exec "$@"