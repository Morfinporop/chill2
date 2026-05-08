#!/bin/bash

echo "🚀 ChillGram Deployment Script"
echo "================================"

echo ""
echo "📦 Step 1: Installing dependencies..."
npm install

echo ""
echo "🔨 Step 2: Building frontend..."
npm run build

echo ""
echo "✅ Step 3: Build complete!"
echo ""
echo "📁 Files ready:"
ls -lh dist/index.html

echo ""
echo "🎯 Next steps:"
echo "1. git add ."
echo "2. git commit -m 'deploy to railway'"
echo "3. git push origin main"
echo ""
echo "Railway will auto-deploy! 🚀"
