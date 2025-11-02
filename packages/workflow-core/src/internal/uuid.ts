import { v4 as uuidv4, validate } from "uuid";
import type { UUID } from "../public/types";

export function generateUUID(): UUID {
  return uuidv4() as UUID;
}

export function isUUID(value: string): value is UUID {
  return validate(value);
}
