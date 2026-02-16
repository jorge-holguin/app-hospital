/**
 * Referencias API Service
 * Endpoint: http://192.168.0.31:9012/api/referencia/consultar-referencias
 */

const REFERENCIA_BASE_URL = 'http://192.168.0.31:9012/api/referencia';

export interface ReferenciaRequest {
  establecimientoDestino: string;
  limite: string;
  numerodocumento: string;
  pagina: string;
  tipodocumento: string;
}

export interface ReferenciaItem {
  id?: string;
  numeroReferencia?: string;
  codigoEstado: string;
  estado?: string;
  especialidad?: string;
  especialidadDestino?: string;
  establecimientoOrigen?: string;
  fecha?: string;
  diagnostico?: string;
  profesionalOrigen?: string;
  [key: string]: any;
}

export interface ReferenciaResponse {
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

    const res = await fetch(`${REFERENCIA_BASE_URL}/consultar-referencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    const data = await res.json();

    // Handle different response structures
    if (Array.isArray(data)) return data;
    if (data.content && Array.isArray(data.content)) return data.content;
    if (data.referencias && Array.isArray(data.referencias)) return data.referencias;

    return [];
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
