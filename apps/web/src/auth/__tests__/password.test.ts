import { describe, it, expect } from 'vitest';
import { generateSalt, hashPassword, verifyPassword } from '../password';

describe('generateSalt', () => {
  it('returns a 32-character hex string', () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });

  it('generates different values each call', () => {
    const salt1 = generateSalt();
    const salt2 = generateSalt();
    expect(salt1).not.toBe(salt2);
  });
});

describe('hashPassword', () => {
  it('produces a consistent hash for the same input', async () => {
    const salt = 'abcdef1234567890abcdef1234567890';
    const hash1 = await hashPassword('mypassword', salt);
    const hash2 = await hashPassword('mypassword', salt);
    expect(hash1).toBe(hash2);
  });

  it('produces a 64-character hex string', async () => {
    const hash = await hashPassword('test', 'salt');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('produces different hashes for different passwords', async () => {
    const salt = 'samesalt';
    const hash1 = await hashPassword('password1', salt);
    const hash2 = await hashPassword('password2', salt);
    expect(hash1).not.toBe(hash2);
  });

  it('produces different hashes for different salts', async () => {
    const hash1 = await hashPassword('password', 'salt1');
    const hash2 = await hashPassword('password', 'salt2');
    expect(hash1).not.toBe(hash2);
  });
});

describe('verifyPassword', () => {
  it('returns true for the correct password', async () => {
    const salt = generateSalt();
    const hash = await hashPassword('correct', salt);
    expect(await verifyPassword('correct', salt, hash)).toBe(true);
  });

  it('returns false for the wrong password', async () => {
    const salt = generateSalt();
    const hash = await hashPassword('correct', salt);
    expect(await verifyPassword('wrong', salt, hash)).toBe(false);
  });
});
