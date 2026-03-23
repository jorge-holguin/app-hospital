/**
 * Signos Vitales API Service
 * Endpoint: EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL/api/v1/atenciones/obtener-signos-vitales
 */

const API_ROOT = process.env.EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL || 'http://192.168.5.231:9012';
const ATENCIONES_BASE_URL = `${API_ROOT}/api/v1/atenciones`;

export interface SignosVitales {
  peso: string;
  talla: string;
  temperatura: string;
  presion: string;
  edad: string;
  origen: string;
  fecha: string;
}

export interface SignosVitalesResponse {
  statusCode: number;
  success: boolean;
  message: string;
  errors: string[];
  data: SignosVitales[];
}

/**
 * Get signos vitales (triage history) by documento.
 * @param tipoDocumento - "D  " for DNI (with 2 spaces), "CE " for Carnet de Extranjería
 * @param numDocumento - Document number
 */
export async function getSignosVitales(
  tipoDocumento: string,
  numDocumento: string,
): Promise<SignosVitales[]> {
  try {
    const params = new URLSearchParams({
      tipoDocumento,
      numDocumento,
    });

    const url = `${ATENCIONES_BASE_URL}/obtener-signos-vitales?${params.toString()}`;
    console.log('[API] getSignosVitales:', { tipoDocumento, numDocumento, url });

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': '*/*' },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    const response: SignosVitalesResponse = await res.json();

    if (response.success && Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  } catch (error) {
    console.error('[API] getSignosVitales error:', error);
    throw error;
  }
}

/**
 * Get the latest triage with valid peso and talla.
 * If the most recent triage doesn't have peso/talla, search older ones.
 */
export function getLatestValidTriage(triajes: SignosVitales[]): SignosVitales | null {
  if (!triajes || triajes.length === 0) return null;

  // First, try to find one with both peso and talla
  for (const t of triajes) {
    if (t.peso && t.talla && t.peso !== '0' && t.talla !== '0') {
      return t;
    }
  }

  // If none found with both, return the first one anyway
  return triajes[0] || null;
}

/**
 * Map tipoDocumento from user profile to API format.
 * API expects "D  " for DNI (with 2 spaces)
 */
export function mapTipoDocumentoForAtenciones(tipo: string | null | undefined): string {
  if (!tipo) return 'D  ';
  const trimmed = tipo.trim().toUpperCase();
  if (trimmed === 'CE' || trimmed.includes('EXTRANJER')) return 'CE ';
  if (trimmed === 'D' || trimmed === 'DNI') return 'D  ';
  // If already in correct format, return as-is
  if (tipo.startsWith('D') || tipo.startsWith('CE')) return tipo;
  return 'D  ';
}
