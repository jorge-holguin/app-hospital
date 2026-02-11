/**
 * Mock data for the hospital app
 */

export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
  email: string;
  ubigeo: string;
}

export interface Triage {
  talla: number;
  grupoSanguineo: string;
  peso: number;
  fecha: string;
  presionArterial: string;
  temperatura: number;
}

export type OrderStatus = 'ready' | 'process' | 'pending';

export interface Order {
  id: string;
  type: 'laboratorio' | 'rayos_x' | 'ecografia' | 'tomografia';
  title: string;
  date: string;
  status: OrderStatus;
}

export interface Reference {
  id: string;
  idReferencia: string;
  numeroReferencia: string;
  specialty: string;
  codigoEspecialidad: string;
  date: string;
  codigoEstado: string;
  status: string;
  hospital: string;
  diagnostico?: string;
  profesionalOrigen?: string;
}

export interface Appointment {
  id: string;
  codigo: string;
  specialty: string;
  doctor: string;
  date: string;
  time: string;
  status: 'PENDIENTE' | 'CITADO' | 'DENEGADO' | 'ELIMINADO' | 'EN_REVISION';
  tipoAtencion?: string;
  consultorio?: string;
  observacion?: string;
  lugar?: string;
}

export type PatientType = 'SIS' | 'PAGANTE' | 'SOAT';
export type AppointmentType = 'CITADO' | 'INTERCONSULTA' | 'TRAMITE';

export interface Specialty {
  idEspecialidad: string;
  nombre: string;
}

export interface Doctor {
  nombre: string;
  medicoId: string;
}

export interface TimeSlot {
  idCita: string;
  fecha: string;
  hora: string;
  turnoConsulta: string;
  consultorio: string;
  medico?: string;
  nombreMedico?: string;
  conSolicitud: boolean;
  estado: string;
  lugar?: string;
}

// ============================================================
// MOCK USER
// ============================================================
export const mockUser: User = {
  id: '1',
  username: 'vtsubasa',
  firstName: 'Jorge',
  lastName: 'Holguin Cucalon',
  documentType: 'DNI',
  documentNumber: '73101361',
  phone: '962273657',
  email: 'jorge.holguin1105@gmail.com',
  ubigeo: '150101',
};

// ============================================================
// MOCK TRIAGE
// ============================================================
export const mockTriage: Triage = {
  talla: 1.70,
  grupoSanguineo: 'A',
  peso: 77.5,
  fecha: '10/02/2026',
  presionArterial: '120/80',
  temperatura: 36.5,
};

// ============================================================
// MOCK ORDERS
// ============================================================
export const mockOrders: Order[] = [
  { id: 'lab-1', type: 'laboratorio', title: 'Hemograma completo', date: '10/02/2026', status: 'ready' },
  { id: 'lab-2', type: 'laboratorio', title: 'Glucosa en ayunas', date: '10/02/2026', status: 'ready' },
  { id: 'lab-3', type: 'laboratorio', title: 'Perfil lipídico', date: '10/02/2026', status: 'process' },
  { id: 'lab-4', type: 'laboratorio', title: 'Urea y creatinina', date: '10/02/2026', status: 'pending' },
  { id: 'lab-5', type: 'laboratorio', title: 'Examen de orina', date: '10/02/2026', status: 'pending' },
  { id: 'rx-1', type: 'rayos_x', title: 'Tórax PA', date: '05/02/2026', status: 'ready' },
  { id: 'rx-2', type: 'rayos_x', title: 'Columna lumbar', date: '05/02/2026', status: 'ready' },
  { id: 'rx-3', type: 'rayos_x', title: 'Rodilla AP/LAT', date: '05/02/2026', status: 'process' },
  { id: 'rx-4', type: 'rayos_x', title: 'Senos paranasales', date: '05/02/2026', status: 'pending' },
  { id: 'eco-1', type: 'ecografia', title: 'Ecografía abdominal', date: '08/02/2026', status: 'ready' },
  { id: 'eco-2', type: 'ecografia', title: 'Ecografía pélvica', date: '08/02/2026', status: 'process' },
  { id: 'eco-3', type: 'ecografia', title: 'Ecografía renal', date: '08/02/2026', status: 'pending' },
  { id: 'tomo-1', type: 'tomografia', title: 'Tomografía cerebral', date: '07/02/2026', status: 'ready' },
  { id: 'tomo-2', type: 'tomografia', title: 'Tomografía torácica', date: '07/02/2026', status: 'process' },
  { id: 'tomo-3', type: 'tomografia', title: 'Tomografía abdominal', date: '07/02/2026', status: 'pending' },
];

