import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CITAS_OPTIONS = [
  {
    id: 'solicitud',
    title: 'Solicitar Cita',
    desc: 'Agenda una cita con nuestros especialistas',
    icon: '📋',
    route: '/solicitud-cita',
    accent: HospitalColors.primary,
  },
  {
    id: 'referencia',
    title: 'Consultar Referencias',
    desc: 'Revisa el estado de tus referencias médicas',
    icon: '📄',
    route: '/consultar-referencia',
    accent: HospitalColors.accent,
  },
  {
    id: 'consultar-solicitud',
    title: 'Mis Solicitudes',
    desc: 'Consulta el estado de tus solicitudes de cita',
    icon: '🔍',
    route: '/consultar-solicitud',
    accent: '#7C3AED',
  },
];

export default function CitasScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Citas Médicas</Text>
        <Text style={styles.subtitle}>Gestiona tus citas y referencias</Text>
      </View>

      {CITAS_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={styles.card}
          onPress={() => router.push(option.route as any)}
          activeOpacity={0.7}
        >
          <View style={[styles.iconBox, { backgroundColor: option.accent + '15' }]}>
            <Text style={styles.icon}>{option.icon}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{option.title}</Text>
            <Text style={styles.cardDesc}>{option.desc}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.helpFooter}>¿Necesitas ayuda? Llámanos al (01) 418-3232</Text>
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
  helpFooter: {
    textAlign: 'center', fontSize: 12, color: HospitalColors.textLight,
    marginTop: 24, paddingVertical: 16,
  },
});
