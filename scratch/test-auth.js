async function test() {
  console.log('1. Registering user...');
  let res = await fetch('http://127.0.0.1:8788/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'flowuser', password: 'password123' })
  });
  let data = await res.json();
  if (res.status !== 201) throw new Error('Register failed: ' + JSON.stringify(data));
  console.log('Register OK!');
  
  const originalAccessToken = data.accessToken;
  const originalRefreshToken = data.refreshToken;
  
  console.log('2. Hitting /me with access token...');
  res = await fetch('http://127.0.0.1:8788/api/me', {
    headers: { 'Authorization': `Bearer ${originalAccessToken}` }
  });
  data = await res.json();
  if (res.status !== 200) throw new Error('/me failed: ' + JSON.stringify(data));
  console.log('/me OK! User ID:', data.userId);
  
  console.log('3. Refreshing token...');
  res = await fetch('http://127.0.0.1:8788/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: originalRefreshToken })
  });
  data = await res.json();
  if (res.status !== 200) throw new Error('Refresh failed: ' + JSON.stringify(data));
  console.log('Refresh OK!');
  const newAccessToken = data.accessToken;
  
  console.log('4. Logging out...');
  res = await fetch('http://127.0.0.1:8788/api/auth/logout', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${newAccessToken}`
    },
    body: JSON.stringify({ refreshToken: originalRefreshToken })
  });
  if (res.status !== 200) throw new Error('Logout failed: ' + res.status);
  console.log('Logout OK!');
  
  console.log('5. Refreshing token after logout (should fail)...');
  res = await fetch('http://127.0.0.1:8788/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: originalRefreshToken })
  });
  data = await res.json();
  if (res.status !== 401) throw new Error('Refresh succeeded when it should have failed: ' + JSON.stringify(data));
  console.log('Refresh after logout failed with 401 as expected!');
  
  console.log('All tests passed!');
}

test().catch(console.error);
