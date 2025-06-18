# MCP Server for Vercel Deployment Tools

This is a Model Context Protocol (MCP) server that provides tools for managing Vercel deployments. It allows you to connect from Cursor and interact with your Vercel projects directly.

## Features

- **Get Vercel Deployments**: List all deployments for a specific project
- **Get Deployment Logs**: Fetch logs for a specific deployment
- **Get Project Info**: Retrieve detailed information about a Vercel project

## Setup

1. Deploy this to Vercel
2. Set the `VERCEL_TOKEN` environment variable with your Vercel API token
3. Connect to the MCP server from Cursor

## Environment Variables

- `VERCEL_TOKEN`: Your Vercel API token (required)

## API Endpoints

- `GET /sse` - Server-Sent Events endpoint for MCP connection
- `POST /sse` - Tool execution endpoint

## Usage with Cursor

Add this to your `mcp.json` configuration:

```json
{
  "mcpServers": {
    "Vercel MCP": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-app-name.vercel.app/sse"
      ]
    }
  }
}
```

## Development

```bash
npm install
npm run dev
```

## Deployment

Deploy to Vercel:

```bash
npm run build
```

Then deploy via Vercel dashboard or CLI.
