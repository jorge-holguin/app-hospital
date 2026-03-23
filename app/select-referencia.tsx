import { HospitalColors } from '@/constants/theme';
import { consultarReferencias, mapTipoDocumentoToCode, ReferenciaItem } from '@/services/referenciasApi';
import { SessionManager } from '@/utils/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Estado mapping basado en codigoEstado (números) con colores, iconos y descripciones
interface EstadoInfo {
  color: string;
  bgColor: string;
  label: string;
  canSelect: boolean;
  icon: string;
  title: string;
  description: string;
}

const ESTADO_MAP: Record<string, EstadoInfo> = {
  '2': {
    color: '#8A0016', bgColor: '#FEF2F2', label: 'Pendiente', canSelect: false,
    icon: '⏳', title: 'Referencia en revisión',
    description: 'La Unidad de Referencias del Hospital de Chosica cuenta con un plazo de 3 días hábiles para verificar su referencia.',
  },
  '3': {
    color: '#12AC26', bgColor: '#E6F7EB', label: 'Aceptada', canSelect: true,
    icon: '✅', title: 'Referencia aprobada',
    description: 'Su referencia ha sido aceptada. Puede solicitar su cita a través de este sistema.',
  },
  '4': {
    color: '#6A6A6A', bgColor: '#F3F4F6', label: 'Rechazada', canSelect: false,
    icon: '❌', title: 'Referencia rechazada',
    description: 'Su referencia fue rechazada. Acérquese a su establecimiento de origen para más información.',
  },
  '5': {
    color: '#1D73E5', bgColor: '#EFF6FF', label: 'Recibido', canSelect: true,
    icon: '✅', title: 'Paciente recibido',
    description: 'Su referencia fue recibida por el hospital. Puede solicitar su cita a través de este sistema.',
  },
  '7': {
    color: '#8A4BAF', bgColor: '#F3E8FF', label: 'Citado', canSelect: true,
    icon: '📅', title: 'Referencia con cita previa',
    description: 'Esta referencia ya fue utilizada para agendar una cita. Puede reutilizarla si continúa en tratamiento.',
  },
  '8': {
    color: '#D1B21F', bgColor: '#FEF9C3', label: 'Contrareferido', canSelect: false,
    icon: '↩️', title: 'Contrareferido',
    description: 'Su atención fue contrareferida a su establecimiento de origen. Acérquese a su posta para continuar.',
  },
  '9': {
    color: '#F4A33B', bgColor: '#FEF3C7', label: 'Observada', canSelect: false,
    icon: '⚠️', title: 'Referencia observada',
    description: 'Su referencia presenta observaciones que deben ser corregidas. Acérquese a su establecimiento de origen.',
  },
  '6': {
    color: '#4D4D4D', bgColor: '#F3F4F6', label: 'De Baja', canSelect: false,
    icon: '🚫', title: 'Referencia dada de baja',
    description: 'Esta referencia fue dada de baja y no se encuentra activa.',
  },
};

const DEFAULT_ESTADO: EstadoInfo = {
  color: '#6B7280', bgColor: '#F3F4F6', label: 'Desconocido', canSelect: false,
  icon: '❓', title: 'Estado desconocido',
  description: 'No se pudo determinar el estado de esta referencia. Acérquese al hospital para más información.',
};

