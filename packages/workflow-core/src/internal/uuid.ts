import { v4 as uuidv4 } from "uuid";
import type { UUID } from "@/public/types/uuid";

export function generateUUID(): UUID {
  return uuidv4();
}
