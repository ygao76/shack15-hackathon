#!/bin/bash

echo "🚀 Setting up Interview Code Challenge Platform..."

# Check if nvm is installed
if ! command -v nvm &> /dev/null; then
    echo "📦 Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

# Install and use Node.js 18
echo "📦 Installing Node.js 18..."
nvm install 18
nvm use 18

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "✅ Setup complete! Run 'npm run dev' to start the development server."
echo "🌐 The app will be available at http://localhost:3000"
