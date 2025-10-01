#!/bin/bash

# Tiger Frontend Setup Script
echo "🐅 Setting up Tiger Frontend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating environment file..."
    cp .env.local.example .env.local
    echo "✅ Environment file created. Please edit .env.local with your configuration."
else
    echo "✅ Environment file already exists"
fi

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "⚠️  Type checking found some issues. Please review and fix them."
else
    echo "✅ Type checking passed"
fi

# Run linting
echo "🔍 Running linting..."
npm run lint

if [ $? -ne 0 ]; then
    echo "⚠️  Linting found some issues. You can run 'npm run lint:fix' to fix them automatically."
else
    echo "✅ Linting passed"
fi

# Run tests
echo "🧪 Running tests..."
npm run test

if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed. Please review and fix them."
else
    echo "✅ All tests passed"
fi

# Build the project
echo "🏗️  Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build successful"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your configuration"
echo "2. Start the development server: npm run dev"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run start        - Start production server"
echo "  npm run test         - Run tests"
echo "  npm run lint         - Run linting"
echo "  npm run type-check   - Run type checking"
echo ""
echo "Happy coding! 🚀"

