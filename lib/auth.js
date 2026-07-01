import { jwtVerify, SignJWT } from 'jose';

const COOKIE_NAME = 'session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 giorni

function secret() {
  return new TextEncoder().encode(process.env.SESSION_SECRET);
}

export async function createSessionToken(payload = {}) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(secret());
}

export async function verifyRequest(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return false;
  try {
    await jwtVerify(match[1], secret());
    return true;
  } catch {
    return false;
  }
}

export function setCookie(token) {
  return `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${MAX_AGE}`;
}

export function clearCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`;
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders }
  });
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function checkCredentials(email, password) {
  const authEmail = process.env.AUTH_EMAIL || '';
  const authPassword = process.env.AUTH_PASSWORD || '';
  if (!authEmail || !authPassword) return false;
  return safeEqual((email || '').toLowerCase().trim(), authEmail.toLowerCase().trim())
      && safeEqual(password || '', authPassword);
}
