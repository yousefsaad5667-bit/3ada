export interface ValidationError {
  field: string;
  messageAr: string;
}

export interface ValidationResult<T> {
  valid: boolean;
  value: T | null;
  errors: ValidationError[];
}
