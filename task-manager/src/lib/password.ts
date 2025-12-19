import type {
  PasswordChecks,
  PasswordStrength,
  PasswordValidationResult,
} from "@/types/password";

function createEmptyChecks(): PasswordChecks {
  return {
    length: false,
    lowercase: false,
    uppercase: false,
    number: false,
    specialChar: false,
  };
}

export function evaluatePassword(password: string): PasswordValidationResult {
  const checks: PasswordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };

  const passedCount = Object.values(checks).filter(Boolean).length;

  let strength: PasswordStrength = "weak";

  if (checks.length && passedCount >= 4 && password.length >= 10) {
    strength = "strong";
  } else if (checks.length && passedCount >= 3) {
    strength = "medium";
  }

  return { strength, checks };
}

export function getEmptyPasswordValidation(): PasswordValidationResult {
  return {
    strength: "weak",
    checks: createEmptyChecks(),
  };
}
