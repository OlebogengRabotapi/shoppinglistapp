import type { SafeUser, User } from '../types';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { request } from './client';

export const toSafeUser = ({ passwordHash: _passwordHash, ...rest }: User): SafeUser => rest;

const findByEmail = async (email: string): Promise<User | undefined> => {
  const matches = await request<User[]>(`/users?email=${encodeURIComponent(email.trim().toLowerCase())}`);
  return matches[0];
};

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
  surname: string;
  cellNumber: string;
}

export const registerUser = async (payload: RegisterPayload): Promise<SafeUser> => {
  const email = payload.email.trim().toLowerCase();
  if (await findByEmail(email)) throw new Error('An account with that email already exists.');
  const created = await request<User>('/users', 'POST', {
    email,
    passwordHash: await hashPassword(payload.password),
    name: payload.name.trim(),
    surname: payload.surname.trim(),
    cellNumber: payload.cellNumber.replace(/[\s-]/g, ''),
    createdAt: new Date().toISOString(),
  });
  return toSafeUser(created);
};

export const loginUser = async (email: string, password: string): Promise<SafeUser> => {
  const user = await findByEmail(email);
  // Same message for both failures so attackers cannot discover which emails exist.
  const invalid = new Error('Incorrect email or password.');
  if (!user) throw invalid;
  if (!(await verifyPassword(password, user.passwordHash))) throw invalid;
  return toSafeUser(user);
};

export const fetchUser = async (id: number): Promise<SafeUser> =>
  toSafeUser(await request<User>(`/users/${id}`));

export const updateUserProfile = async (
  id: number,
  changes: Pick<User, 'name' | 'surname' | 'cellNumber'>,
): Promise<SafeUser> =>
  toSafeUser(
    await request<User>(`/users/${id}`, 'PATCH', {
      name: changes.name.trim(),
      surname: changes.surname.trim(),
      cellNumber: changes.cellNumber.replace(/[\s-]/g, ''),
    }),
  );

export const updateUserCredentials = async (
  id: number,
  currentPassword: string,
  changes: { email?: string; newPassword?: string },
): Promise<SafeUser> => {
  const user = await request<User>(`/users/${id}`);
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new Error('Your current password is incorrect.');
  }
  const patch: Partial<User> = {};
  if (changes.email) {
    const email = changes.email.trim().toLowerCase();
    if (email !== user.email) {
      if (await findByEmail(email)) throw new Error('That email is already in use.');
      patch.email = email;
    }
  }
  if (changes.newPassword) patch.passwordHash = await hashPassword(changes.newPassword);
  if (Object.keys(patch).length === 0) return toSafeUser(user);
  return toSafeUser(await request<User>(`/users/${id}`, 'PATCH', patch));
};
