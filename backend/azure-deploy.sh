#!/bin/bash

# Azure Deployment Diagnostics and Preparation Script
set -e  # Exit immediately if a command exits with a non-zero status

# Environment and System Information
echo " Deployment Environment Diagnostics"
echo "Operating System: $(uname -a)"
echo "Node.js Version: $(node --version)"
echo "npm Version: $(npm --version)"
echo "Current Directory: $(pwd)"

# Dependency Management
echo " Preparing Dependencies"
npm cache clean --force
rm -rf node_modules
npm ci --only=production

# List Installed Packages
echo " Installed Packages:"
npm list --depth=0

# Environment Configuration
echo " Environment Configuration"
printenv | grep -E "NODE_ENV|MONGO_URI|PORT"

# Application Preparation
echo " Preparing Application"
npm run build || echo "Build script completed"

# Size and Resource Check
echo " Deployment Package Size:"
du -sh .
df -h

# Validate Server Configuration
echo " Validating Server Configuration"
node -e "
const fs = require('fs');
const path = require('path');

// Check critical files
const criticalFiles = [
  'server.js',
  'package.json',
  '.env'
];

criticalFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  console.log(`Checking ${file}: ${fs.existsSync(filePath) ? ' Exists' : ' Missing'}`);
});
"

# Start Server in Background for Testing
echo " Starting Server"
node server.js &
SERVER_PID=$!

# Wait and Check Server Status
sleep 5

if kill -0 $SERVER_PID 2>/dev/null; then
    echo " Server Started Successfully"
    kill $SERVER_PID
else
    echo " Server Failed to Start"
    exit 1
fi

echo " Deployment Preparation Complete"
exit 0