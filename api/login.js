import { checkCredentials, createSessionToken, setCookie, json } from '../lib/auth.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Bad request' }, 400); }

  const { email, password } = body || {};
  if (!checkCredentials(email, password)) {
    return json({ error: 'Credenziali non valide' }, 401);
  }
  const token = await createSessionToken({ email });
  return json({ ok: true }, 200, { 'Set-Cookie': setCookie(token) });
}
