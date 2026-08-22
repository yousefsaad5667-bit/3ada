export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  
  // 1. Generate 32-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(32));
  
  // 2. Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // 3. Derive bits
  const iterations = 210000;
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  // 4. Format output
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  return `${iterations}:${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(':');
  if (parts.length !== 3) return false;
  
  const iterations = parseInt(parts[0], 10);
  const saltHex = parts[1];
  const hashHex = parts[2];
  
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  const storedHash = new Uint8Array(hashHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
  
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  try {
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      256
    );
    const hashBytes = new Uint8Array(hashBuffer);
    
    // Constant time comparison
    if (hashBytes.length !== storedHash.length) return false;
    let result = 0;
    for (let i = 0; i < hashBytes.length; i++) {
      result |= hashBytes[i] ^ storedHash[i];
    }
    return result === 0;
  } catch {
    return false;
  }
}

import { sign } from 'hono/jwt';

export async function generateAccessToken(userId: string, secret: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await sign(
    {
      sub: userId,
      iat: now,
      exp: now + 86400 // 24 hours
    },
    secret,
    'HS256'
  );
}

export function generateRefreshToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashToken(token: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(token));
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
