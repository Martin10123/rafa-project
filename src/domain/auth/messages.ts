export function translateAuthError(message: string): string {
  const lower = message.toLowerCase()

  if (lower.includes('email not confirmed')) {
    return 'Debes confirmar tu correo antes de entrar. Revisa tu bandeja y spam.'
  }

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials')
  ) {
    return 'Correo o contraseña incorrectos. Si acabas de registrarte, confirma el correo primero.'
  }

  if (lower.includes('user already registered')) {
    return 'Ese correo ya está registrado. Prueba entrar o confirma el correo.'
  }

  if (lower.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }

  if (lower.includes('signup is disabled')) {
    return 'El registro está deshabilitado en este momento.'
  }

  return message
}

export const EMAIL_CONFIRM_PENDING =
  'Te enviamos un correo de confirmación. Ábrelo y vuelve a entrar.'
