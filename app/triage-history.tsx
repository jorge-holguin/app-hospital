import { HospitalColors } from '@/constants/theme';
import { getSignosVitales, mapTipoDocumentoForAtenciones, SignosVitales } from '@/services/signosVitalesApi';
import { SessionManager } from '@/utils/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TriageHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ triajes?: string }>();
  const [triajes, setTriajes] = useState<SignosVitales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // First try to use passed triajes from dashboard
      if (params.triajes) {
        const parsed = JSON.parse(params.triajes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTriajes(parsed);
          setLoading(false);
          return;
        }
      }

      // Otherwise fetch from API
      const userData = await SessionManager.getUserData();
      if (userData?.nroDocumento) {
        const tipoDoc = mapTipoDocumentoForAtenciones(userData.tipoDocumento);
        const data = await getSignosVitales(tipoDoc, userData.nroDocumento);
        setTriajes(data);
      }
    } catch (error) {
      console.error('Error loading triage history:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial Triaje</Text>
        <Text style={styles.subtitle}>Registro de tus signos vitales</Text>
      </View>

      {loading ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <ActivityIndicator size="large" color={HospitalColors.primary} />
          <Text style={{ fontSize: 14, color: HospitalColors.textLight, marginTop: 12 }}>Cargando historial...</Text>
        </View>
      ) : triajes.length === 0 ? (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
          <Text style={{ fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary }}>Sin historial de triaje</Text>
          <Text style={{ fontSize: 13, color: HospitalColors.textLight, marginTop: 4 }}>No se encontraron registros de signos vitales</Text>
        </View>
      ) : (
        triajes.map((triage, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: '/triage-detail',
                params: {
                  fecha: triage.fecha || 'Sin fecha',
                  talla: triage.talla || '',
                  peso: triage.peso || '',
                  presionArterial: triage.presion || '',
                  temperatura: triage.temperatura || '',
                  origen: triage.origen || '',
                  edad: triage.edad || '',
                },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardField}>
                <Text style={styles.fieldLabel}>Talla (CM)</Text>
                <Text style={styles.fieldValue}>{triage.talla || 'N/D'}</Text>
              </View>
              <View style={styles.cardFieldCenter}>
                <Text style={styles.fieldDate}>{triage.fecha || 'Sin fecha'}</Text>
                <TouchableOpacity>
                  <Text style={styles.verMas}>Ver más</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardField}>
                <Text style={styles.fieldLabel}>Peso (KG)</Text>
                <Text style={[styles.fieldValue, { color: HospitalColors.accent }]}>{triage.peso || 'N/D'}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 14, color: HospitalColors.textLight, marginTop: 4 },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: HospitalColors.border,
    elevation: 1, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  cardRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  cardField: { alignItems: 'center', flex: 1 },
  cardFieldCenter: { alignItems: 'center', flex: 1 },
  fieldLabel: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', marginBottom: 4 },
  fieldValue: { fontSize: 18, fontWeight: '700', color: HospitalColors.primary },
  fieldDate: { fontSize: 12, color: HospitalColors.textSecondary, fontWeight: '500', marginBottom: 4 },
  verMas: { fontSize: 12, color: HospitalColors.primary, fontWeight: '600', textDecorationLine: 'underline' },
});
