export function friendlyAuthError(
  err: { message?: string; status?: number } | string,
  t: (key: string, vars?: Record<string, string | number>) => string
): string {
  const message = typeof err === 'string' ? err : err?.message || '';
  const status = typeof err === 'string' ? undefined : err?.status;

  const msg = message.toLowerCase();

  // Heurísticas comunes de Supabase/Auth
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return t('auth.errors.invalid_credentials');
  }
  if (msg.includes('email not confirmed') || msg.includes('email needs confirmation')) {
    return t('auth.errors.email_not_confirmed');
  }
  if (msg.includes('already registered') || msg.includes('user already exists')) {
    return t('auth.errors.email_already_registered');
  }
  if (
    msg.includes('too many requests') ||
    msg.includes('rate limit') ||
    msg.includes('for security purposes')
  ) {
    return t('auth.errors.rate_limited');
  }
  if (status === 0 || msg.includes('failed to fetch') || msg.includes('network')) {
    return t('auth.errors.network');
  }

  // Fallback genérico
  return t('auth.errors.generic');
}
