import bcrypt from "bcrypt"; // if you installed bcryptjs instead, import from 'bcryptjs'

const SALT_ROUNDS = 12; // cost factor: each +1 doubles the hashing time

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash); // compare also handles the salt stored inside the hash
}
