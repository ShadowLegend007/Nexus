const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.toString());
  });

  page.on('console', msg => {
    console.log('PAGE LOG:', msg.text());
  });

  // Start with localhost
  await page.goto('http://localhost:5173');
  
  // Inject mock auth state into localStorage so it thinks we are logged in
  await page.evaluate(() => {
    localStorage.setItem('nexus_token', 'mock_token');
    localStorage.setItem('nexus_hexId', '123456');
    // Also mock the auth store if possible, but Zustand persists to memory.
    // However, the app relies on apiGetMe for token verification. 
    // Wait, let's just intercept the network request for apiGetMe to return a mock user!
  });

  // Intercept apiGetMe request to return a fake user, so checkAuth succeeds!
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.url().includes('/api/auth/me')) {
      request.respond({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _id: '1',
          username: 'TestUser',
          email: 'test@test.com',
          hexId: '123456'
        })
      });
    } else {
      request.continue();
    }
  });

  // Reload the page so the app reads the mock token and makes the mocked /api/auth/me request
  await page.goto('http://localhost:5173/chat', { waitUntil: 'networkidle0' });

  // Wait a bit just in case
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'screenshot_chat.png' });
  
  await browser.close();
})();
