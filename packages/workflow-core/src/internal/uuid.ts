import { v4 as uuidv4, validate } from "uuid";
import type { UUID } from "../public/types/uuid";

export class UUIDGenerator {
  static generate(): UUID {
    return uuidv4();
  }

  static isValid(value: string): value is UUID {
    return validate(value);
  }
}
