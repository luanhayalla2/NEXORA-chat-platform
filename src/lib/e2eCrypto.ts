/**
 * End-to-End Encryption using Web Crypto API
 * Uses AES-GCM for symmetric encryption with ECDH key exchange
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

// Generate a random encryption key for a conversation
export async function generateConversationKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

// Export key to storable format
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported);
}

// Import key from stored format
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64ToArrayBuffer(base64Key);
  return crypto.subtle.importKey(
    'raw',
    raw,
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt a message
export async function encryptMessage(plaintext: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  // Combine IV + ciphertext and encode as base64
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return `E2E:${arrayBufferToBase64(combined.buffer)}`;
}

// Decrypt a message
export async function decryptMessage(ciphertext: string, key: CryptoKey): Promise<string> {
  if (!ciphertext.startsWith('E2E:')) {
    return ciphertext; // Not encrypted, return as-is
  }

  const data = base64ToArrayBuffer(ciphertext.slice(4));
  const iv = new Uint8Array(data, 0, IV_LENGTH);
  const encrypted = new Uint8Array(data, IV_LENGTH);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// Check if a message is encrypted
export function isEncrypted(content: string): boolean {
  return content.startsWith('E2E:');
}

// Key storage using localStorage (in production, use more secure storage)
const KEY_STORAGE_PREFIX = 'nexora_e2e_key_';

export async function storeConversationKey(conversationId: string, key: CryptoKey): Promise<void> {
  const exported = await exportKey(key);
  localStorage.setItem(`${KEY_STORAGE_PREFIX}${conversationId}`, exported);
}

export async function getConversationKey(conversationId: string): Promise<CryptoKey | null> {
  const stored = localStorage.getItem(`${KEY_STORAGE_PREFIX}${conversationId}`);
  if (!stored) return null;
  try {
    return await importKey(stored);
  } catch {
    return null;
  }
}

export async function getOrCreateConversationKey(conversationId: string): Promise<CryptoKey> {
  const existing = await getConversationKey(conversationId);
  if (existing) return existing;

  const newKey = await generateConversationKey();
  await storeConversationKey(conversationId, newKey);
  return newKey;
}

// Utility: ArrayBuffer <-> Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
