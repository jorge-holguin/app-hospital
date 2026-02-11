import type { AppointmentType, PatientType } from '@/constants/mockData';
import { mockUser } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';

const PATIENT_TYPES: { key: PatientType; label: string; desc: string; color: string }[] = [
  { key: 'PAGANTE', label: 'Pagante', desc: 'Pagarás directamente por la consulta', color: HospitalColors.pagante },
  { key: 'SIS', label: 'SIS', desc: 'Seguro Integral de Salud', color: HospitalColors.sis },
  { key: 'SOAT', label: 'SOAT', desc: 'Seguro Obligatorio de Accidentes', color: HospitalColors.soat },
];

const APPOINTMENT_TYPES: { key: AppointmentType; label: string; desc: string }[] = [
  { key: 'CITADO', label: 'Citado', desc: 'Cita programada regular' },
  { key: 'INTERCONSULTA', label: 'Interconsulta', desc: 'Referencia de otro especialista' },
  { key: 'TRAMITE', label: 'Trámite Administrativo', desc: 'Gestiones administrativas (solo Pagante)' },
];

export default function SolicitudCitaScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [patientType, setPatientType] = useState<PatientType | null>(null);
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);

  const handleContinue = () => {
    if (step === 1 && patientType) {
      setStep(2);
    } else if (step === 2 && appointmentType) {
      router.push({
        pathname: '/select-specialty',
        params: { patientType, appointmentType },
      });
    }
  };

  const canContinue = step === 1 ? !!patientType : !!appointmentType;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => step === 2 ? setStep(1) : router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Solicitud de Cita</Text>
          <Text style={styles.subtitle}>Paso {step} de 2</Text>
        </View>

        {/* Progress */}
        <View style={styles.progress}>
          <View style={[styles.progressDot, styles.progressDotActive]} />
          <View style={[styles.progressLine, step === 2 && styles.progressLineActive]} />
          <View style={[styles.progressDot, step === 2 && styles.progressDotActive]} />
        </View>

        {/* Patient info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Paciente</Text>
          <Text style={styles.infoValue}>{mockUser.firstName} {mockUser.lastName}</Text>
          <Text style={styles.infoSub}>DNI: {mockUser.documentNumber}</Text>
        </View>

        {step === 1 ? (
          <>
            <Text style={styles.sectionTitle}>Tipo de Atención</Text>
            <Text style={styles.sectionSub}>Selecciona cómo deseas ser atendido</Text>

            {/* SIS Warning */}
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Si eres paciente <Text style={{ fontWeight: '700' }}>SIS</Text>, selecciona "SIS". De lo contrario tu solicitud será rechazada.
              </Text>
            </View>

            {PATIENT_TYPES.map((pt) => {
              const selected = patientType === pt.key;
              return (
                <TouchableOpacity
                  key={pt.key}
                  style={[styles.optionCard, selected && { borderColor: pt.color, backgroundColor: pt.color + '08' }]}
                  onPress={() => setPatientType(pt.key)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionRadio, selected && { borderColor: pt.color }]}>
                    {selected && <View style={[styles.optionRadioDot, { backgroundColor: pt.color }]} />}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, selected && { color: pt.color }]}>{pt.label}</Text>
                    <Text style={styles.optionDesc}>{pt.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Tipo de Cita</Text>
            <Text style={styles.sectionSub}>Elige el tipo de cita médica</Text>

            <View style={styles.chipRow}>
              <View style={[styles.chip, { backgroundColor: (PATIENT_TYPES.find(p => p.key === patientType)?.color || HospitalColors.primary) + '18' }]}>
                <Text style={[styles.chipText, { color: PATIENT_TYPES.find(p => p.key === patientType)?.color }]}>
                  {patientType}
                </Text>
              </View>
            </View>

            {APPOINTMENT_TYPES.map((at) => {
              const selected = appointmentType === at.key;
              const disabled = at.key === 'TRAMITE' && patientType !== 'PAGANTE';
              return (
                <TouchableOpacity
                  key={at.key}
                  style={[
                    styles.optionCard,
                    selected && { borderColor: HospitalColors.primary, backgroundColor: HospitalColors.primarySoft },
                    disabled && { opacity: 0.4 },
                  ]}
                  onPress={() => !disabled && setAppointmentType(at.key)}
                  activeOpacity={disabled ? 1 : 0.7}
                  disabled={disabled}
                >
                  <View style={[styles.optionRadio, selected && { borderColor: HospitalColors.primary }]}>
                    {selected && <View style={[styles.optionRadioDot, { backgroundColor: HospitalColors.primary }]} />}
                  </View>
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, selected && { color: HospitalColors.primary }]}>{at.label}</Text>
                    <Text style={styles.optionDesc}>{at.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            {appointmentType === 'TRAMITE' && (
              <View style={[styles.warningBox, { borderColor: HospitalColors.sis, backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.warningText, { color: '#1E40AF' }]}>
                  Trámites administrativos son únicamente como <Text style={{ fontWeight: '700' }}>PAGANTE</Text>.
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Fixed footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 100 },
  header: { marginBottom: 16 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  progress: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 40 },
  progressDot: {
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: HospitalColors.border,
  },
  progressDotActive: { backgroundColor: HospitalColors.primary },
  progressLine: { flex: 1, height: 2, backgroundColor: HospitalColors.border, marginHorizontal: 8 },
  progressLineActive: { backgroundColor: HospitalColors.primary },
  infoBox: {
    backgroundColor: HospitalColors.white, borderRadius: 12, padding: 14,
    marginBottom: 24, borderWidth: 1, borderColor: HospitalColors.border,
  },
  infoLabel: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600', color: HospitalColors.textPrimary },
  infoSub: { fontSize: 12, color: HospitalColors.textLight, marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: HospitalColors.textSecondary, marginBottom: 16 },
  warningBox: {
    borderWidth: 1, borderColor: '#FBBF24', backgroundColor: '#FFFBEB',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  warningText: { fontSize: 13, color: '#92400E', lineHeight: 18 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1.5, borderColor: HospitalColors.border,
  },
  optionRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    borderColor: HospitalColors.border, justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  optionRadioDot: { width: 12, height: 12, borderRadius: 6 },
  optionText: { flex: 1 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary },
  optionDesc: { fontSize: 12, color: HospitalColors.textLight, marginTop: 2 },
  chipRow: { flexDirection: 'row', marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  chipText: { fontSize: 12, fontWeight: '700' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, backgroundColor: HospitalColors.white,
    borderTopWidth: 1, borderTopColor: HospitalColors.border,
  },
  continueBtn: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueBtnText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
});