// ============================================================
// MOCK SPECIALTIES (from API: /v1/app-citas/especialidades)
// ============================================================
export const mockSpecialties: Specialty[] = [
  { idEspecialidad: '0001', nombre: 'Medicina Interna' },
  { idEspecialidad: '0003', nombre: 'Ginecología' },
  { idEspecialidad: '0006', nombre: 'Pediatría' },
  { idEspecialidad: '0010', nombre: 'Oftalmología' },
  { idEspecialidad: '0012', nombre: 'Psiquiatría' },
  { idEspecialidad: '0018', nombre: 'Dermatología' },
  { idEspecialidad: '0019', nombre: 'Cardiología' },
  { idEspecialidad: '0020', nombre: 'Neurología' },
  { idEspecialidad: '0022', nombre: 'Traumatología' },
  { idEspecialidad: '0002', nombre: 'Otorrinolaringología' },
  { idEspecialidad: '0025', nombre: 'Urología' },
  { idEspecialidad: '0030', nombre: 'Gastroenterología' },
];

// ============================================================
// MOCK DOCTORS (from API: /v1/app-citas/medicos)
// ============================================================
export const mockDoctors: Record<string, Doctor[]> = {
  '0019': [ // Cardiología
    { nombre: 'M001', medicoId: 'GARCIA LOPEZ, CARLOS ALBERTO' },
    { nombre: 'M002', medicoId: 'MARTINEZ RIOS, ANA MARIA' },
    { nombre: 'M003', medicoId: 'TORRES VASQUEZ, PEDRO JOSE' },
  ],
  '0001': [ // Medicina Interna
    { nombre: 'M004', medicoId: 'RODRIGUEZ SILVA, MARIA ELENA' },
    { nombre: 'M005', medicoId: 'CASTILLO PRADO, JUAN CARLOS' },
  ],
  '0020': [ // Neurología
    { nombre: 'M006', medicoId: 'HUAMAN QUISPE, ROSA ISABEL' },
    { nombre: 'M007', medicoId: 'SALAZAR MENDOZA, LUIS FERNANDO' },
  ],
  '0018': [ // Dermatología
    { nombre: 'M008', medicoId: 'PAREDES LEON, CARMEN JULIA' },
  ],
  '0006': [ // Pediatría
    { nombre: 'M009', medicoId: 'QUISPE MAMANI, JORGE LUIS' },
    { nombre: 'M010', medicoId: 'FLORES RAMOS, LUCIA BEATRIZ' },
  ],
};

// ============================================================
// MOCK TIME SLOTS (from API: /v1/app-citas/citas)
// ============================================================
export const mockTimeSlots: TimeSlot[] = [
  { idCita: 'C001', fecha: '2026-02-18', hora: '08:00', turnoConsulta: 'M', consultorio: '201', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C002', fecha: '2026-02-18', hora: '08:30', turnoConsulta: 'M', consultorio: '201', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C003', fecha: '2026-02-18', hora: '09:00', turnoConsulta: 'M', consultorio: '201', conSolicitud: true, estado: '1', lugar: '1' },
  { idCita: 'C004', fecha: '2026-02-18', hora: '09:30', turnoConsulta: 'M', consultorio: '201', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C005', fecha: '2026-02-18', hora: '10:00', turnoConsulta: 'M', consultorio: '201', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C006', fecha: '2026-02-18', hora: '10:30', turnoConsulta: 'M', consultorio: '201', conSolicitud: false, estado: '0', lugar: '1' },
  { idCita: 'C007', fecha: '2026-02-18', hora: '14:00', turnoConsulta: 'T', consultorio: '201', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C008', fecha: '2026-02-18', hora: '14:30', turnoConsulta: 'T', consultorio: '201', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C009', fecha: '2026-02-18', hora: '15:00', turnoConsulta: 'T', consultorio: '201', conSolicitud: true, estado: '1', lugar: '1' },
  { idCita: 'C010', fecha: '2026-02-19', hora: '08:00', turnoConsulta: 'M', consultorio: '202', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C011', fecha: '2026-02-19', hora: '08:30', turnoConsulta: 'M', consultorio: '202', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C012', fecha: '2026-02-19', hora: '09:00', turnoConsulta: 'M', consultorio: '202', conSolicitud: false, estado: '1', lugar: '1' },
  { idCita: 'C013', fecha: '2026-02-20', hora: '09:00', turnoConsulta: 'M', consultorio: '203', conSolicitud: false, estado: '1', lugar: '2' },
  { idCita: 'C014', fecha: '2026-02-20', hora: '09:30', turnoConsulta: 'M', consultorio: '203', conSolicitud: false, estado: '1', lugar: '2' },
  { idCita: 'C015', fecha: '2026-02-20', hora: '10:00', turnoConsulta: 'M', consultorio: '203', conSolicitud: false, estado: '1', lugar: '2' },
];

