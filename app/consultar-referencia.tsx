import { getRefStatusConfig, mockReferences, mockUser } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text, TouchableOpacity,
    View,
} from 'react-native';

const REF_DETAIL_MAP: Record<string, { title: string; desc: string; canSchedule: boolean }> = {
  '2': { title: 'Referencia en revisión', desc: 'La Unidad de Referencias tiene un plazo de 3 días hábiles para verificar su referencia.', canSchedule: false },
  '3': { title: 'Referencia aprobada', desc: 'Su referencia ha sido aceptada. Puede solicitar su cita.', canSchedule: true },
  '4': { title: 'Referencia rechazada', desc: 'Acérquese a su establecimiento de origen para mayor información.', canSchedule: false },
  '5': { title: 'Paciente recibido', desc: 'Su referencia fue recibida. Puede solicitar su cita.', canSchedule: true },
  '7': { title: 'Referencia con cita previa', desc: 'Ya fue utilizada para agendar una cita. Puede reutilizarla.', canSchedule: true },
  '8': { title: 'Contrareferido', desc: 'Fue contrareferida a su establecimiento de origen.', canSchedule: false },
  '9': { title: 'Referencia observada', desc: 'Presenta observaciones. Acérquese a su establecimiento de origen.', canSchedule: false },
  '6': { title: 'Referencia dada de baja', desc: 'No se encuentra activa.', canSchedule: false },
};

export default function ConsultarReferenciaScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Consultar Referencias</Text>
        <Text style={styles.subtitle}>Referencias médicas de {mockUser.firstName} {mockUser.lastName}</Text>
      </View>

      <Text style={styles.resultCount}>
        {mockReferences.length} referencia{mockReferences.length !== 1 ? 's' : ''} encontrada{mockReferences.length !== 1 ? 's' : ''}
      </Text>

      {mockReferences.map((ref) => {
        const statusCfg = getRefStatusConfig(ref.codigoEstado);
        const detail = REF_DETAIL_MAP[ref.codigoEstado] || { title: 'Desconocido', desc: '', canSchedule: false };
        const isExpanded = expandedId === ref.id;

        return (
          <View key={ref.id} style={styles.refCard}>
            <View style={styles.cardTop}>
              <View style={styles.cardTopLeft}>
                <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
                  <Text style={[styles.badgeText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                </View>
                <Text style={styles.refDate}>{ref.date}</Text>
              </View>
              <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : ref.id)}>
                <Text style={styles.expandBtn}>{isExpanded ? '▲ Ocultar' : '▼ Detalle'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.refSpecialty}>{ref.specialty}</Text>
            <Text style={styles.refHospital}>Origen: {ref.hospital}</Text>
            {ref.numeroReferencia && (
              <Text style={styles.refNumber}>N° Ref: {ref.numeroReferencia}</Text>
            )}

            {isExpanded && (
              <View style={styles.expandedSection}>
                <View style={[styles.detailBox, { borderLeftColor: statusCfg.text }]}>
                  <Text style={styles.detailTitle}>{detail.title}</Text>
                  <Text style={styles.detailDesc}>{detail.desc}</Text>
                </View>

                {ref.diagnostico && (
                  <View style={styles.diagBox}>
                    <Text style={styles.diagLabel}>Diagnóstico</Text>
                    <Text style={styles.diagValue}>{ref.diagnostico}</Text>
                  </View>
                )}

                {ref.profesionalOrigen && (
                  <Text style={styles.profOrigen}>Profesional: {ref.profesionalOrigen}</Text>
                )}

                {detail.canSchedule && (
                  <TouchableOpacity
                    style={styles.scheduleBtn}
                    onPress={() => router.push('/solicitud-cita')}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.scheduleBtnText}>Solicitar Cita</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 16 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  resultCount: { fontSize: 12, color: HospitalColors.textLight, marginBottom: 12 },
  refCard: {
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: HospitalColors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  refDate: { fontSize: 11, color: HospitalColors.textLight },
  expandBtn: { fontSize: 12, color: HospitalColors.primary, fontWeight: '500' },
  refSpecialty: { fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary, marginBottom: 2 },
  refHospital: { fontSize: 12, color: HospitalColors.textSecondary },
  refNumber: { fontSize: 11, color: HospitalColors.textLight, marginTop: 4 },
  expandedSection: { marginTop: 14, borderTopWidth: 1, borderTopColor: HospitalColors.border, paddingTop: 14 },
  detailBox: { borderLeftWidth: 3, paddingLeft: 12, marginBottom: 12 },
  detailTitle: { fontSize: 14, fontWeight: '600', color: HospitalColors.textPrimary, marginBottom: 4 },
  detailDesc: { fontSize: 13, color: HospitalColors.textSecondary, lineHeight: 18 },
  diagBox: {
    backgroundColor: HospitalColors.inputBg, borderRadius: 10, padding: 12, marginBottom: 10,
    borderWidth: 1, borderColor: HospitalColors.border,
  },
  diagLabel: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', marginBottom: 4 },
  diagValue: { fontSize: 13, color: HospitalColors.textPrimary },
  profOrigen: { fontSize: 12, color: HospitalColors.textSecondary, marginBottom: 12 },
  scheduleBtn: {
    backgroundColor: HospitalColors.primary, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  scheduleBtnText: { color: HospitalColors.white, fontSize: 14, fontWeight: '700' },
});
