import { getAppointmentStatusConfig, mockAppointments, mockUser } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function ConsultarSolicitudScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis Solicitudes de Cita</Text>
        <Text style={styles.subtitle}>
          Solicitudes de {mockUser.firstName} {mockUser.lastName} (DNI: {mockUser.documentNumber})
        </Text>
      </View>

      <Text style={styles.resultCount}>
        {mockAppointments.length} solicitud{mockAppointments.length !== 1 ? 'es' : ''} encontrada{mockAppointments.length !== 1 ? 's' : ''}
      </Text>

      {mockAppointments.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No tienes solicitudes registradas</Text>
          <Text style={styles.emptySub}>Tus solicitudes de cita aparecerán aquí</Text>
        </View>
      ) : (
        mockAppointments.map((apt) => {
          const statusCfg = getAppointmentStatusConfig(apt.status);
          const isExpanded = expandedId === apt.id;

          return (
            <TouchableOpacity
              key={apt.id}
              style={styles.aptCard}
              onPress={() => setExpandedId(isExpanded ? null : apt.id)}
              activeOpacity={0.7}
            >
              {/* Top row */}
              <View style={styles.cardTop}>
                <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
                  <Text style={[styles.badgeText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                </View>
                <Text style={styles.cardCode}>{apt.codigo}</Text>
              </View>

              {/* Specialty & doctor */}
              <Text style={styles.aptSpecialty}>{apt.specialty}</Text>
              <Text style={styles.aptDoctor}>{apt.doctor}</Text>

              {/* Date & time */}
              <View style={styles.dateTimeRow}>
                <Text style={styles.dateTimeIcon}>📅</Text>
                <Text style={styles.dateTimeText}>{apt.date} — {apt.time}hs</Text>
              </View>

              {/* Expanded details */}
              {isExpanded && (
                <View style={styles.expandedSection}>
                  {apt.tipoAtencion && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Tipo de Atención</Text>
                      <View style={[styles.typeChip, {
                        backgroundColor: apt.tipoAtencion === 'SIS' ? '#DBEAFE' :
                          apt.tipoAtencion === 'SOAT' ? '#EDE9FE' : '#D1FAE5',
                      }]}>
                        <Text style={[styles.typeChipText, {
                          color: apt.tipoAtencion === 'SIS' ? '#1E40AF' :
                            apt.tipoAtencion === 'SOAT' ? '#5B21B6' : '#065F46',
                        }]}>
                          {apt.tipoAtencion}
                        </Text>
                      </View>
                    </View>
                  )}

                  {apt.consultorio && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Consultorio</Text>
                      <Text style={styles.detailValue}>{apt.consultorio}</Text>
                    </View>
                  )}

                  {apt.observacion && (
                    <View style={[styles.observationBox, { borderLeftColor: statusCfg.text }]}>
                      <Text style={styles.observationLabel}>Observación</Text>
                      <Text style={styles.observationText}>{apt.observacion}</Text>
                    </View>
                  )}

                  {/* Status message */}
                  <View style={[styles.statusMsgBox, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusMsgText, { color: statusCfg.text }]}>
                      {apt.status === 'CITADO' && 'Tu cita ha sido otorgada. Debes llegar 30 min antes.'}
                      {apt.status === 'PENDIENTE' && 'Tu solicitud está siendo procesada. Te notificaremos pronto.'}
                      {apt.status === 'DENEGADO' && `Solicitud denegada: ${apt.observacion || 'Sin motivo especificado'}`}
                      {apt.status === 'ELIMINADO' && 'Esta solicitud ha sido eliminada del sistema.'}
                      {apt.status === 'EN_REVISION' && 'Tu solicitud está en revisión por nuestro equipo.'}
                    </Text>
                  </View>
                </View>
              )}

              <Text style={styles.expandHint}>{isExpanded ? '▲ Menos detalles' : '▼ Ver detalles'}</Text>
            </TouchableOpacity>
          );
        })
      )}
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
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary },
  emptySub: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  aptCard: {
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: HospitalColors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardCode: { fontSize: 11, color: HospitalColors.textLight, fontFamily: 'monospace' },
  aptSpecialty: { fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary },
  aptDoctor: { fontSize: 13, color: HospitalColors.textSecondary, marginTop: 2 },
  dateTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  dateTimeIcon: { fontSize: 14 },
  dateTimeText: { fontSize: 13, color: HospitalColors.textSecondary, fontWeight: '500' },
  expandHint: {
    fontSize: 12, color: HospitalColors.primary, fontWeight: '500',
    textAlign: 'center', marginTop: 12,
  },
  expandedSection: { marginTop: 14, borderTopWidth: 1, borderTopColor: HospitalColors.border, paddingTop: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  detailLabel: { fontSize: 12, color: HospitalColors.textLight, fontWeight: '600' },
  detailValue: { fontSize: 13, color: HospitalColors.textPrimary, fontWeight: '500' },
  typeChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  typeChipText: { fontSize: 11, fontWeight: '700' },
  observationBox: {
    borderLeftWidth: 3, paddingLeft: 12, marginBottom: 12, paddingVertical: 4,
  },
  observationLabel: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', marginBottom: 2 },
  observationText: { fontSize: 13, color: HospitalColors.textPrimary, lineHeight: 18 },
  statusMsgBox: { borderRadius: 10, padding: 12 },
  statusMsgText: { fontSize: 12, lineHeight: 18 },
});
