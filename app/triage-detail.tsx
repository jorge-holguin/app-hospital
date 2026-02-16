import { HospitalColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TriageDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    fecha: string;
    talla: string;
    peso: string;
    presionArterial: string;
    temperatura: string;
    saturacion: string;
    frecuenciaCardiaca: string;
    frecuenciaRespiratoria: string;
    imc: string;
  }>();

  const vitals = [
    {
      label: 'Frecuencia Cardíaca',
      value: params.frecuenciaCardiaca || '76',
      unit: 'lpm',
      icon: '❤️',
      color: '#DC2626',
    },
    {
      label: 'Frecuencia Respiratoria',
      value: params.frecuenciaRespiratoria || '15',
      unit: 'rpm',
      icon: '🫁',
      color: '#2563EB',
    },
    {
      label: 'Temperatura (C°)',
      value: params.temperatura || '37.5',
      unit: '°C',
      icon: '🌡️',
      color: '#D97706',
    },
    {
      label: 'Presión Arterial',
      value: params.presionArterial || '120/80',
      unit: 'mmHg',
      icon: '💓',
      color: '#7C3AED',
    },
    {
      label: 'Peso (Kg)',
      value: params.peso || '78.2',
      unit: 'Kg',
      icon: '⚖️',
      color: HospitalColors.accent,
    },
    {
      label: 'Talla (cm)',
      value: params.talla || '1.70',
      unit: 'Cm',
      icon: '📏',
      color: HospitalColors.primary,
    },
    {
      label: 'Índice de Masa Corporal',
      value: params.imc || '27.1',
      unit: 'kg/m2',
      icon: '📊',
      color: '#059669',
    },
    {
      label: 'Saturación O₂',
      value: params.saturacion || '98',
      unit: '%',
      icon: '💨',
      color: '#0891B2',
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SIGNOS VITALES</Text>
        <Text style={styles.subtitle}>Triaje del {params.fecha}</Text>
      </View>

      {/* Main vital - Heart Rate */}
      <View style={styles.mainVitalCard}>
        <Text style={{ fontSize: 28 }}>❤️</Text>
        <Text style={styles.mainVitalLabel}>Frecuencia Cardíaca</Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={styles.mainVitalValue}>{params.frecuenciaCardiaca || '76'}</Text>
          <Text style={styles.mainVitalUnit}> lpm</Text>
        </View>
      </View>

      {/* Vital signs grid */}
      <View style={styles.grid}>
        {vitals.slice(1).map((vital, index) => (
          <View key={index} style={styles.vitalCard}>
            <Text style={{ fontSize: 20, marginBottom: 6 }}>{vital.icon}</Text>
            <Text style={styles.vitalLabel}>{vital.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 4 }}>
              <Text style={[styles.vitalValue, { color: vital.color }]}>{vital.value}</Text>
              <Text style={styles.vitalUnit}> {vital.unit}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary, textAlign: 'center' },
  subtitle: { fontSize: 14, color: HospitalColors.textLight, marginTop: 4, textAlign: 'center' },
  mainVitalCard: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: HospitalColors.border,
    elevation: 2, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8,
  },
  mainVitalLabel: { fontSize: 14, color: HospitalColors.textSecondary, fontWeight: '600', marginTop: 8 },
  mainVitalValue: { fontSize: 48, fontWeight: '700', color: '#DC2626' },
  mainVitalUnit: { fontSize: 18, color: HospitalColors.textLight, fontWeight: '500' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',
  },
  vitalCard: {
    width: '48%', backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 12, alignItems: 'center',
    borderWidth: 1, borderColor: HospitalColors.border,
    elevation: 1, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4,
  },
  vitalLabel: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', textAlign: 'center' },
  vitalValue: { fontSize: 22, fontWeight: '700' },
  vitalUnit: { fontSize: 12, color: HospitalColors.textLight, fontWeight: '500' },
});
