#!/bin/bash

# Installation script for Prisma dependencies
echo "🔧 Installing Prisma dependencies..."

# Install main dependencies
echo "📦 Installing runtime dependencies..."
yarn add prisma @prisma/client bcryptjs

# Install dev dependencies
echo "🛠️ Installing development dependencies..."
yarn add -D @types/bcryptjs tsx

echo "✅ Dependencies installed successfully!"
echo ""
echo "🚀 Next steps:"
echo "1. Copy .env.example to .env.local and add your DATABASE_URL"
echo "2. Run: npm run db:generate"
echo "3. Run: npm run db:migrate"
echo "4. Run: npm run db:seed"
echo ""
echo "📚 See README.md for detailed setup instructions"
