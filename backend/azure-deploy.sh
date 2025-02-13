#!/bin/bash

# Deployment Diagnostics Script
echo "Starting Azure Deployment Diagnostics"

# Check Node.js and npm versions
node --version
npm --version

# Install dependencies
npm ci --only=production

# List installed packages
npm list --depth=0

# Build application
npm run build

# Check application size
du -sh .

# Start the server for testing
npm start &
SERVER_PID=$!

# Wait a moment
sleep 5

# Check server status
if kill -0 $SERVER_PID; then
    echo "Server started successfully"
    kill $SERVER_PID
else
    echo "Server failed to start"
    exit 1
fi