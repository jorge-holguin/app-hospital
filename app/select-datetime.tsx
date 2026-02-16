import { HospitalColors } from '@/constants/theme';
import {
    CitaSlot, FechaConsultorio,
    fetchCitas, fetchCitasPorFecha, fetchFechasConsultorios, getDateRange,
} from '@/services/citasApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
  { label: '08:00 - 09:00', start: '08:00', end: '09:00' },
  { label: '09:00 - 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 - 11:00', start: '10:00', end: '11:00' },
  { label: '11:00 - 12:00', start: '11:00', end: '12:00' },
  { label: '12:00 - 13:00', start: '12:00', end: '13:00' },
];
const AFTERNOON_INTERVALS = [
  { label: '14:00 - 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 - 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 - 17:00', start: '16:00', end: '17:00' },
  { label: '17:00 - 18:00', start: '17:00', end: '18:00' },
  { label: '18:00 - 19:00', start: '18:00', end: '19:00' },
];

const DAY_NAMES_SHORT = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const formatDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const todayKey = (() => {
  const n = new Date(); n.setHours(0,0,0,0); return formatDateKey(n);
})();

export default function SelectDateTimeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientType: string; appointmentType: string;
    specialtyId: string; specialtyName: string;
    searchBy: string; doctorName?: string; doctorCode?: string;
    sessionToken: string;
  }>();

  const isByDoctor = params.searchBy === 'doctor';

  const [selectedShift, setSelectedShift] = useState<Shift>('M');
  const [loading, setLoading] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // ── By Doctor state ──
  const [doctorSlots, setDoctorSlots] = useState<CitaSlot[]>([]);

  // ── By Date state ──
  const [fechasData, setFechasData] = useState<FechaConsultorio[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<{label:string;start:string;end:string} | null>(null);
  const [porFechaSlots, setPorFechaSlots] = useState<CitaSlot[]>([]);
  const [loadingPorFecha, setLoadingPorFecha] = useState(false);

  // Build availability maps
  const availabilityMap = new Map<string, number>();
  fechasData.forEach((f) => {
    const dateKey = f.fecha.split(' ')[0];
    const prev = availabilityMap.get(dateKey) || 0;
    availabilityMap.set(dateKey, prev + parseInt(f.totalDisponibles || '0', 10));
  });

  const slotsByDate = new Map<string, CitaSlot[]>();
  doctorSlots.forEach((s) => {
    const list = slotsByDate.get(s.fecha) || [];
    list.push(s);
    slotsByDate.set(s.fecha, list);
  });

  // Dates with programming but all occupied (by doctor)
  const programmedDates = new Set<string>();
  slotsByDate.forEach((slots, dateKey) => {
    programmedDates.add(dateKey);
  });

  const availableDoctorDates = new Set<string>();
  slotsByDate.forEach((slots, dateKey) => {
    if (slots.some(s => s.estado === '1')) availableDoctorDates.add(dateKey);
  });

  // ── Fetch ──
  const loadData = useCallback(async () => {
    if (!params.specialtyId) return;
    setLoading(true);
    setSelectedDate(null);
    setSelectedInterval(null);
    setPorFechaSlots([]);
    const { fechaInicio, fechaFin } = getDateRange();
    if (isByDoctor && params.doctorCode) {
      const data = await fetchCitas(params.specialtyId, params.doctorCode, selectedShift, fechaInicio, fechaFin);
      setDoctorSlots(data);
    } else if (!isByDoctor) {
      const data = await fetchFechasConsultorios(params.specialtyId, selectedShift, fechaInicio, fechaFin);
      setFechasData(data);
    }
    setLoading(false);
  }, [isByDoctor, params.doctorCode, params.specialtyId, selectedShift]);

  useEffect(() => { loadData(); }, [selectedShift]);

  // Fetch por-fecha when interval selected
  const handleSelectInterval = async (interval: {label:string;start:string;end:string}) => {
    if (!selectedDate || !params.specialtyId) return;
    setSelectedInterval(interval);
    setLoadingPorFecha(true);
    const data = await fetchCitasPorFecha(
      selectedDate, selectedShift, params.specialtyId, interval.start, interval.end,
    );
    setPorFechaSlots(data);
    setLoadingPorFecha(false);
  };

  // Navigate to confirmation
  const handleSelectSlot = (slot: CitaSlot) => {
    const dateObj = new Date(slot.fecha + 'T00:00:00');
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
        displayDate: `${DAY_NAMES[dateObj.getDay()]} ${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`,
        time: slot.hora,
        shift: selectedShift,
        consultorio: slot.consultorio?.trim() || '',
        idCita: slot.citaId,
        lugar: slot.lugar || '',
        searchBy: params.searchBy,
        sessionToken: params.sessionToken,
      },
    });
  };

  // ── Calendar rendering ──
  const firstDayOfMonth = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const canGoBack = (() => {
    const now = new Date();
    return calendarYear > now.getFullYear() || (calendarYear === now.getFullYear() && calendarMonth > now.getMonth());
  })();

  const goNextMonth = () => {
    if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
    else setCalendarMonth(calendarMonth + 1);
  };
  const goPrevMonth = () => {
    if (!canGoBack) return;
    if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
    else setCalendarMonth(calendarMonth - 1);
  };

  const getDayStatus = (day: number): 'available' | 'occupied' | 'gray' | 'past' => {
    const dk = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (dk <= todayKey) return 'past';
    const dateObj = new Date(calendarYear, calendarMonth, day);
    if (dateObj.getDay() === 0) return 'gray'; // Sundays

    if (isByDoctor) {
      if (availableDoctorDates.has(dk)) return 'available';
      if (programmedDates.has(dk)) return 'occupied';
      return 'gray';
    } else {
      const avail = availabilityMap.get(dk);
      if (avail === undefined) return 'gray';
      if (avail > 0) return 'available';
      return 'occupied';
    }
  };

  const slotsForDate = isByDoctor && selectedDate ? (slotsByDate.get(selectedDate) || []) : [];
  const availableSlotsCount = slotsForDate.filter(s => s.estado === '1').length;
  const timeIntervals = selectedShift === 'M' ? MORNING_INTERVALS : AFTERNOON_INTERVALS;

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
              onPress={() => { setSelectedShift(s.key); setSelectedDate(null); setSelectedInterval(null); setPorFechaSlots([]); }}
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
            {/* Calendar */}
            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity onPress={goPrevMonth} disabled={!canGoBack} style={{ opacity: canGoBack ? 1 : 0.3, padding: 8 }}>
                  <Text style={{ fontSize: 18, color: HospitalColors.primary }}>❮</Text>
                </TouchableOpacity>
                <Text style={styles.calendarTitle}>
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </Text>
                <TouchableOpacity onPress={goNextMonth} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 18, color: HospitalColors.primary }}>❯</Text>
                </TouchableOpacity>
              </View>

              {/* Day name headers */}
              <View style={styles.calendarRow}>
                {DAY_NAMES_SHORT.map((d, i) => (
                  <View key={i} style={styles.calendarCell}>
                    <Text style={styles.calendarDayHeader}>{d}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map((_, weekIdx) => (
                <View key={weekIdx} style={styles.calendarRow}>
                  {calendarDays.slice(weekIdx * 7, weekIdx * 7 + 7).map((day, idx) => {
                    if (day === null || day === undefined) {
                      return <View key={`e-${idx}`} style={styles.calendarCell} />;
                    }
                    const dk = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const status = getDayStatus(day);
                    const isSelected = selectedDate === dk;
                    const isDisabled = status === 'past' || status === 'gray';

                    let bgColor = 'transparent';
                    let textColor = HospitalColors.textPrimary;
                    let borderColor = 'transparent';

                    if (isSelected) {
                      bgColor = HospitalColors.primary;
                      textColor = '#fff';
                    } else if (status === 'available') {
                      bgColor = '#DBEAFE';
                      textColor = '#1E40AF';
                      borderColor = HospitalColors.primary;
                    } else if (status === 'occupied') {
                      bgColor = '#FEE2E2';
                      textColor = '#DC2626';
                    } else if (status === 'past' || status === 'gray') {
                      textColor = '#D1D5DB';
                    }

                    return (
                      <TouchableOpacity
                        key={dk}
                        style={[
                          styles.calendarCell,
                          { backgroundColor: bgColor, borderRadius: 10, borderWidth: borderColor !== 'transparent' ? 1.5 : 0, borderColor },
                        ]}
                        disabled={isDisabled}
                        onPress={() => { setSelectedDate(dk); setSelectedInterval(null); setPorFechaSlots([]); }}
                        activeOpacity={0.6}
                      >
                        <Text style={[styles.calendarDayText, { color: textColor, fontWeight: isSelected ? '700' : '500' }]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* Legend */}
              <View style={styles.legendRow}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#DBEAFE', borderWidth: 1, borderColor: HospitalColors.primary }]} /><Text style={styles.legendText}>Disponible</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#FEE2E2' }]} /><Text style={styles.legendText}>Ocupado</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} /><Text style={styles.legendText}>Sin programación</Text></View>
              </View>
            </View>

            {/* ── BY DOCTOR: show time slots ── */}
            {isByDoctor && selectedDate && (
              <>
                <Text style={styles.sectionLabel}>
                  Horarios disponibles — {availableSlotsCount} cupo{availableSlotsCount !== 1 ? 's' : ''}
                </Text>
                {slotsForDate.length === 0 ? (
                  <View style={styles.emptySlots}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyText}>No hay horarios disponibles</Text>
                    <Text style={styles.emptySub}>Prueba con otra fecha o turno</Text>
                  </View>
                ) : (
                  <View style={styles.slotsGrid}>
                    {slotsForDate.map((slot) => {
                      const isAvailable = slot.estado === '1';
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

            {/* ── BY DATE: show time intervals then results ── */}
            {!isByDoctor && selectedDate && (
              <>
                <Text style={styles.sectionLabel}>Selecciona un intervalo de hora</Text>
                <View style={styles.intervalsGrid}>
                  {timeIntervals.map((interval) => (
                    <TouchableOpacity
                      key={interval.label}
                      style={[styles.intervalCard, selectedInterval?.label === interval.label && styles.intervalCardActive]}
                      onPress={() => handleSelectInterval(interval)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.intervalText, selectedInterval?.label === interval.label && styles.intervalTextActive]}>
                        {interval.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Show por-fecha results */}
                {loadingPorFecha && (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="small" color={HospitalColors.primary} />
                    <Text style={styles.loadingText}>Buscando citas...</Text>
                  </View>
                )}

                {!loadingPorFecha && selectedInterval && porFechaSlots.length > 0 && (
                  <>
                    <Text style={[styles.sectionLabel, { marginTop: 16 }]}>
                      Citas disponibles
                    </Text>
                    <View style={styles.slotsGrid}>
                      {porFechaSlots.map((slot) => {
                        const isAvailable = slot.estado === '1';
                        return (
                          <TouchableOpacity
                            key={slot.citaId}
                            style={[styles.slotCard, { width: '46%' }, !isAvailable && styles.slotCardDisabled]}
                            onPress={() => isAvailable && handleSelectSlot(slot)}
                            disabled={!isAvailable}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.slotTime, !isAvailable && styles.slotTimeDisabled]}>
                              {slot.hora}
                            </Text>
                            <Text style={{ fontSize: 11, color: HospitalColors.textSecondary, marginTop: 2, textAlign: 'center' }} numberOfLines={1}>
                              {slot.nombreMedico || 'Médico'}
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
                  </>
                )}

                {!loadingPorFecha && selectedInterval && porFechaSlots.length === 0 && (
                  <View style={styles.emptySlots}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyText}>No hay citas en este intervalo</Text>
                    <Text style={styles.emptySub}>Prueba con otro horario o turno</Text>
                  </View>
                )}
              </>
            )}

            {!selectedDate && (
              <View style={styles.emptySlots}>
                <Text style={styles.emptyIcon}>👆</Text>
                <Text style={styles.emptyText}>Selecciona una fecha</Text>
                <Text style={styles.emptySub}>
                  {isByDoctor
                    ? 'Elige un día del calendario para ver los horarios'
                    : 'Los días en azul tienen disponibilidad. Los rojos están ocupados.'}
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
  calendarContainer: {
    backgroundColor: HospitalColors.white, borderRadius: 16, marginHorizontal: 20,
    padding: 16, marginBottom: 20, borderWidth: 1, borderColor: HospitalColors.border,
  },
  calendarHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  },
  calendarTitle: { fontSize: 16, fontWeight: '700', color: HospitalColors.textPrimary },
  calendarRow: { flexDirection: 'row' },
  calendarCell: {
    flex: 1, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', margin: 2,
  },
  calendarDayHeader: { fontSize: 12, fontWeight: '700', color: HospitalColors.textLight },
  calendarDayText: { fontSize: 14 },
  legendRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 12, paddingTop: 10,
    borderTopWidth: 1, borderTopColor: HospitalColors.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 12, height: 12, borderRadius: 4 },
  legendText: { fontSize: 10, color: HospitalColors.textLight },
  sectionLabel: {
    fontSize: 14, fontWeight: '600', color: HospitalColors.textSecondary,
    paddingHorizontal: 20, marginBottom: 12,
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
  loadingBox: { alignItems: 'center', paddingTop: 40 },
  loadingText: { fontSize: 14, color: HospitalColors.textLight, marginTop: 12 },
});
