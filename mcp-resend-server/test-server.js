#!/usr/bin/env node

// 🧪 Test script for Enostics Resend MCP Server

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing Enostics Resend MCP Server...\n');

// Test data
const testEndpointNotification = {
  userEmail: 'test@example.com',
  username: 'testuser',
  endpointName: 'Test Endpoint',
  actionType: 'success',
  actionDetails: 'This is a test notification from the MCP server',
  payload: {
    message: 'Hello from test!',
    timestamp: new Date().toISOString(),
    testData: true
  },
  timestamp: new Date().toISOString(),
  sourceIp: '127.0.0.1'
};

const testWelcomeEmail = {
  userEmail: 'newuser@example.com',
  username: 'newuser',
  endpointUrl: 'https://api.enostics.com/v1/newuser'
};

const testSummaryEmail = {
  userEmail: 'user@example.com',
  username: 'testuser',
  period: 'weekly',
  stats: {
    totalRequests: 150,
    successfulRequests: 142,
    failedRequests: 8,
    topSources: ['Test App', 'Mobile Device', 'Webhook'],
    dataVolume: '2.1 MB'
  }
};

// Test functions
async function testMCPServer() {
  console.log('📡 Starting MCP server test...');
  
  const serverPath = join(__dirname, 'dist', 'index.js');
  
  // Test 1: List tools
  console.log('\n1️⃣ Testing tool listing...');
  await testCommand({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  });

  // Test 2: Send endpoint notification
  console.log('\n2️⃣ Testing endpoint notification...');
  await testCommand({
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'send_endpoint_notification',
      arguments: testEndpointNotification
    }
  });

  // Test 3: Send welcome email
  console.log('\n3️⃣ Testing welcome email...');
  await testCommand({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'send_welcome_email',
      arguments: testWelcomeEmail
    }
  });

  // Test 4: Send summary email
  console.log('\n4️⃣ Testing summary email...');
  await testCommand({
    jsonrpc: '2.0',
    id: 4,
    method: 'tools/call',
    params: {
      name: 'send_endpoint_summary',
      arguments: testSummaryEmail
    }
  });

  // Test 5: List recent emails
  console.log('\n5️⃣ Testing email list...');
  await testCommand({
    jsonrpc: '2.0',
    id: 5,
    method: 'tools/call',
    params: {
      name: 'list_recent_emails',
      arguments: { limit: 5 }
    }
  });

  console.log('\n✅ All tests completed!');
}

function testCommand(command) {
  return new Promise((resolve, reject) => {
    const serverPath = join(__dirname, 'dist', 'index.js');
    const child = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(output);
          console.log(`   ✅ Success:`, response.result || response);
          resolve(response);
        } catch (e) {
          console.log(`   ⚠️  Raw output:`, output);
          resolve(output);
        }
      } else {
        console.log(`   ❌ Error (code ${code}):`, errorOutput);
        reject(new Error(errorOutput));
      }
    });

    child.stdin.write(JSON.stringify(command) + '\n');
    child.stdin.end();

    // Timeout after 10 seconds
    setTimeout(() => {
      child.kill();
      reject(new Error('Test timeout'));
    }, 10000);
  });
}

// Environment check
function checkEnvironment() {
  console.log('🔍 Checking environment...');
  
  const requiredVars = [
    'RESEND_API_KEY',
    'RESEND_FROM_EMAIL',
    'RESEND_DOMAIN'
  ];

  const missing = requiredVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(v => console.log(`   - ${v}`));
    console.log('\n💡 Please create a .env file with your Resend credentials');
    console.log('   See env.example for reference');
    return false;
  }

  console.log('✅ Environment variables configured');
  requiredVars.forEach(v => {
    const value = process.env[v];
    const display = v === 'RESEND_API_KEY' 
      ? `${value.substring(0, 8)}...` 
      : value;
    console.log(`   ${v}: ${display}`);
  });
  
  return true;
}

// Build check
function checkBuild() {
  console.log('\n🔨 Checking build...');
  
  try {
    const serverPath = join(__dirname, 'dist', 'index.js');
    require('fs').accessSync(serverPath);
    console.log('✅ Build files found');
    return true;
  } catch (e) {
    console.log('❌ Build files not found');
    console.log('💡 Run: npm run build');
    return false;
  }
}

// Main test runner
async function main() {
  console.log('🚀 Enostics Resend MCP Server Test Suite\n');
  
  // Check environment
  if (!checkEnvironment()) {
    process.exit(1);
  }
  
  // Check build
  if (!checkBuild()) {
    process.exit(1);
  }
  
  // Run tests
  try {
    await testMCPServer();
    console.log('\n🎉 All tests passed! Your MCP server is ready to use.');
    console.log('\n📋 Next steps:');
    console.log('   1. Add server to Cursor MCP config');
    console.log('   2. Restart Cursor');
    console.log('   3. Use MCP tools in your Enostics development');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file');
    console.log('   2. Verify Resend API key is valid');
    console.log('   3. Ensure domain is verified in Resend');
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n👋 Test interrupted');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception:', error.message);
  process.exit(1);
});

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 