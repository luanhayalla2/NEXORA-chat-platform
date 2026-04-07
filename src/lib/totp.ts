/**
 * TOTP (Time-based One-Time Password) implementation
 * Compatible with Google Authenticator
 */

// Generate a random secret key (base32 encoded)
export function generateTOTPSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(20));
  return base32Encode(bytes);
}

// Generate TOTP code from secret
export async function generateTOTP(secret: string, timeStep = 30): Promise<string> {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBytes = new Uint8Array(8);
  let t = time;
  for (let i = 7; i >= 0; i--) {
    timeBytes[i] = t & 0xff;
    t = Math.floor(t / 256);
  }

  const key = await crypto.subtle.importKey(
    'raw',
    base32Decode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, timeBytes);
  const hash = new Uint8Array(signature);

  // Dynamic truncation
  const offset = hash[hash.length - 1] & 0x0f;
  const code =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, '0');
}

// Verify a TOTP code (checks current and ±1 time window)
export async function verifyTOTP(secret: string, code: string, timeStep = 30): Promise<boolean> {
  for (const offset of [-1, 0, 1]) {
    const time = Math.floor(Date.now() / 1000 / timeStep) + offset;
    const timeBytes = new Uint8Array(8);
    let t = time;
    for (let i = 7; i >= 0; i--) {
      timeBytes[i] = t & 0xff;
      t = Math.floor(t / 256);
    }

    const key = await crypto.subtle.importKey(
      'raw',
      base32Decode(secret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, timeBytes);
    const hash = new Uint8Array(signature);
    const off = hash[hash.length - 1] & 0x0f;
    const c =
      ((hash[off] & 0x7f) << 24) |
      ((hash[off + 1] & 0xff) << 16) |
      ((hash[off + 2] & 0xff) << 8) |
      (hash[off + 3] & 0xff);

    if ((c % 1000000).toString().padStart(6, '0') === code) {
      return true;
    }
  }
  return false;
}

// Generate otpauth:// URI for Google Authenticator QR code
export function generateOTPAuthURI(secret: string, email: string, issuer = 'NEXORA'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}

// Base32 encoding/decoding
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(data: Uint8Array): string {
  let result = '';
  let bits = 0;
  let value = 0;

  for (let i = 0; i < data.length; i++) {
    value = (value << 8) | data[i];
    bits += 8;
    while (bits >= 5) {
      result += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    result += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return result;
}

function base32Decode(str: string): Uint8Array {
  const cleaned = str.replace(/[=\s]/g, '').toUpperCase();
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(bytes);
}