// ============================================================
// MOCK REFERENCES (from API: /referencia/consultar-referencias)
// ============================================================
export const mockReferences: Reference[] = [
  {
    id: 'ref-1', idReferencia: 'R001', numeroReferencia: 'REF-2026-0001',
    specialty: 'Cardiología', codigoEspecialidad: '0019',
    date: '15/01/2026', codigoEstado: '3', status: 'Aceptada',
    hospital: 'C.S. Santa Anita', diagnostico: 'Hipertensión arterial grado II',
    profesionalOrigen: 'Dr. Pérez Sánchez',
  },
  {
    id: 'ref-2', idReferencia: 'R002', numeroReferencia: 'REF-2026-0002',
    specialty: 'Neurología', codigoEspecialidad: '0020',
    date: '20/01/2026', codigoEstado: '2', status: 'Pendiente',
    hospital: 'C.S. Ate Vitarte', diagnostico: 'Cefalea crónica',
  },
  {
    id: 'ref-3', idReferencia: 'R003', numeroReferencia: 'REF-2026-0003',
    specialty: 'Traumatología', codigoEspecialidad: '0022',
    date: '12/01/2026', codigoEstado: '4', status: 'Rechazada',
    hospital: 'C.S. Chaclacayo',
  },
  {
    id: 'ref-4', idReferencia: 'R004', numeroReferencia: 'REF-2026-0004',
    specialty: 'Oftalmología', codigoEspecialidad: '0010',
    date: '05/02/2026', codigoEstado: '5', status: 'Recibido',
    hospital: 'C.S. Chosica', diagnostico: 'Miopía progresiva',
  },
  {
    id: 'ref-5', idReferencia: 'R005', numeroReferencia: 'REF-2026-0005',
    specialty: 'Dermatología', codigoEspecialidad: '0018',
    date: '01/02/2026', codigoEstado: '7', status: 'Citado',
    hospital: 'C.S. Ñaña',
  },
];

// ============================================================
// MOCK APPOINTMENT REQUESTS (from API: /v1/solicitudes)
// ============================================================
export const mockAppointments: Appointment[] = [
  {
    id: 'cita-1', codigo: 'SOL-2026-0001', specialty: 'Cardiología',
    doctor: 'Dr. García López', date: '18/02/2026', time: '09:00',
    status: 'CITADO', tipoAtencion: 'PAGANTE', consultorio: '201', lugar: '1',
  },
  {
    id: 'cita-2', codigo: 'SOL-2026-0002', specialty: 'Medicina Interna',
    doctor: 'Dra. Rodríguez Silva', date: '22/02/2026', time: '10:30',
    status: 'PENDIENTE', tipoAtencion: 'SIS', consultorio: '105',
  },
  {
    id: 'cita-3', codigo: 'SOL-2026-0003', specialty: 'Dermatología',
    doctor: 'Dra. Paredes León', date: '25/02/2026', time: '14:00',
    status: 'DENEGADO', tipoAtencion: 'PAGANTE',
    observacion: 'Cupo no disponible en la fecha solicitada',
  },
  {
    id: 'cita-4', codigo: 'SOL-2026-0004', specialty: 'Neurología',
    doctor: 'Dr. Salazar Mendoza', date: '28/02/2026', time: '08:00',
    status: 'PENDIENTE', tipoAtencion: 'SIS', consultorio: '302', lugar: '2',
  },
];

// ============================================================
// Reference status helpers (matching legacy getEstadoColor)
// ============================================================
export const getRefStatusConfig = (codigoEstado: string) => {
  switch (codigoEstado) {
    case '2': return { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente', canSchedule: false };
    case '3': return { bg: '#D1FAE5', text: '#065F46', label: 'Aceptada', canSchedule: true };
    case '4': return { bg: '#F3F4F6', text: '#6B7280', label: 'Rechazada', canSchedule: false };
    case '5': return { bg: '#DBEAFE', text: '#1E40AF', label: 'Recibido', canSchedule: true };
    case '7': return { bg: '#EDE9FE', text: '#5B21B6', label: 'Citado', canSchedule: true };
    case '8': return { bg: '#FEF3C7', text: '#92400E', label: 'Contrareferido', canSchedule: false };
    case '9': return { bg: '#FFEDD5', text: '#9A3412', label: 'Observada', canSchedule: false };
    case '6': return { bg: '#F3F4F6', text: '#374151', label: 'De Baja', canSchedule: false };
    default: return { bg: '#F3F4F6', text: '#6B7280', label: 'Desconocido', canSchedule: false };
  }
};

// ============================================================
// Appointment request status helpers (matching legacy getStatusConfig)
// ============================================================
export const getAppointmentStatusConfig = (status: string) => {
  switch (status) {
    case 'PENDIENTE': return { bg: '#FEF3C7', text: '#92400E', label: 'Pendiente', icon: 'time-outline' as const };
    case 'EN_REVISION': return { bg: '#DBEAFE', text: '#1E40AF', label: 'En Revisión', icon: 'eye-outline' as const };
    case 'CITADO': return { bg: '#D1FAE5', text: '#065F46', label: 'Citado', icon: 'checkmark-circle-outline' as const };
    case 'DENEGADO': return { bg: '#FFE4E6', text: '#9F1239', label: 'Denegado', icon: 'close-circle-outline' as const };
    case 'ELIMINADO': return { bg: '#F3F4F6', text: '#374151', label: 'Eliminado', icon: 'trash-outline' as const };
    default: return { bg: '#F3F4F6', text: '#6B7280', label: status, icon: 'help-circle-outline' as const };
  }
};
