import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Passwords are hashed with bcrypt (salted, one-way) before they are stored.
 * "Decryption" at login is performed by comparing the typed password with the
 * stored hash, so the plain-text password is never saved anywhere.
 */
export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);
