import { randomInt } from "node:crypto";

// No 0/O or 1/I: they look alike when read aloud or copied by hand
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateTrackingNumber(): string {
  let id = "";
  for (let i = 0; i < 10; i++) id += ALPHABET[randomInt(ALPHABET.length)]; // cryptographically secure
  return `LG${id}`; // e.g. LG7K2M9XQ4PD (12 characters; the column allows 20)
}
