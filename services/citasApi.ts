/**
 * Citas API Service
 * Base URL: https://citas.hospitalchosica.gob.pe/api/api/v1/app-citas
 */

const BASE_URL = 'https://citas.hospitalchosica.gob.pe/api/api/v1/app-citas';

// ── Types ────────────────────────────────────────────────
export interface Especialidad {
  idEspecialidad: string;
  nombre: string;
}

export interface Medico {
  nombre: string;      // código corto (e.g. "AME")
  medicoId: string;    // nombre completo (e.g. "ARANIBAR MAKER EDWIN JOSE")
}

export interface CitaSlot {
  citaId: string;
  fecha: string;
  hora: string;
  turnoConsulta: string;
  consultorio: string;
  estado: string;
  medico: string | null;
  nombreMedico: string | null;
  lugar: string | null;
  conSolicitud: boolean;
}

export interface FechaConsultorio {
  fecha: string;
  consultorio: string;
  totalDisponibles: string;
  lugar: string | null;
}

export interface SolicitudPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  citaId: string;
  consultorio: string;
  nombres: string;
  celular: string;
  correo: string;
  especialidad: string;
  especialidadNombre: string;
  medico: string;
  medicoNombre: string;
  fecha: string;
  hora: string;
  turno: string;
  tipoAtencion: string;
  tipoCita: string;
  especialidadInterconsulta: string;
  observacionPaciente: string;
  lugar: string | null;
}

// ── Helper: build date range for current + next month ─────
export function getDateRange(): { fechaInicio: string; fechaFin: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  const inicio = `${y}-${String(m + 1).padStart(2, '0')}-01`;

  // End of next month
  const nextM = m + 2 > 12 ? 1 : m + 2;
  const nextY = m + 2 > 12 ? y + 1 : y;
  const lastDay = new Date(nextY, nextM, 0).getDate();
  const fin = `${nextY}-${String(nextM).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { fechaInicio: inicio, fechaFin: fin };
}

export function getMonthRange(date: Date): { fechaInicio: string; fechaFin: string } {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return {
    fechaInicio: `${y}-${String(m).padStart(2, '0')}-01`,
    fechaFin: `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`,
  };
}

// ── API calls ────────────────────────────────────────────

export async function fetchEspecialidades(): Promise<Especialidad[]> {
  try {
    const res = await fetch(`${BASE_URL}/especialidades`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[API] fetchEspecialidades error:', error);
    return [];
  }
}

export async function fetchMedicos(idEspecialidad: string): Promise<Medico[]> {
  try {
    const { fechaInicio, fechaFin } = getDateRange();
    const url = `${BASE_URL}/medicos?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&idEspecialidad=${idEspecialidad}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[API] fetchMedicos error:', error);
    return [];
  }
}

export async function fetchCitas(
  idEspecialidad: string,
  medicoId: string,
  turnoConsulta: string,
): Promise<CitaSlot[]> {
  try {
    const { fechaInicio, fechaFin } = getDateRange();
    const url = `${BASE_URL}/citas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&medicoId=${medicoId}&turnoConsulta=${turnoConsulta}&idEspecialidad=${idEspecialidad}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[API] fetchCitas error:', error);
    return [];
  }
}

export async function fetchFechasConsultorios(
  idEspecialidad: string,
  turnoConsulta: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<FechaConsultorio[]> {
  try {
    const url = `${BASE_URL}/fechas-consultorios?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&turnoConsulta=${turnoConsulta}&idEspecialidad=${idEspecialidad}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('[API] fetchFechasConsultorios error:', error);
    return [];
  }
}

export async function submitSolicitud(
  payload: SolicitudPayload,
  token: string = '',
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const url = `${BASE_URL}/v1/solicitudes?token=${token}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }
    const data = await res.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('[API] submitSolicitud error:', error);
    return { success: false, error: error.message || 'Error al enviar solicitud' };
  }
}

// ── Helpers for payload mapping ──────────────────────────

export function mapPatientTypeToApi(patientType: string): string {
  const map: Record<string, string> = {
    SIS: 'SIS',
    SOAT: 'SOAT',
    PAGANTE: 'PAGANTE',
    Pagante: 'PAGANTE',
  };
  return map[patientType] || patientType;
}

export function getShiftFromTime(time: string): string {
  if (!time) return 'M';
  const hour = parseInt(time.split(':')[0], 10);
  return hour < 13 ? 'M' : 'T';
}

export function formatDateForApi(date: Date | string): string {
  if (typeof date === 'string') return date;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
