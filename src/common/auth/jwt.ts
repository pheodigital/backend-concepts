import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

export function signJwt(
  payload: object,
  expiresIn: string = env.JWT_ACCESS_EXPIRES_IN,
) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
}

export function verifyJwt<T>(token: string): T {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as T;
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}