export default function SelectReferenciaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientType: string;
    appointmentType: string;
    sessionToken: string;
  }>();

  const [loading, setLoading] = useState(true);
  const [referencias, setReferencias] = useState<ReferenciaItem[]>([]);
  const [selectedRef, setSelectedRef] = useState<ReferenciaItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReferencias();
  }, []);

  const loadReferencias = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await SessionManager.getUserData();
      if (!userData?.nroDocumento || !userData?.tipoDocumento) {
        setError('No se encontró información del documento. Por favor, actualice su perfil.');
        setLoading(false);
        return;
      }

      const tipoDocCodigo = mapTipoDocumentoToCode(userData.tipoDocumento);
      const result = await consultarReferencias(userData.nroDocumento, tipoDocCodigo);

      // Ordenar por fecha (más recientes primero)
      const sorted = result.sort((a, b) => {
        const dateA = new Date(a.fecha || '1900-01-01');
        const dateB = new Date(b.fecha || '1900-01-01');
        return dateB.getTime() - dateA.getTime();
      });

      setReferencias(sorted);
    } catch (err: any) {
      console.error('Error loading referencias:', err);
      // No bloquear el flujo - permitir continuar sin referencias
      setReferencias([]);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoInfo = (codigoEstado: string): EstadoInfo => {
    return ESTADO_MAP[codigoEstado] || DEFAULT_ESTADO;
  };

  const handleSelectRef = (ref: ReferenciaItem) => {
    const estadoInfo = getEstadoInfo(ref.codigoEstado);
    
    if (!estadoInfo.canSelect) {
      if (ref.codigoEstado === '2') {
        Alert.alert(
          'Referencia Pendiente',
          'Esta referencia está en revisión. El hospital tiene hasta 72 horas para aprobar o denegar su referencia.\n\nPor favor, intente más tarde.',
          [{ text: 'Entendido' }]
        );
      } else {
        Alert.alert(
          'Referencia no válida',
          `Esta referencia está en estado "${estadoInfo.label}" y no permite agendar citas. Solo puede usar referencias Aceptadas, Recibidas o Citadas.`,
          [{ text: 'Entendido' }]
        );
      }
      return;
    }
    
    setSelectedRef(ref);
  };

  const handleContinue = () => {
    // Permitir continuar sin referencia seleccionada
    router.push({
      pathname: '/select-specialty',
      params: {
        patientType: params.patientType,
        appointmentType: params.appointmentType,
        sessionToken: params.sessionToken,
        referenciaId: selectedRef?.idReferencia || selectedRef?.numeroReferencia || '',
        referenciaEspecialidad: selectedRef?.especialidad || selectedRef?.especialidadDestino || '',
        referenciaEstablecimiento: selectedRef?.establecimientoOrigen || '',
      },
    });
  };

  const handleNoReference = () => {
    Alert.alert(
      'Referencia no encontrada',
      'Si no encuentra su referencia, debe comunicarse con su posta o establecimiento de salud de origen para que la ingresen al sistema.\n\nUna vez ingresada, podrá visualizarla en esta aplicación.',
      [{ text: 'Entendido' }]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={HospitalColors.primary} />
        <Text style={styles.loadingText}>Cargando referencias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Seleccionar Referencia</Text>
          <Text style={styles.subtitle}>
            Como paciente SIS, debe seleccionar una referencia vigente para continuar
          </Text>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Text style={{ fontSize: 16, marginBottom: 4 }}>ℹ️</Text>
          <Text style={styles.infoText}>
            Solo puede solicitar cita con referencias en estado <Text style={{ fontWeight: '700', color: '#059669' }}>ACEPTADA</Text> o <Text style={{ fontWeight: '700', color: '#2563EB' }}>CITADA</Text>.
          </Text>
        </View>

        {error ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>⚠️ No se pudieron cargar las referencias. Puede continuar sin referencia o intentar nuevamente.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadReferencias}>
              <Text style={styles.retryBtnText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : referencias.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 48, marginBottom: 16 }}>📋</Text>
            <Text style={styles.emptyTitle}>No tiene referencias activas</Text>
            <Text style={styles.emptyText}>
              No se encontraron referencias asociadas a su documento. Puede continuar con su solicitud de cita.
            </Text>
            <TouchableOpacity style={styles.helpBtn} onPress={handleNoReference}>
              <Text style={styles.helpBtnText}>¿Qué debo hacer?</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Sus Referencias ({referencias.length})</Text>
            
            {referencias.map((ref, index) => {
              const estadoInfo = getEstadoInfo(ref.codigoEstado);
              const refId = ref.idReferencia || ref.numeroReferencia;
              const isSelected = (selectedRef?.idReferencia || selectedRef?.numeroReferencia) === refId;
              const isDisabled = !estadoInfo.canSelect;

              return (
                <TouchableOpacity
                  key={refId || index}
                  style={[
                    styles.refCard,
                    isSelected && styles.refCardSelected,
                    isDisabled && styles.refCardDisabled,
                  ]}
                  onPress={() => handleSelectRef(ref)}
                  activeOpacity={0.7}
                >
                  {/* Especialidad destacada */}
                  <View style={styles.especialidadRow}>
                    <Text style={[styles.especialidadText, isDisabled && { color: HospitalColors.textLight }]}>
                      {ref.especialidad || 'Especialidad no especificada'}
                    </Text>
                    <View style={[styles.stateBadge, { backgroundColor: estadoInfo.bgColor }]}>
                      <Text style={[styles.stateBadgeText, { color: estadoInfo.color }]}>
                        {estadoInfo.label}
                      </Text>
                    </View>
                  </View>

                  {/* Detalles */}
                  <View style={styles.refDetails}>
                    <Text style={styles.refDetailText}>
                      <Text style={styles.refDetailLabel}>Origen: </Text>
                      {ref.establecimientoOrigen || 'No especificado'}
                    </Text>
                    <Text style={styles.refDetailText}>
                      <Text style={styles.refDetailLabel}>Fecha: </Text>
                      {ref.fecha || 'No especificada'}
                    </Text>
                    {ref.diagnostico && (
                      <Text style={styles.refDetailText} numberOfLines={2}>
                        <Text style={styles.refDetailLabel}>Diagnóstico: </Text>
                        {ref.diagnostico}
                      </Text>
                    )}
                  </View>

                  {/* Indicador de selección */}
                  {estadoInfo.canSelect && (
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  )}

                  {/* Mensaje para pendientes */}
                  {(ref.estado || ref.codigoEstado || '').toUpperCase().includes('PENDIENTE') && (
                    <Text style={styles.pendingNote}>
                      ⏳ En revisión (hasta 72 horas)
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={styles.helpLink} onPress={handleNoReference}>
              <Text style={styles.helpLinkText}>¿No encuentra su referencia?</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, !selectedRef && referencias.length > 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!selectedRef && referencias.length > 0}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>
            {selectedRef ? 'Continuar' : referencias.length > 0 ? 'Seleccione una referencia' : 'Continuar sin referencia'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 120 },
  header: { marginBottom: 20 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 13, color: HospitalColors.textSecondary, marginTop: 6, lineHeight: 18 },
  loadingText: { fontSize: 14, color: HospitalColors.textLight, marginTop: 12 },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  infoText: { flex: 1, fontSize: 13, color: '#1E40AF', lineHeight: 18 },
  errorBox: { alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, color: '#DC2626', textAlign: 'center', marginBottom: 16 },
  warningBox: { alignItems: 'center', padding: 24, backgroundColor: '#FFFBEB', borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#FCD34D' },
  warningText: { fontSize: 14, color: '#92400E', textAlign: 'center', marginBottom: 16 },
  retryBtn: { backgroundColor: HospitalColors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  retryBtnText: { color: HospitalColors.white, fontWeight: '600', fontSize: 14 },
  emptyBox: { alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 8 },
  emptyText: { fontSize: 14, color: HospitalColors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  helpBtn: { backgroundColor: HospitalColors.primarySoft, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  helpBtnText: { color: HospitalColors.primaryDark, fontWeight: '600', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 12 },
  refCard: {
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 12, borderWidth: 1.5, borderColor: HospitalColors.border,
    position: 'relative',
  },
  refCardSelected: { borderColor: HospitalColors.primary, backgroundColor: HospitalColors.primarySoft + '30' },
  refCardDisabled: { opacity: 0.7 },
  especialidadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  especialidadText: { flex: 1, fontSize: 16, fontWeight: '700', color: HospitalColors.textPrimary, marginRight: 10 },
  stateBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  stateBadgeText: { fontSize: 11, fontWeight: '700' },
  refDetails: { gap: 4 },
  refDetailText: { fontSize: 13, color: HospitalColors.textSecondary },
  refDetailLabel: { fontWeight: '600', color: HospitalColors.textPrimary },
  radioOuter: {
    position: 'absolute', top: 16, right: 16,
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: HospitalColors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  radioOuterSelected: { borderColor: HospitalColors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: HospitalColors.primary },
  pendingNote: { fontSize: 11, color: '#D97706', marginTop: 8, fontStyle: 'italic' },
  helpLink: { alignItems: 'center', marginTop: 8, marginBottom: 20 },
  helpLinkText: { fontSize: 14, color: HospitalColors.primary, fontWeight: '500' },
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
