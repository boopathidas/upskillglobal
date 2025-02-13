#!/bin/bash

# Comprehensive Deployment Script
set -e

echo "🚀 Starting Backend Deployment"

# Validate Environment
if [ -z "$MONGO_URI" ]; then
    echo "❌ MONGO_URI is not set"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET is not set"
    exit 1
fi

# Prepare Dependencies
npm ci --only=production

# Run Validation
npm run validate-env

# Build Preparation
npm run build

# Start Server
npm start