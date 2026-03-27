#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import open from 'open';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const CLIENT_URL = 'http://localhost:30100';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logBanner() {
  console.log();
  log('  ╔════════════════════════════════════════════════════════════╗', 'blue');
  log('  ║                                                            ║', 'blue');
  log('  ║   Metabase Agent API Demo - ghmeta CLI                    ║', 'bright');
  log('  ║                                                            ║', 'blue');
  log('  ╚════════════════════════════════════════════════════════════╝', 'blue');
  console.log();
}

async function runDev() {
  logBanner();

  // Check if .env exists
  const envPath = join(rootDir, '.env');
  if (!existsSync(envPath)) {
    log('⚠️  Warning: .env file not found!', 'yellow');
    log('   Please create a .env file with the following variables:', 'yellow');
    console.log();
    log('   METABASE_INSTANCE_URL=your_metabase_url', 'bright');
    log('   METABASE_API_KEY=api_key', 'bright');
    log('   METABASE_USER_EMAIL=your_user_email', 'bright');
    log('   ANTHROPIC_API_KEY=your_anthropic_api_key', 'bright');
    console.log();
    log('   You can copy .env.example as a template:', 'yellow');
    log('   cp .env.example .env', 'bright');
    console.log();
  }

  // Check if client is built
  const distPath = join(rootDir, 'client/dist');
  if (!existsSync(distPath)) {
    log('⚠️  Warning: Client not built!', 'yellow');
    log('   Please run: npm run build', 'bright');
    console.log();
  }

  log('🚀 Starting server...', 'green');
  log(`   - URL: ${CLIENT_URL}`, 'blue');
  console.log();

  // Start server
  const server = spawn('npx', ['tsx', 'watch', 'server/src/index.ts'], {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  });

  // Open browser after a short delay to let server start
  setTimeout(() => {
    open(CLIENT_URL).catch(() => {});
  }, 2000);

  server.on('close', (code) => {
    console.log();
    if (code === 0 || code === null) {
      log('👋 Server stopped.', 'yellow');
    } else {
      log(`❌ Process exited with code ${code}`, 'red');
    }
    process.exit(code ?? 0);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n👋 Shutting down gracefully...', 'yellow');
    server.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    log('\n👋 Shutting down gracefully...', 'yellow');
    server.kill('SIGTERM');
  });
}

function showHelp() {
  logBanner();
  console.log('Usage: ghmeta [command]');
  console.log();
  console.log('Commands:');
  console.log('  dev       Start development server (default)');
  console.log('  help      Show this help message');
  console.log();
  console.log('Examples:');
  console.log('  ghmeta           # Start development server');
  console.log('  ghmeta dev       # Same as above');
  console.log();
}

async function main() {
  const command = process.argv[2] || 'dev';

  switch (command) {
    case 'dev':
      await runDev();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      log(`❌ Unknown command: ${command}`, 'red');
      console.log();
      showHelp();
      process.exit(1);
  }
}

main().catch((error) => {
  log(`❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
