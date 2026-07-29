/**
 * Standalone Node.js Proxy & Keep-Alive Agent for Render Backend
 * 
 * Usage:
 *   node keepAliveProxy.js
 * Or with custom URL / Port:
 *   TARGET_URL=https://nexus-server.onrender.com PORT=5001 node keepAliveProxy.js
 */

require('dotenv').config();
const http = require('http');
const https = require('https');

const TARGET_URL = process.env.RENDER_EXTERNAL_URL || process.env.TARGET_URL || 'http://localhost:5000';
const PROXY_PORT = process.env.PROXY_PORT || 5001;
const PING_INTERVAL_MS = (parseInt(process.env.PING_INTERVAL_MINUTES) || 10) * 60 * 1000;

let healthUrl = TARGET_URL.replace(/\/+$/, '');
if (!healthUrl.endsWith('/api/health')) {
  healthUrl += '/api/health';
}

const httpClient = healthUrl.startsWith('https') ? https : http;

function sendKeepAlivePing() {
  console.log(`[Proxy KeepAlive] Sending ping to ${healthUrl}...`);
  const req = httpClient.get(healthUrl, (res) => {
    let body = '';
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => {
      console.log(`[Proxy KeepAlive] Received response: HTTP ${res.statusCode} at ${new Date().toISOString()}`);
    });
  });

  req.on('error', (err) => {
    console.error(`[Proxy KeepAlive] Error pinging target (${healthUrl}):`, err.message);
  });
}

// Simple Proxy HTTP Server that routes requests to TARGET_URL and maintains target warm status
const server = http.createServer((req, res) => {
  if (req.url === '/ping' || req.url === '/health') {
    sendKeepAlivePing();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ping triggered', target: healthUrl }));
  }

  // Forward request to TARGET_URL
  try {
    const targetUrlObj = new URL(req.url, TARGET_URL);
    const options = {
      hostname: targetUrlObj.hostname,
      port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
      path: targetUrlObj.pathname + targetUrlObj.search,
      method: req.method,
      headers: { ...req.headers, host: targetUrlObj.host }
    };

    const proxyReq = (targetUrlObj.protocol === 'https:' ? https : http).request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[Proxy Request Error]', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Bad Gateway', details: err.message }));
    });

    req.pipe(proxyReq, { end: true });
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid Proxy Request', details: err.message }));
  }
});

server.listen(PROXY_PORT, () => {
  console.log(`[Proxy Server] Running on port ${PROXY_PORT}`);
  console.log(`[Proxy Server] Target Render URL: ${TARGET_URL}`);
  console.log(`[Proxy Server] Keep-alive interval set to ${PING_INTERVAL_MS / 60000} minutes`);
  
  // Trigger immediate initial ping
  sendKeepAlivePing();

  // Set up periodic ping interval
  setInterval(sendKeepAlivePing, PING_INTERVAL_MS);
});
