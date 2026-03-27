# Metabase Agent API Demo

A sample chat app for the Metabase Agent API. Ask natural language questions about your data and get answers powered by Claude.

## Prerequisites

- Metabase v59+ (Enterprise) with the `agent-api` feature flag
- Anthropic API key
- Node.js 18+

## Metabase setup

**Enable JWT authentication**: Admin Settings > Authentication > JWT. Click "Generate key" and copy the secret.

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
npm run install:all
npm run dev
```

## Configuration

Create a `.env` file in the project directory (or copy from `.env.example`):

```sh
cp .env.example .env
```

Fill in your `.env`:

| Variable | Description |
|----------|-------------|
| `METABASE_INSTANCE_URL` | Your Metabase URL (no trailing slash) |
| `METABASE_JWT_SHARED_SECRET` | JWT signing key from admin settings |
| `METABASE_USER_EMAIL` | Email of an existing Metabase user |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

## Usage

### CLI Commands

```sh
# Start development servers (auto-installs dependencies if needed)
ghmeta

# Same as above
ghmeta dev

# Install dependencies only
ghmeta install

# Show help
ghmeta help
```

### Access

- **Client**: [http://localhost:3100](http://localhost:3100)
- **Server**: [http://localhost:3000](http://localhost:3000)

## Publishing to npm

To publish a new version:

```sh
npm version patch  # or minor, or major
npm publish
```

## Reporting issues

For bugs and feature requests, please [open an issue](https://github.com/metabase/metabase-agent-api-demo/issues). For security issues, please see our [Security Policy](https://github.com/metabase/metabase/security/policy).

## License

This project is licensed under the [MIT License](./LICENSE).
