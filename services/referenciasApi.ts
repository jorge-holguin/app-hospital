/**
 * Referencias API Service
 * Endpoint: EXPO_PUBLIC_REFERENCIA_API_BASE_URL/api/referencia/consultar-referencias
 */

const API_ROOT = process.env.EXPO_PUBLIC_SOLICITUDES_CITA_BASE_URL || 'http://192.168.0.252:9012';
const REFERENCIA_BASE_URL = `${API_ROOT}/api/v1/referencias`;

export interface ReferenciaRequest {
  establecimientoDestino: string;
  limite: string;
  numerodocumento: string;
  pagina: string;
  tipodocumento: string;
}

export interface ReferenciaItem {
  id?: string;
  idReferencia?: string;
  numeroReferencia?: string;
  codigoEstado: string;
  estado?: string;
  especialidad?: string;
  especialidadDestino?: string;
  establecimientoOrigen?: string;
  fecha?: string;
  fechaEnvio?: string;
  diagnostico?: string;
  profesionalOrigen?: string;
  [key: string]: any;
}

export interface ReferenciaApiResponse {
  codigo?: string;
  mensaje?: string;
  datos?: {
    paginas?: number;
    porPagina?: number | null;
    total?: number;
    datos?: ReferenciaItem[] | null;
  };
  content?: ReferenciaItem[];
  referencias?: ReferenciaItem[];
  [key: string]: any;
}

/**
 * Consultar referencias médicas del paciente.
 * @param nroDocumento - DNI o CE del paciente
 * @param tipoDocumento - "1" para DNI, "2" para CE
 */
export async function consultarReferencias(
  nroDocumento: string,
  tipoDocumento: string = '1',
): Promise<ReferenciaItem[]> {
  try {
    const payload: ReferenciaRequest = {
      establecimientoDestino: '5947',
      limite: '25',
      numerodocumento: nroDocumento,
      pagina: '1',
      tipodocumento: tipoDocumento,
    };

    console.log('[API] consultarReferencias payload:', payload);

    const res = await fetch(`${REFERENCIA_BASE_URL}/consultar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    // Get raw text first to handle empty responses
    const rawText = await res.text();
    console.log('[API] consultarReferencias raw response:', rawText.substring(0, 500));

    // Handle empty response
    if (!rawText || rawText.trim() === '') {
      console.log('[API] consultarReferencias: Empty response from server');
      return [];
    }

    // Try to parse JSON
    let data: ReferenciaApiResponse;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('[API] consultarReferencias: JSON parse error, raw text:', rawText.substring(0, 200));
      // If response is HTML (error page), show generic error
      if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
        throw new Error('El servidor devolvió una página de error. Intente más tarde.');
      }
      throw new Error('Respuesta inválida del servidor');
    }

    // Handle codigo 6000: "No existe registros" - return empty array (not an error)
    if (data.codigo === '6000') {
      console.log('[API] consultarReferencias: No hay referencias activas');
      return [];
    }

    // If not ok and not codigo 6000, throw error
    if (!res.ok) {
      throw new Error(data.mensaje || `HTTP ${res.status}`);
    }

    // Handle different response structures
    // API returns: { datos: { datos: [{ rownum, data: { idReferencia, codigoEstado... } }] } }
    let result: ReferenciaItem[] = [];
    
    if (Array.isArray(data)) {
      result = data;
    } else if (data.datos?.datos && Array.isArray(data.datos.datos)) {
      // Extract nested data property from each item
      result = data.datos.datos
        .filter((item: any) => item && item.data)
        .map((item: any) => item.data as ReferenciaItem);
    } else if (data.content && Array.isArray(data.content)) {
      result = data.content;
    } else if (data.referencias && Array.isArray(data.referencias)) {
      result = data.referencias;
    }

    return result;
  } catch (error) {
    console.error('[API] consultarReferencias error:', error);
    throw error;
  }
}

/**
 * Map tipoDocumento string to API code.
 * "D" or "DNI" => "1", "CE" => "2"
 */
export function mapTipoDocumentoToCode(tipo: string | null | undefined): string {
  if (!tipo) return '1';
  const upper = tipo.toUpperCase().trim();
  if (upper === 'CE' || upper === '2' || upper.includes('EXTRANJER')) return '2';
  return '1';
}
