/**
 * Centralized API error handler.
 * Translates raw API errors into user-friendly Spanish messages.
 */
import { Alert } from 'react-native';

// Known error messages from backend mapped to user-friendly messages
const ERROR_MESSAGE_MAP: Record<string, string> = {
  // Registro / RENIEC
  'digito de verificacion no coincide': 'El dígito de verificación no coincide con los registros de RENIEC. Por favor verifique su documento.',
  'digito verificacion': 'El dígito de verificación es incorrecto. Revise su DNI e intente nuevamente.',
  'reniec': 'No se pudo validar su documento con RENIEC. Verifique que los datos ingresados sean correctos.',
  // Correo
  'mail server': 'No se pudo enviar el correo electrónico. Por favor intente nuevamente en unos minutos.',
  'mail': 'Hubo un problema al enviar el correo. Intente nuevamente en unos minutos.',
  'smtp': 'El servicio de correo no está disponible en este momento. Intente más tarde.',
  'connection failed': 'No se pudo conectar con el servidor de correo. Intente más tarde.',
  'email already': 'Este correo electrónico ya está registrado. Intente iniciar sesión o recuperar su contraseña.',
  'already registered': 'Este usuario ya se encuentra registrado.',
  'already exists': 'Este usuario ya se encuentra registrado.',
  // Autenticación
  'bad credentials': 'Correo electrónico o contraseña incorrectos.',
  'invalid credentials': 'Correo electrónico o contraseña incorrectos.',
  'account locked': 'Su cuenta ha sido bloqueada temporalmente. Intente más tarde.',
  'account disabled': 'Su cuenta ha sido deshabilitada. Contacte al hospital.',
  'not verified': 'Debe verificar su correo electrónico antes de continuar.',
  'token expired': 'Su sesión ha expirado. Inicie sesión nuevamente.',
  'invalid token': 'Código inválido o expirado. Intente nuevamente.',
  'invalid code': 'El código ingresado no es válido. Verifique e intente nuevamente.',
  'expired code': 'El código ha expirado. Solicite uno nuevo.',
  // Contraseña
  'password': 'La contraseña es incorrecta.',
  'incorrect password': 'La contraseña actual es incorrecta.',
  // Documento
  'documento ya registrado': 'Este número de documento ya se encuentra registrado.',
  'documento no encontrado': 'No se encontró información para este documento.',
  // General
  'not found': 'No se encontró la información solicitada.',
  'forbidden': 'No tiene permisos para realizar esta acción.',
  'unauthorized': 'Sesión expirada. Inicie sesión nuevamente.',
};

/**
 * Extract a user-friendly message from an API error.
 */
export function getApiErrorMessage(error: any, fallback?: string): string {
  // 1. No response at all (network error)
  if (!error.response && !error.status) {
    if (error.message === 'TIMEOUT' || error.code === 'ECONNABORTED') {
      return 'El servidor no respondió a tiempo. Verifique su conexión e intente nuevamente.';
    }
    if (error.message?.includes('Network') || error.message?.includes('network')) {
      return 'No se pudo conectar al servidor. Verifique que está conectado a la red.';
    }
    return 'No se pudo conectar al servidor. Verifique su conexión a internet.';
  }

  const status = error.response?.status || error.status;
  const data = error.response?.data || error.data || {};
  const rawMessage = data?.message || data?.error || data?.mensaje || error.message || '';

  // 2. Server error (500+)
  if (status >= 500) {
    return 'Error en el servidor, intente más tarde.';
  }

  // 3. Try to match known error patterns
  if (rawMessage) {
    const lowerMsg = rawMessage.toLowerCase();
    for (const [pattern, friendlyMsg] of Object.entries(ERROR_MESSAGE_MAP)) {
      if (lowerMsg.includes(pattern.toLowerCase())) {
        return friendlyMsg;
      }
    }
    // If the backend message is already somewhat descriptive (in Spanish), return it cleaned up
    if (rawMessage.length < 200) {
      return rawMessage;
    }
  }

  // 4. Map by HTTP status code
  switch (status) {
    case 400:
      return fallback || 'Los datos enviados no son válidos. Revise la información e intente nuevamente.';
    case 401:
      return 'Sesión expirada. Inicie sesión nuevamente.';
    case 403:
      return 'No tiene permisos para realizar esta acción.';
    case 404:
      return 'No se encontró la información solicitada.';
    case 409:
      return 'Esta información ya existe en el sistema.';
    case 429:
      return 'Demasiados intentos. Espere unos minutos antes de intentar nuevamente.';
    default:
      return fallback || 'Ocurrió un error inesperado. Intente nuevamente.';
  }
}

/**
 * Show an API error as a user-friendly Alert.
 */
export function showApiError(error: any, title: string = 'Error', fallback?: string) {
  const message = getApiErrorMessage(error, fallback);
  Alert.alert(title, message);
}
