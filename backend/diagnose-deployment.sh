#!/bin/bash

# Comprehensive Deployment Diagnostics Script
set -e

echo "🔍 Azure Web App Deployment Diagnostics"

# System Information
echo "📋 System Details:"
echo "OS: $(uname -a)"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "Current Directory: $(pwd)"

# Dependency Check
echo "📦 Dependency Analysis:"
npm ls --depth=0
npm audit --audit-level=high

# Environment Validation
echo "🌐 Environment Configuration:"
printenv | grep -E "NODE_ENV|PORT|WEBSITE_"

# File Structure Check
echo "📂 Project Structure:"
find . -maxdepth 2 -type f | grep -E "package.json|server.js|web.config"

# Dependency Installation
npm ci --only=production

# Build Verification
npm run build || echo "Build script may have issues"

# Configuration Validation
node -e "
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'package.json',
  'server.js',
  'web.config'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  console.log(`Checking ${file}: ${fs.existsSync(filePath) ? '✅ Exists' : '❌ Missing'}`);
});
"

# Server Startup Test
node server.js &
SERVER_PID=$!

sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    echo "🚀 Server Started Successfully"
    kill $SERVER_PID
else
    echo "❌ Server Startup Failed"
    exit 1
fi

echo "✨ Deployment Diagnostics Complete"
exit 0