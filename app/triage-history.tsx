import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock triage history data
const TRIAGE_HISTORY = [
  { id: '1', fecha: '11/02/2026', talla: 1.70, peso: 78.2, presionArterial: '120/80', temperatura: 37.0, saturacion: 98, frecuenciaCardiaca: 76, frecuenciaRespiratoria: 15, imc: 27.1 },
  { id: '2', fecha: '11/02/2026', talla: 1.70, peso: 79.1, presionArterial: '118/78', temperatura: 36.8, saturacion: 97, frecuenciaCardiaca: 72, frecuenciaRespiratoria: 16, imc: 27.4 },
  { id: '3', fecha: '11/02/2026', talla: 1.70, peso: 80.5, presionArterial: '125/82', temperatura: 36.5, saturacion: 99, frecuenciaCardiaca: 80, frecuenciaRespiratoria: 14, imc: 27.9 },
  { id: '4', fecha: '11/02/2026', talla: 1.70, peso: 79.4, presionArterial: '122/80', temperatura: 37.2, saturacion: 98, frecuenciaCardiaca: 74, frecuenciaRespiratoria: 15, imc: 27.5 },
  { id: '5', fecha: '11/02/2026', talla: 1.70, peso: 79.5, presionArterial: '120/78', temperatura: 36.6, saturacion: 98, frecuenciaCardiaca: 78, frecuenciaRespiratoria: 16, imc: 27.5 },
  { id: '6', fecha: '11/02/2026', talla: 1.70, peso: 77.5, presionArterial: '119/79', temperatura: 36.5, saturacion: 99, frecuenciaCardiaca: 70, frecuenciaRespiratoria: 15, imc: 26.8 },
];

export default function TriageHistoryScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Historial Triaje</Text>
        <Text style={styles.subtitle}>Registro de tus signos vitales</Text>
      </View>

      {TRIAGE_HISTORY.map((triage) => (
        <TouchableOpacity
          key={triage.id}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/triage-detail',
              params: {
                id: triage.id,
                fecha: triage.fecha,
                talla: String(triage.talla),
                peso: String(triage.peso),
                presionArterial: triage.presionArterial,
                temperatura: String(triage.temperatura),
                saturacion: String(triage.saturacion),
                frecuenciaCardiaca: String(triage.frecuenciaCardiaca),
                frecuenciaRespiratoria: String(triage.frecuenciaRespiratoria),
                imc: String(triage.imc),
              },
            })
          }
          activeOpacity={0.7}
        >
          <View style={styles.cardRow}>
            <View style={styles.cardField}>
              <Text style={styles.fieldLabel}>Talla (CM)</Text>
              <Text style={styles.fieldValue}>{triage.talla.toFixed(2)}</Text>
            </View>
            <View style={styles.cardFieldCenter}>
              <Text style={styles.fieldDate}>{triage.fecha}</Text>
              <TouchableOpacity>
                <Text style={styles.verMas}>Ver más</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cardField}>
              <Text style={styles.fieldLabel}>Peso (KG)</Text>
              <Text style={[styles.fieldValue, { color: HospitalColors.accent }]}>{triage.peso}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
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
