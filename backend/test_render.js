const start = async () => {
  try {
    console.log('Fetching /api/items from Render...');
    const resItems = await fetch('https://bbd-lost-and-found.onrender.com/api/items');
    console.log('/api/items Status:', resItems.status);
    
    console.log('Sending dummy registration to Render...');
    const reqStart = Date.now();
    const resReg = await fetch('https://bbd-lost-and-found.onrender.com/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: `test${Date.now()}@test.com`, password: 'password123' })
    });
    console.log('/api/auth/register Status:', resReg.status, 'Time:', Date.now() - reqStart, 'ms');
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
};
start();
