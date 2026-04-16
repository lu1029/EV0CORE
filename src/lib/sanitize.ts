/**
 * Sanitize text input by removing HTML tags and dangerous characters.
 * Use for all free-text inputs before saving to DB.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>"'`]/g, '') // Remove dangerous chars
    .trim();
}

/**
 * Escape HTML entities for safe rendering.
 */
export function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#x27;', '`': '&#x60;',
  };
  return str.replace(/[&<>"'`]/g, (c) => map[c] || c);
}

/**
 * Validate numeric input within a range.
 */
export function validateNumber(value: number, min: number, max: number, fieldName: string): string | null {
  if (isNaN(value)) return `${fieldName} deve ser um número válido`;
  if (value < min || value > max) return `${fieldName} deve estar entre ${min} e ${max}`;
  return null;
}

/**
 * Validate email format.
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate password strength.
 * Returns null if valid, error message if invalid.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "A senha deve ter no mínimo 8 caracteres";
  if (!/\d/.test(password)) return "A senha deve conter pelo menos 1 número";
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return "A senha deve conter pelo menos 1 caractere especial";
  return null;
}

/**
 * Get password strength level (0-3).
 */
export function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/\d/.test(password) && /[a-zA-Z]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  const levels = [
    { level: 0, label: "Muito fraca", color: "bg-destructive" },
    { level: 1, label: "Fraca", color: "bg-orange-500" },
    { level: 2, label: "Média", color: "bg-yellow-500" },
    { level: 3, label: "Forte", color: "bg-accent" },
  ];
  return levels[score];
}
