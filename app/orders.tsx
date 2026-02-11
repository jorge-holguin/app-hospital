import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ORDER_CATEGORIES = [
  {
    type: 'laboratorio',
    title: 'Laboratorio',
    desc: 'Análisis clínicos y resultados de laboratorio',
    icon: '🔬',
    accent: HospitalColors.primary,
  },
  {
    type: 'rayos_x',
    title: 'Rayos X',
    desc: 'Estudios radiológicos e informes de imágenes',
    icon: '🩻',
    accent: HospitalColors.accent,
  },
  {
    type: 'ecografia',
    title: 'Ecografía',
    desc: 'Exámenes ecográficos y diagnósticos por imagen',
    icon: '🖥️',
    accent: '#7C3AED',
  },
  {
    type: 'tomografia',
    title: 'Tomografía',
    desc: 'Tomografías computarizadas y estudios avanzados',
    icon: '🧠',
    accent: '#D97706',
  },
];

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Órdenes Médicas</Text>
        <Text style={styles.subtitle}>Resultados e informes médicos</Text>
      </View>

      {ORDER_CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.type}
          style={styles.card}
          onPress={() =>
            router.push({
              pathname: '/order-detail',
              params: { type: category.type, title: category.title },
            })
          }
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: category.accent + '15' }]}>
            <Text style={styles.icon}>{category.icon}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{category.title}</Text>
            <Text style={styles.cardDesc}>{category.desc}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 28 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 14, color: HospitalColors.textLight, marginTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 18,
    marginBottom: 14, borderWidth: 1, borderColor: HospitalColors.border,
    elevation: 1, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  iconBox: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  icon: { fontSize: 24 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary, marginBottom: 3 },
  cardDesc: { fontSize: 12, color: HospitalColors.textLight, lineHeight: 16 },
  arrow: { fontSize: 26, color: HospitalColors.textLight, fontWeight: '300' },
});
