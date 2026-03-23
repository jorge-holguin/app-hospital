/**
 * Solicitudes API Service
 * Endpoint: EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL/api/v1/solicitudes
 */

const API_ROOT = process.env.EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL || 'http://192.168.5.231:9012';
const SOLICITUDES_BASE_URL = `${API_ROOT}/api/v1/solicitudes`;

export interface SolicitudCita {
  idSolicitudCita: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  especialidad: string;
  especialidadNombre: string;
  medico: string;
  medicoNombre: string;
  turno: string;
  fecha: string;
  hora: string;
  correo: string;
  codigo: string;
  estado: 'PENDIENTE' | 'CITADO' | 'DENEGADO' | 'EN_REVISION' | 'ELIMINADO' | string;
  citaId: string;
  tipoAtencion: string;
  tipoCita: string | null;
  rutaReferencia: string | null;
  consultorio: string;
  celular: string;
  observacion: string | null;
  usuario: string | null;
  especialidadInterconsulta: string | null;
  observacionPaciente: string | null;
  lugar: string | null;
}

/**
 * Get solicitudes de cita by documento.
 * @param tipoDocumento - "D  " for DNI (with 2 spaces), "CE " for Carnet de Extranjería
 * @param numeroDocumento - Document number
 */
export async function getSolicitudesByDocumento(
  tipoDocumento: string,
  numeroDocumento: string,
): Promise<SolicitudCita[]> {
  try {
    // URL encode the tipoDocumento (important for "D  " with spaces)
    const encodedTipoDoc = encodeURIComponent(tipoDocumento);
    const url = `${SOLICITUDES_BASE_URL}/documento/${encodedTipoDoc}/${numeroDocumento}`;

    console.log('[API] getSolicitudesByDocumento:', { tipoDocumento, numeroDocumento, url });

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': '*/*' },
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    const data = await res.json();

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  } catch (error) {
    console.error('[API] getSolicitudesByDocumento error:', error);
    throw error;
  }
}

/**
 * Map tipoDocumento from user profile to API format.
 * API expects "D  " for DNI, "CE " for Carnet de Extranjería
 */
export function mapTipoDocumentoForSolicitudes(tipo: string | null | undefined): string {
  if (!tipo) return 'D  ';
  const upper = tipo.toUpperCase().trim();
  if (upper === 'CE' || upper === '2' || upper.includes('EXTRANJER')) return 'CE ';
  return 'D  ';
}
