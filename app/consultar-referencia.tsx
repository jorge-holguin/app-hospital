import { getRefStatusConfig } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import { consultarReferencias, mapTipoDocumentoToCode, ReferenciaItem } from '@/services/referenciasApi';
import { SessionManager, UserData } from '@/utils/session';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
  const [user, setUser] = useState<UserData | null>(null);
  const [references, setReferences] = useState<ReferenciaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await SessionManager.getUserData();
      setUser(userData);
      if (!userData?.nroDocumento) {
        setError('No se encontró su número de documento. Actualice su perfil.');
        setLoading(false);
        return;
      }
      const tipoDoc = mapTipoDocumentoToCode(userData.tipoDocumento);
      const data = await consultarReferencias(userData.nroDocumento, tipoDoc);
      setReferences(data);
    } catch (err: any) {
      console.error('Error fetching references:', err);
      setError('No se pudieron cargar las referencias. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  const userName = `${user?.nombres || ''} ${user?.apellidos || ''}`.trim();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Consultar Referencias</Text>
        <Text style={styles.subtitle}>Referencias médicas de {userName || 'Paciente'}</Text>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 60 }}>
          <ActivityIndicator size="large" color={HospitalColors.primary} />
          <Text style={{ fontSize: 14, color: HospitalColors.textLight, marginTop: 12 }}>Cargando referencias...</Text>
        </View>
      ) : error ? (
        <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>⚠️</Text>
          <Text style={{ fontSize: 15, color: HospitalColors.textSecondary, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity onPress={loadData} style={{ marginTop: 16, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: HospitalColors.primarySoft, borderRadius: 10 }}>
            <Text style={{ color: HospitalColors.primary, fontWeight: '600' }}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {references.length} referencia{references.length !== 1 ? 's' : ''} encontrada{references.length !== 1 ? 's' : ''}
          </Text>

          {references.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📄</Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary }}>No se encontraron referencias</Text>
              <Text style={{ fontSize: 13, color: HospitalColors.textLight, marginTop: 4 }}>No tiene referencias médicas registradas</Text>
            </View>
          ) : (
            references.map((ref, index) => {
              const codigoEstado = ref.codigoEstado || '2';
              const statusCfg = getRefStatusConfig(codigoEstado);
              const detail = REF_DETAIL_MAP[codigoEstado] || { title: 'Desconocido', desc: '', canSchedule: false };
              const refId = ref.id || ref.numeroReferencia || String(index);
              const isExpanded = expandedId === refId;

              return (
                <View key={refId} style={styles.refCard}>
                  <View style={styles.cardTop}>
                    <View style={styles.cardTopLeft}>
                      <View style={[styles.badge, { backgroundColor: statusCfg.bg }]}>
                        <Text style={[styles.badgeText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                      </View>
                      <Text style={styles.refDate}>{ref.fecha || ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setExpandedId(isExpanded ? null : refId)}>
                      <Text style={styles.expandBtn}>{isExpanded ? '▲ Ocultar' : '▼ Detalle'}</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.refSpecialty}>{ref.especialidadDestino || ref.especialidad || 'Especialidad'}</Text>
                  <Text style={styles.refHospital}>Origen: {ref.establecimientoOrigen || 'No especificado'}</Text>
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
            })
          )}
        </>
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
