import { HospitalColors } from '@/constants/theme';
import {
    CitaSlot, FechaConsultorio,
    fetchCitas, fetchFechasConsultorios, getMonthRange,
} from '@/services/citasApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';

type Shift = 'M' | 'T';

const SHIFTS: { key: Shift; label: string; icon: string }[] = [
  { key: 'M', label: 'Mañana', icon: '🌅' },
  { key: 'T', label: 'Tarde', icon: '🌇' },
];

const MORNING_INTERVALS = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '11:00 - 12:00', '12:00 - 13:00',
];
const AFTERNOON_INTERVALS = [
  '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00',
  '17:00 - 18:00', '18:00 - 19:00',
];

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const lastDay = new Date(year, month + 1, 0).getDate();
  const now = new Date(); now.setHours(0, 0, 0, 0);
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month, d);
    if (date > now && date.getDay() !== 0) days.push(date);
  }
  return days;
};

export default function SelectDateTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientType: string; appointmentType: string;
    specialtyId: string; specialtyName: string;
    searchBy: string; doctorName?: string; doctorCode?: string;
  }>();

  const isByDoctor = params.searchBy === 'doctor';

  const [selectedShift, setSelectedShift] = useState<Shift>('M');
  const [loading, setLoading] = useState(false);

  // ── By Doctor state ──
  const [doctorSlots, setDoctorSlots] = useState<CitaSlot[]>([]);

  // ── By Date state ──
  const [fechasData, setFechasData] = useState<FechaConsultorio[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<string | null>(null);

  const now = new Date();
  const availableDays = getDaysInMonth(now.getFullYear(), now.getMonth());

  // Build availability map for "by date" flow
  const availabilityMap = new Map<string, number>();
  fechasData.forEach((f) => {
    const dateKey = f.fecha.split(' ')[0]; // "2026-02-02 00:00:00.0" → "2026-02-02"
    const prev = availabilityMap.get(dateKey) || 0;
    availabilityMap.set(dateKey, prev + parseInt(f.totalDisponibles || '0', 10));
  });

  // ── Fetch for "by doctor" ──
  const loadDoctorSlots = useCallback(async () => {
    if (!isByDoctor || !params.doctorCode || !params.specialtyId) return;
    setLoading(true);
    const data = await fetchCitas(params.specialtyId, params.doctorCode, selectedShift);
    setDoctorSlots(data);
    setLoading(false);
  }, [isByDoctor, params.doctorCode, params.specialtyId, selectedShift]);

  // ── Fetch for "by date" ──
  const loadFechas = useCallback(async () => {
    if (isByDoctor || !params.specialtyId) return;
    setLoading(true);
    const { fechaInicio, fechaFin } = getMonthRange(now);
    const data = await fetchFechasConsultorios(params.specialtyId, selectedShift, fechaInicio, fechaFin);
    setFechasData(data);
    setLoading(false);
  }, [isByDoctor, params.specialtyId, selectedShift]);

  useEffect(() => {
    if (isByDoctor) loadDoctorSlots();
    else loadFechas();
  }, [selectedShift]);

  // Group doctor slots by date
  const slotsByDate = new Map<string, CitaSlot[]>();
  doctorSlots.forEach((s) => {
    const list = slotsByDate.get(s.fecha) || [];
    list.push(s);
    slotsByDate.set(s.fecha, list);
  });

  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : '';

  const slotsForSelectedDate = isByDoctor
    ? (slotsByDate.get(selectedDateKey) || [])
    : [];
  const availableSlots = slotsForSelectedDate.filter((s) => !s.conSolicitud && s.estado === '1');

  const timeIntervals = selectedShift === 'M' ? MORNING_INTERVALS : AFTERNOON_INTERVALS;

  // Navigate to confirmation
  const handleSelectSlot = (slot: CitaSlot) => {
    router.push({
      pathname: '/confirm-appointment',
      params: {
        patientType: params.patientType,
        appointmentType: params.appointmentType,
        specialtyId: params.specialtyId,
        specialtyName: params.specialtyName,
        doctorName: params.doctorName || slot.nombreMedico || 'Por asignar',
        doctorCode: params.doctorCode || slot.medico || '',
        date: slot.fecha,
        displayDate: selectedDate
          ? `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`
          : slot.fecha,
        time: slot.hora,
        shift: selectedShift,
        consultorio: slot.consultorio?.trim() || '',
        idCita: slot.citaId,
        lugar: slot.lugar || '',
        searchBy: params.searchBy,
      },
    });
  };

  const handleSelectInterval = (interval: string) => {
    setSelectedInterval(interval);
    // Navigate to confirm with interval info for "by date" flow
    router.push({
      pathname: '/confirm-appointment',
      params: {
        patientType: params.patientType,
        appointmentType: params.appointmentType,
        specialtyId: params.specialtyId,
        specialtyName: params.specialtyName,
        doctorName: 'Por asignar',
        doctorCode: '',
        date: selectedDateKey,
        displayDate: selectedDate
          ? `${DAY_NAMES[selectedDate.getDay()]} ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`
          : '',
        time: interval.split(' - ')[0],
        shift: selectedShift,
        consultorio: '',
        idCita: '',
        lugar: '',
        searchBy: params.searchBy,
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar Fecha y Hora</Text>
          <Text style={styles.subtitle}>{params.specialtyName}</Text>
          {params.doctorName && isByDoctor && (
            <Text style={styles.doctorLabel}>Dr(a). {params.doctorName}</Text>
          )}
          <View style={[styles.searchByChip, { backgroundColor: isByDoctor ? '#DBEAFE' : '#D1FAE5' }]}>
            <Text style={[styles.searchByText, { color: isByDoctor ? '#1E40AF' : '#065F46' }]}>
              {isByDoctor ? 'Búsqueda por Médico' : 'Búsqueda por Fecha'}
            </Text>
          </View>
        </View>

        {/* Shift selector */}
        <View style={styles.shiftRow}>
          {SHIFTS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.shiftBtn, selectedShift === s.key && styles.shiftBtnActive]}
              onPress={() => { setSelectedShift(s.key); setSelectedDate(null); setSelectedInterval(null); }}
              activeOpacity={0.7}
            >
              <Text style={styles.shiftIcon}>{s.icon}</Text>
              <Text style={[styles.shiftText, selectedShift === s.key && styles.shiftTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={HospitalColors.primary} />
            <Text style={styles.loadingText}>Cargando disponibilidad...</Text>
          </View>
        ) : (
          <>
            {/* Date selector */}
            <Text style={styles.sectionLabel}>Selecciona una fecha</Text>
            <FlatList
              data={availableDays}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => formatDateKey(item)}
              contentContainerStyle={styles.datesRow}
              renderItem={({ item }) => {
                const dk = formatDateKey(item);
                const isSelected = selectedDate && dk === selectedDateKey;
                // For "by date": check availability
                const avail = availabilityMap.get(dk);
                const hasAvailability = isByDoctor
                  ? slotsByDate.has(dk)
                  : (avail !== undefined && avail > 0);
                const noAvailability = !isByDoctor && avail !== undefined && avail === 0;

                return (
                  <TouchableOpacity
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardActive,
                      noAvailability && styles.dateCardUnavailable,
                      !isByDoctor && hasAvailability && !isSelected && styles.dateCardAvailable,
                    ]}
                    onPress={() => setSelectedDate(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dateDayName, isSelected && styles.dateTextActive, noAvailability && styles.dateTextUnavailable]}>
                      {DAY_NAMES[item.getDay()]}
                    </Text>
                    <Text style={[styles.dateDay, isSelected && styles.dateTextActive, noAvailability && styles.dateTextUnavailable]}>
                      {item.getDate()}
                    </Text>
                    <Text style={[styles.dateMonth, isSelected && styles.dateTextActive, noAvailability && styles.dateTextUnavailable]}>
                      {MONTH_NAMES[item.getMonth()]}
                    </Text>
                    {!isByDoctor && noAvailability && (
                      <View style={styles.unavailDot} />
                    )}
                    {!isByDoctor && hasAvailability && !isSelected && (
                      <View style={styles.availDot} />
                    )}
                  </TouchableOpacity>
                );
              }}
            />

            {/* ── BY DOCTOR: show time slots ── */}
            {isByDoctor && selectedDate && (
              <>
                <Text style={styles.sectionLabel}>
                  Horarios disponibles — {availableSlots.length} cupo{availableSlots.length !== 1 ? 's' : ''}
                </Text>
                {slotsForSelectedDate.length === 0 ? (
                  <View style={styles.emptySlots}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyText}>No hay horarios disponibles</Text>
                    <Text style={styles.emptySub}>Prueba con otra fecha o turno</Text>
                  </View>
                ) : (
                  <View style={styles.slotsGrid}>
                    {slotsForSelectedDate.map((slot) => {
                      const isAvailable = !slot.conSolicitud && slot.estado === '1';
                      return (
                        <TouchableOpacity
                          key={slot.citaId}
                          style={[styles.slotCard, !isAvailable && styles.slotCardDisabled]}
                          onPress={() => isAvailable && handleSelectSlot(slot)}
                          disabled={!isAvailable}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.slotTime, !isAvailable && styles.slotTimeDisabled]}>
                            {slot.hora}
                          </Text>
                          <Text style={[styles.slotConsultorio, !isAvailable && { color: HospitalColors.textLight }]}>
                            Cons. {slot.consultorio?.trim()}
                          </Text>
                          {!isAvailable && (
                            <Text style={styles.slotUnavailable}>No disponible</Text>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </>
            )}

            {/* ── BY DATE: show time intervals ── */}
            {!isByDoctor && selectedDate && (
              <>
                <Text style={styles.sectionLabel}>Selecciona un intervalo de hora</Text>
                <View style={styles.intervalsGrid}>
                  {timeIntervals.map((interval) => (
                    <TouchableOpacity
                      key={interval}
                      style={[styles.intervalCard, selectedInterval === interval && styles.intervalCardActive]}
                      onPress={() => handleSelectInterval(interval)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.intervalText, selectedInterval === interval && styles.intervalTextActive]}>
                        {interval}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {!selectedDate && (
              <View style={styles.emptySlots}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={styles.emptyText}>Selecciona una fecha</Text>
                <Text style={styles.emptySub}>
                  {isByDoctor
                    ? 'Elige un día del calendario para ver los horarios'
                    : 'Los días en azul tienen disponibilidad. Los rojos no.'}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingBottom: 40 },
  header: { paddingHorizontal: 20, marginBottom: 20 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: HospitalColors.primary, fontWeight: '500' },
  doctorLabel: { fontSize: 13, color: HospitalColors.textSecondary, marginTop: 4 },
  searchByChip: {
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 12, marginTop: 8,
  },
  searchByText: { fontSize: 11, fontWeight: '700' },
  shiftRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  shiftBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 12, padding: 14,
    borderWidth: 1.5, borderColor: HospitalColors.border, gap: 8,
  },
  shiftBtnActive: { borderColor: HospitalColors.primary, backgroundColor: HospitalColors.primarySoft },
  shiftIcon: { fontSize: 18 },
  shiftText: { fontSize: 15, fontWeight: '600', color: HospitalColors.textSecondary },
  shiftTextActive: { color: HospitalColors.primaryDark },
  sectionLabel: {
    fontSize: 14, fontWeight: '600', color: HospitalColors.textSecondary,
    paddingHorizontal: 20, marginBottom: 12,
  },
  datesRow: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  dateCard: {
    width: 64, paddingVertical: 12, borderRadius: 14, alignItems: 'center',
    backgroundColor: HospitalColors.white, borderWidth: 1, borderColor: HospitalColors.border,
  },
  dateCardActive: { backgroundColor: HospitalColors.primary, borderColor: HospitalColors.primary },
  dateCardAvailable: { borderColor: HospitalColors.primary, borderWidth: 2 },
  dateCardUnavailable: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  dateDayName: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', marginBottom: 4 },
  dateDay: { fontSize: 20, fontWeight: '700', color: HospitalColors.textPrimary },
  dateMonth: { fontSize: 11, color: HospitalColors.textLight, marginTop: 2 },
  dateTextActive: { color: HospitalColors.white },
  dateTextUnavailable: { color: '#DC2626' },
  availDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: HospitalColors.primary, marginTop: 4,
  },
  unavailDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#DC2626', marginTop: 4,
  },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 },
  slotCard: {
    width: '30%', backgroundColor: HospitalColors.white, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: HospitalColors.border,
  },
  slotCardDisabled: { backgroundColor: '#F9FAFB', borderColor: '#E5E7EB', opacity: 0.7 },
  slotTime: { fontSize: 16, fontWeight: '700', color: HospitalColors.textPrimary },
  slotTimeDisabled: { color: HospitalColors.textLight, textDecorationLine: 'line-through' },
  slotConsultorio: { fontSize: 10, color: HospitalColors.textLight, marginTop: 4 },
  slotUnavailable: { fontSize: 9, color: '#DC2626', fontWeight: '600', marginTop: 4 },
  intervalsGrid: { paddingHorizontal: 20, gap: 10 },
  intervalCard: {
    backgroundColor: HospitalColors.white, borderRadius: 12, padding: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: HospitalColors.border,
  },
  intervalCardActive: { borderColor: HospitalColors.primary, backgroundColor: HospitalColors.primarySoft },
  intervalText: { fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary },
  intervalTextActive: { color: HospitalColors.primaryDark },
  emptySlots: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary },
  emptySub: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4, textAlign: 'center' },
  loadingBox: { alignItems: 'center', paddingTop: 80 },
  loadingText: { fontSize: 14, color: HospitalColors.textLight, marginTop: 12 },
});
