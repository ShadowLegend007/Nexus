const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.log('REACT CRASH ERROR:', err.toString());
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR LOG:', msg.text());
    }
  });

  // Inject script to override fetch so it doesn't make real API calls
  await page.evaluateOnNewDocument(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      if (url.includes('/api/auth/me')) {
        return new Response(JSON.stringify({
          _id: '1',
          username: 'TestUser',
          email: 'test@test.com',
          hexId: '123456'
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (url.includes('/api/conversations')) {
        return new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return originalFetch(...args);
    };
    
    // Also override axios if they use it
    window.__MOCK_AXIOS__ = true;
  });

  await page.goto('http://localhost:5173');
  
  await page.evaluate(() => {
    localStorage.setItem('nexus_token', 'mock_token');
    localStorage.setItem('nexus_hexId', '123456');
  });

  // Navigate to chat
  await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });

  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
})();
