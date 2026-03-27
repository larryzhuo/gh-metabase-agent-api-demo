# Metabase Agent CLI

A CLI tool that provides a chat interface for the Metabase Agent API. Ask natural language questions about your data and get answers powered by AI.

## Features

- 🗣️ **Natural Language Queries** - Ask questions in plain English, get answers from your data
- 🤖 **Multi-Provider AI Support** - Choose between Anthropic Claude or Zhipu GLM models
- ⚙️ **Web-Based Configuration** - Configure API keys through the Settings page, no manual file editing
- 🚀 **Quick Start** - One command to launch everything

## Prerequisites

- Metabase v59+ (Enterprise) with the `agent-api` feature flag
- Metabase API Key (generate from Admin Settings > Developer Settings)
- Anthropic API key OR Zhipu AI API key
- Node.js 18+

## Installation

### Option 1: Using npm CLI (Recommended)

Install globally and run with a single command:

```sh
npm install -g ghmeta
ghmeta
```

The CLI will automatically install dependencies on first run.

### Option 2: Manual setup

```sh
git clone https://github.com/metabase/metabase-agent-api-demo.git
cd metabase-agent-api-demo
npm install
npm run build
npm start
```

## Getting Your Metabase API Key

1. Go to **Admin Settings** > **Developer Settings**
2. Click **"Create API key"**
3. Copy the generated API key (starts with `mb_`)

## Configuration

When you first run `ghmeta`, open http://localhost:30100/config in your browser and configure:

| Setting | Description | Required |
|---------|-------------|----------|
| **Metabase Instance URL** | Your Metabase URL (e.g., `https://your-metabase.com`) | Yes |
| **Metabase API Key** | Your Metabase API key (starts with `mb_`) | Yes |
| **Anthropic API Key** | Your Anthropic API key (starts with `sk-ant-`) | At least one |
| **Zhipu API Key** | Your Zhipu AI API key | At least one |
| **Default Model** | AI model to use (e.g., `claude-sonnet-4-20250514`, `glm-4.7`) | No |

### Supported AI Models

**Anthropic Claude:**
- `claude-sonnet-4-20250514` - Claude Sonnet 4 (default)
- `claude-opus-4-20250514` - Claude Opus 4
- `claude-haiku-4-20250514` - Claude Haiku 4

**Zhipu AI:**
- `glm-4.7` - GLM-4.7
- `glm-4-plus` - GLM-4 Plus

## Usage

### CLI Commands

```sh
# Start the server (opens browser automatically)
ghmeta

# Show help
ghmeta help
```

### Web Interface

- **Chat Page**: http://localhost:30100/ - Ask questions about your data
- **Settings Page**: http://localhost:30100/config - Configure API keys

### Example Queries

```
Show me the top 10 products by revenue
What's the average order value by month?
Count users by country
```

## Development

```sh
# Install dependencies
npm install

# Build client
npm run build

# Start server
npm start

# Or run the CLI directly
node bin/ghmeta.js
```

## Environment Variables

You can also configure using a `.env` file (create from `.env.example`):

```env
METABASE_INSTANCE_URL=http://localhost:3000
METABASE_API_KEY=mb_your_api_key_here
ANTHROPIC_API_KEY=sk-ant-your_key_here
ZHIPU_API_KEY=your_zhipu_key_here
selectedModel=claude-sonnet-4-20250514
SERVER_PORT=30100
```

## Project Structure

```
├── bin/
│   └── ghmeta.js        # CLI entry point
├── client/              # React frontend
│   ├── src/
│   │   ├── App.tsx      # Main chat interface
│   │   └── ConfigPage.tsx  # Settings page
│   └── dist/            # Built assets
└── server/              # Express backend
    └── src/
        ├── index.ts      # Server with API endpoints
        ├── config.ts     # Configuration management
        ├── metabase.ts  # Metabase API client
        └── tools.ts     # Agent tool definitions
```

## License

MIT
