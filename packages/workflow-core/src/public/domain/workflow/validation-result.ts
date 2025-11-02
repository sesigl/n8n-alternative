export class ValidationResult {
  private constructor(
    public readonly valid: boolean,
    public readonly errors?: string[],
  ) {}

  static success(): ValidationResult {
    return new ValidationResult(true);
  }

  static failure(errors: string[]): ValidationResult {
    if (errors.length === 0) {
      throw new Error("Failure ValidationResult must have at least one error");
    }
    return new ValidationResult(false, errors);
  }

  isValid(): boolean {
    return this.valid;
  }

  hasErrors(): boolean {
    return !this.valid && this.errors !== undefined && this.errors.length > 0;
  }

  getErrors(): string[] {
    return this.errors || [];
  }

  toString(): string {
    if (this.valid) {
      return "ValidationResult: SUCCESS";
    }
    return `ValidationResult: FAILURE - ${this.errors?.join(", ")}`;
  }
}
