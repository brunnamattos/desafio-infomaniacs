export type PasswordStrength = "weak" | "medium" | "strong";

export type PasswordChecks = {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  specialChar: boolean;
};

export type PasswordValidationResult = {
  strength: PasswordStrength;
  checks: PasswordChecks;
};
