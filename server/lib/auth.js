import { GoogleAuth } from 'google-auth-library';
import { readFileSync } from 'fs';

let _auth = null;

export function getAuth() {
  if (_auth) return _auth;

  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || './service-account.json';
  const key = JSON.parse(readFileSync(keyPath, 'utf8'));

  _auth = new GoogleAuth({
    credentials: key,
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly'
    ]
  });

  return _auth;
}
