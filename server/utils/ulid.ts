import crypto from 'crypto';

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeTime(timestamp: number): string {
  let result = '';
  for (let i = 0; i < 10; i++) {
    result = CROCKFORD_BASE32[timestamp % 32] + result;
    timestamp = Math.floor(timestamp / 32);
  }
  return result;
}

function encodeRandom(): string {
  const bytes = crypto.randomBytes(10);
  let result = '';
  for (let i = 0; i < 16; i++) {
    const byteIndex = Math.floor((i * 10) / 16);
    const bitOffset = (i * 5) % 8;
    let value = bytes[byteIndex] >> (3 - bitOffset);
    if (bitOffset > 3) {
      value |= (bytes[byteIndex + 1] || 0) << (8 - bitOffset + 3);
    }
    result += CROCKFORD_BASE32[value & 0x1f];
  }
  return result;
}

export function generateUlid(): string {
  return encodeTime(Date.now()) + encodeRandom();
}
