#!/bin/bash

# 🚀 Enostics Resend MCP Server Installation Script

set -e

echo "🚀 Installing Enostics Resend MCP Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) is compatible${NC}"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${BLUE}Building the project...${NC}"
npm run build

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}Please edit .env file with your Resend credentials:${NC}"
        echo -e "${YELLOW}  - RESEND_API_KEY${NC}"
        echo -e "${YELLOW}  - RESEND_FROM_EMAIL${NC}"
        echo -e "${YELLOW}  - RESEND_DOMAIN${NC}"
    else
        echo -e "${RED}❌ env.example not found${NC}"
        exit 1
    fi
fi

# Get current directory
CURRENT_DIR=$(pwd)

echo -e "${GREEN}✅ Installation complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "${YELLOW}1. Edit .env file with your Resend credentials${NC}"
echo -e "${YELLOW}2. Add to Cursor MCP config:${NC}"
echo ""
echo -e "${BLUE}Add this to your Cursor MCP settings:${NC}"
echo -e "${GREEN}~/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.cursor-small/settings/cline_mcp_settings.json${NC}"
echo ""
echo -e "${BLUE}Configuration:${NC}"
cat << EOF
{
  "mcpServers": {
    "enostics-resend": {
      "command": "node",
      "args": ["$CURRENT_DIR/dist/index.js"],
      "env": {
        "RESEND_API_KEY": "re_your_api_key_here",
        "RESEND_FROM_EMAIL": "team@enostics.com",
        "RESEND_DOMAIN": "enostics.com"
      }
    }
  }
}
EOF

echo ""
echo -e "${BLUE}🧪 Test the server:${NC}"
echo -e "${GREEN}npm test${NC}"
echo ""
echo -e "${BLUE}🚀 Start development:${NC}"
echo -e "${GREEN}npm run dev${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to send beautiful emails with Enostics!${NC}" 