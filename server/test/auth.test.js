import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { User } from '../src/models/User.js';
import { RefreshToken } from '../src/models/RefreshToken.js';
import { config } from '../src/config/env.js';
import { AuthService } from '../src/services/auth.service.js';

let app;
let server;
let baseUrl;

test.before(async () => {
  // Connect to DB
  await mongoose.connect(config.mongodbUri);
  // Clean up test data
  await User.deleteMany({ email: /test.*@example\.com/ });
  await User.deleteMany({ email: 'admin@needtosolution.com' });
  await RefreshToken.deleteMany({});
  await AuthService.seedAdmin();

  app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await User.deleteMany({ email: /test.*@example\.com/ });
  await RefreshToken.deleteMany({});
  await mongoose.disconnect();
  await new Promise((resolve) => server.close(resolve));
});

test('1. REGISTRATION - Valid registration assigns requester role and returns access token', async () => {
  const payload = {
    name: 'Test Requester',
    email: 'testrequester1@example.com',
    password: 'Password123',
    phone: '+1234567890',
  };

  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  assert.equal(res.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.user.email, 'testrequester1@example.com');
  assert.deepEqual(body.user.roles, ['requester']);
  assert.equal(typeof body.accessToken, 'string');
  assert.equal(body.user.passwordHash, undefined); // Never expose password hash

  // Verify Set-Cookie header contains jid refresh token
  const cookieHeader = res.headers.get('set-cookie');
  assert.ok(cookieHeader && cookieHeader.includes('jid='));
});

test('2. REGISTRATION - Reject duplicate email with 409 Conflict', async () => {
  const payload = {
    name: 'Duplicate User',
    email: 'testrequester1@example.com',
    password: 'Password123',
  };

  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  assert.equal(res.status, 409);
  assert.equal(body.success, false);
});

test('3. REGISTRATION - Reject self-assigned admin role or invalid fields', async () => {
  const payload = {
    name: 'Hacker User',
    email: 'testhacker@example.com',
    password: 'Password123',
    roles: ['admin'],
  };

  const res = await fetch(`${baseUrl}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  assert.equal(res.status, 400);
  assert.equal(body.success, false);
});

test('4. LOGIN - Successful login with valid credentials', async () => {
  const payload = {
    email: 'testrequester1@example.com',
    password: 'Password123',
  };

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(typeof body.accessToken, 'string');
  assert.equal(body.user.email, 'testrequester1@example.com');
});

test('5. LOGIN - Reject invalid password with 401', async () => {
  const payload = {
    email: 'testrequester1@example.com',
    password: 'WrongPassword999',
  };

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.success, false);
});

test('6. PROTECTED ROUTE - GET /api/v1/auth/me works with valid Bearer token and rejects missing token', async () => {
  // 6a. Missing token -> 401
  const unauthRes = await fetch(`${baseUrl}/api/v1/auth/me`);
  assert.equal(unauthRes.status, 401);

  // 6b. Login to get token
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  const loginBody = await loginRes.json();
  const token = loginBody.accessToken;

  // 6c. Valid token -> 200
  const authRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const authBody = await authRes.json();
  assert.equal(authRes.status, 200);
  assert.equal(authBody.user.email, 'testrequester1@example.com');
});

test('7. REFRESH TOKEN ROTATION - Rotates refresh cookie and grants new access token', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  const rawCookie = loginRes.headers.get('set-cookie');
  const jidMatch = rawCookie.match(/jid=([^;]+)/);
  const jidCookie = jidMatch ? jidMatch[1] : '';

  // Call refresh endpoint with cookie
  const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: {
      Cookie: `jid=${jidCookie}`,
    },
  });

  const refreshBody = await refreshRes.json();
  assert.equal(refreshRes.status, 200);
  assert.equal(typeof refreshBody.accessToken, 'string');

  const newRawCookie = refreshRes.headers.get('set-cookie');
  assert.ok(newRawCookie && newRawCookie.includes('jid='));
  const newJidMatch = newRawCookie.match(/jid=([^;]+)/);
  const newJidCookie = newJidMatch ? newJidMatch[1] : '';

  // Old cookie should now be revoked and reject reuse
  const reuseRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `jid=${jidCookie}` },
  });
  assert.equal(reuseRes.status, 401);
});

test('8. LOGOUT - Revokes refresh session and clears cookie', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  const rawCookie = loginRes.headers.get('set-cookie');
  const jidMatch = rawCookie.match(/jid=([^;]+)/);
  const jidCookie = jidMatch ? jidMatch[1] : '';

  const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: { Cookie: `jid=${jidCookie}` },
  });

  assert.equal(logoutRes.status, 200);
  const logoutCookie = logoutRes.headers.get('set-cookie');
  assert.ok(logoutCookie && (logoutCookie.includes('Max-Age=0') || logoutCookie.includes('expires=')));
});

test('9. ROLE AUTHORIZATION - Requester is blocked from Admin endpoint with 403', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  const { accessToken } = await loginRes.json();

  const adminRes = await fetch(`${baseUrl}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  assert.equal(adminRes.status, 403);
});

test('10. ADMIN ROLE - Seeded Admin can access Admin endpoints', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@needtosolution.com', password: 'AdminPassword@123' }),
  });
  const { accessToken } = await loginRes.json();

  const adminRes = await fetch(`${baseUrl}/api/v1/admin/users`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const adminBody = await adminRes.json();
  assert.equal(adminRes.status, 200);
  assert.ok(Array.isArray(adminBody.users));
});

test('11. PROVIDER CAPABILITY - Existing requester becomes provider additively on same account', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  let { accessToken } = await loginRes.json();

  // Enable provider capability
  const enableRes = await fetch(`${baseUrl}/api/v1/providers/enable-capability`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const enableBody = await enableRes.json();
  assert.equal(enableRes.status, 200);
  assert.ok(enableBody.user.roles.includes('requester'));
  assert.ok(enableBody.user.roles.includes('provider'));

  // Re-login / refresh to get updated token containing 'provider' role
  const reLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  const newTokens = await reLogin.json();

  // Access provider-protected dashboard endpoint
  const provRes = await fetch(`${baseUrl}/api/v1/providers/dashboard-preview`, {
    headers: { Authorization: `Bearer ${newTokens.accessToken}` },
  });
  assert.equal(provRes.status, 200);
});

test('12. UPDATE PROFILE & CHANGE PASSWORD', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  let { accessToken } = await loginRes.json();

  // Update profile
  const updateRes = await fetch(`${baseUrl}/api/v1/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name: 'Updated Requester Name', phone: '+9876543210', locationLabel: 'New York, USA' }),
  });
  const updateBody = await updateRes.json();
  assert.equal(updateRes.status, 200);
  assert.equal(updateBody.user.name, 'Updated Requester Name');
  assert.equal(updateBody.user.locationLabel, 'New York, USA');

  // Change password
  const changeRes = await fetch(`${baseUrl}/api/v1/auth/me/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      currentPassword: 'Password123',
      newPassword: 'BrandNewPassword456',
      confirmPassword: 'BrandNewPassword456',
    }),
  });
  assert.equal(changeRes.status, 200);

  // Verify old password fails
  const failLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'Password123' }),
  });
  assert.equal(failLogin.status, 401);

  // Verify new password succeeds
  const successLogin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrequester1@example.com', password: 'BrandNewPassword456' }),
  });
  assert.equal(successLogin.status, 200);
});
