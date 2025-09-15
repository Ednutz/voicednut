#!/bin/bash

# Install dependencies
echo "Installing dependencies..."
npm install

# Run linting checks
echo "Running lint checks..."
npm run lint

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod