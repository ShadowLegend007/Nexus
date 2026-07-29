const https = require('https');
const http = require('http');

/**
 * Starts periodic keep-alive pings to prevent Render free instance from sleeping.
 * Render puts free web services to sleep after 15 minutes of inactivity.
 * Pinging every 10 minutes keeps the instance active.
 * 
 * @param {string} targetUrl - The base URL of the service (e.g. https://nexus-server.onrender.com)
 * @param {number} intervalMs - Ping interval in milliseconds (default 10 minutes)
 */
function startKeepAlive(targetUrl, intervalMs = 10 * 60 * 1000) {
  if (!targetUrl) {
    console.log('[KeepAlive] No target URL provided. Keep-alive pings disabled.');
    return null;
  }

  // Ensure target URL points to health check endpoint
  let healthEndpoint = targetUrl.replace(/\/+$/, '');
  if (!healthEndpoint.endsWith('/api/health')) {
    healthEndpoint += '/api/health';
  }

  const client = healthEndpoint.startsWith('https') ? https : http;

  const ping = () => {
    client.get(healthEndpoint, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[KeepAlive] Ping successful (${res.statusCode}) to ${healthEndpoint} at ${new Date().toISOString()}`);
        } else {
          console.warn(`[KeepAlive] Ping returned status ${res.statusCode} from ${healthEndpoint}`);
        }
      });
    }).on('error', (err) => {
      console.error(`[KeepAlive] Ping failed to ${healthEndpoint}:`, err.message);
    });
  };

  // Perform initial ping after 1 minute, then repeat on interval
  const initialTimeout = setTimeout(ping, 60 * 1000);
  const timer = setInterval(ping, intervalMs);

  console.log(`[KeepAlive] Started keep-alive timer for ${healthEndpoint} (Interval: ${intervalMs / 60000} minutes)`);

  return {
    stop: () => {
      clearTimeout(initialTimeout);
      clearInterval(timer);
      console.log('[KeepAlive] Stopped keep-alive timer.');
    }
  };
}

module.exports = startKeepAlive;
