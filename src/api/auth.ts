import { accountsSeed } from '@/data/users';
import type { AuthUser, Credentials } from '@/types/auth';
import { request, requestFailure } from './client';

export async function login({ identifier, password }: Credentials): Promise<AuthUser> {
  const account = accountsSeed.find(
    (candidate) =>
      candidate.email.toLowerCase() === identifier.trim().toLowerCase() ||
      candidate.email.split('@')[0].toLowerCase() === identifier.trim().toLowerCase(),
  );

  if (!account || account.password !== password) {
    return requestFailure('Invalid email or password. Please try again.');
  }

  const { password: _password, ...user } = account;
  return request(user);
}

export async function requestPasswordReset(email: string): Promise<{ sent: boolean }> {
  // Always resolves so the UI cannot be used to enumerate valid accounts.
  return request({ sent: Boolean(email) });
}
