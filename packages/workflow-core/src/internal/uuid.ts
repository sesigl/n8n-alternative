import { v4 as uuidv4, validate } from "uuid";
import type { UUID } from "@/public/types/uuid";

export function generateUUID(): UUID {
  return uuidv4();
}

export function isValidUUID(value: string): value is UUID {
  return validate(value);
}
