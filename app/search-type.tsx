import { HospitalColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SearchTypeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientType: string; appointmentType: string;
    specialtyId: string; specialtyName: string;
    sessionToken: string;
  }>();

  const handleByDoctor = () => {
    router.push({
      pathname: '/select-doctor',
      params: { ...params },
    });
  };

  const handleByDate = () => {
    router.push({
      pathname: '/select-datetime',
      params: { ...params, searchBy: 'date' },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>¿Cómo deseas buscar?</Text>
        <Text style={styles.subtitle}>{params.specialtyName}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.card} onPress={handleByDoctor} activeOpacity={0.7}>
          <View style={[styles.cardIcon, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.emoji}>👨‍⚕️</Text>
          </View>
          <Text style={styles.cardTitle}>Buscar por Médico</Text>
          <Text style={styles.cardDesc}>
            Selecciona primero el médico y luego elige la fecha y horario disponible
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={handleByDate} activeOpacity={0.7}>
          <View style={[styles.cardIcon, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.emoji}>📅</Text>
          </View>
          <Text style={styles.cardTitle}>Buscar por Fecha</Text>
          <Text style={styles.cardDesc}>
            Selecciona primero la fecha y horario, luego elige entre los médicos disponibles
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: HospitalColors.primary, fontWeight: '500' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30, gap: 16 },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: HospitalColors.border, alignItems: 'center',
    elevation: 1, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  cardIcon: {
    width: 64, height: 64, borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  emoji: { fontSize: 28 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 8 },
  cardDesc: { fontSize: 13, color: HospitalColors.textSecondary, textAlign: 'center', lineHeight: 18 },
});
