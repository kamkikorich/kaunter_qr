// Local development server with API support
// Usage: node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;

// Load environment variables from .env file
require('dotenv').config();

// API handlers
const submitHandler = require('./api/submit');
const dataHandler = require('./api/data');
const analyzeHandler = require('./api/analyze');
const configHandler = require('./api/config');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/submit') {
    return await handleAPI(req, res, submitHandler);
  }
  if (pathname === '/api/data') {
    return await handleAPI(req, res, dataHandler);
  }
  if (pathname === '/api/analyze') {
    return await handleAPI(req, res, analyzeHandler);
  }
  if (pathname === '/api/config') {
    return await handleAPI(req, res, configHandler);
  }

  // Static Files
  let filePath = pathname === '/' ? '/index.html' : pathname;
  filePath = path.join(__dirname, filePath);

  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
  };

  const contentType = contentTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

// Helper to handle API requests
async function handleAPI(req, res, handler) {
  // Mock Vercel request/response
  const chunks = [];
  
  req.on('data', chunk => chunks.push(chunk));
  req.on('end', async () => {
    const body = Buffer.concat(chunks).toString();
    if (body) {
      try {
        req.body = JSON.parse(body);
      } catch {
        req.body = {};
      }
    }

    // Mock query for GET requests
    const parsedUrl = url.parse(req.url, true);
    req.query = parsedUrl.query;

    // Mock Vercel/Express-style res.status() and res.json()
    let statusCode = 200;
    res.status = (code) => {
      statusCode = code;
      return res;
    };
    res.json = (data) => {
      res.writeHead(statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   http://localhost:${PORT}/          - Frontend (Customer Form)`);
  console.log(`   http://localhost:${PORT}/api/submit - POST feedback to Google Sheets`);
  console.log(`   http://localhost:${PORT}/api/data   - GET all feedback data`);
  console.log(`   http://localhost:${PORT}/api/analyze - POST DeepSeek AI analysis`);
  console.log(`\n⚙️  Press Ctrl+C to stop\n`);
});
