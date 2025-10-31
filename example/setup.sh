#!/bin/bash

# Setup script for the example application
# This script removes duplicate NestJS packages to avoid DI conflicts

echo "🔧 Setting up example application..."

# Remove duplicate @nestjs packages from example/node_modules
echo "📦 Removing duplicate NestJS packages..."
rm -rf node_modules/@nestjs/core
rm -rf node_modules/@nestjs/common

echo "✅ Setup complete!"
echo ""
echo "The example will now use NestJS packages from the parent node_modules directory."
echo "This avoids duplicate dependency issues with NestJS DI."
echo ""
echo "You can now run:"
echo "  npm start       - Start the application"
echo "  npm run start:dev - Start in development mode"

