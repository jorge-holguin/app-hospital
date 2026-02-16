import { mockTriage } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import { SessionManager, UserData } from '@/utils/session';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MenuCard = ({ title, subtitle, icon, onPress, disabled }: {
  title: string; subtitle: string; icon: string; onPress?: () => void; disabled?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.menuCard, disabled && styles.menuCardDisabled]}
    onPress={onPress}
    activeOpacity={disabled ? 1 : 0.7}
    disabled={disabled}
  >
    <View style={styles.menuIconBox}>
      <Text style={styles.menuIcon}>{icon}</Text>
    </View>
    <View style={styles.menuTextBox}>
      <Text style={[styles.menuTitle, disabled && { color: HospitalColors.textLight }]}>{title}</Text>
      <Text style={styles.menuSub}>{subtitle}</Text>
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    SessionManager.getUserData().then(setUser);
  }, []);

  const nombres = user?.nombres || '';
  const apellidos = user?.apellidos || '';
  const initials = `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase() || '??';

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: async () => { await SessionManager.clearSession(); router.replace('/login'); } },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.menuPrincipal}>MENÚ PRINCIPAL</Text>

      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          {user?.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Bienvenido</Text>
            <Text style={styles.userName}>{nombres} {apellidos}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => router.push('/edit-profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.editProfileIcon}>✏️</Text>
          <Text style={styles.editProfileText}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      {/* Triage Card */}
      <TouchableOpacity
        style={styles.triageCard}
        onPress={() => router.push('/triage-history')}
        activeOpacity={0.7}
      >
        <View style={styles.triageHeader}>
          <Text style={styles.triageTitle}>Último Triaje</Text>
          <Text style={styles.triageDate}>{mockTriage.fecha}</Text>
        </View>
        <View style={styles.triageGrid}>
          {[
            { label: 'Talla (CM)', value: `${mockTriage.talla.toFixed(2)}`, color: HospitalColors.primary },
            { label: 'G.S', value: mockTriage.grupoSanguineo, color: '#DC2626' },
            { label: 'Peso (KG)', value: `${mockTriage.peso}`, color: HospitalColors.accent },
          ].map((item, i) => (
            <View key={i} style={styles.triageItem}>
              <Text style={styles.triageLabel}>{item.label}</Text>
              <Text style={[styles.triageValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
        </View>
        <Text style={{ textAlign: 'center', fontSize: 12, color: HospitalColors.primary, fontWeight: '600', marginTop: 12 }}>Ver historial de triaje ›</Text>
      </TouchableOpacity>

      {/* Menu */}
      <MenuCard
        title="Órdenes Médicas"
        subtitle="Próximamente"
        icon="🔬"
        disabled
      />
      <MenuCard
        title="Citas Médicas"
        subtitle="Solicitar, consultar y gestionar"
        icon="📅"
        onPress={() => router.push('/citas')}
      />
      <MenuCard
        title="Informes"
        subtitle="Próximamente"
        icon="📊"
        disabled
      />

      {/* Help footer */}
      <Text style={styles.helpFooter}>¿Necesitas ayuda? Llámanos al (01) 418-3232</Text>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  menuPrincipal: {
    fontSize: 11, fontWeight: '600', color: HospitalColors.textLight,
    letterSpacing: 1.5, marginBottom: 16,
  },
  profileCard: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 20,
    marginBottom: 20, borderWidth: 1.5, borderColor: HospitalColors.border,
  },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: HospitalColors.inputBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: HospitalColors.border,
  },
  avatarText: { color: HospitalColors.textSecondary, fontSize: 22, fontWeight: '700' },
  avatarImage: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: HospitalColors.border,
  },
  profileInfo: { marginLeft: 16, flex: 1 },
  greeting: { fontSize: 14, color: HospitalColors.textLight },
  userName: { fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary, marginTop: 2 },
  editProfileBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: HospitalColors.primarySoft, paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, gap: 6,
  },
  editProfileIcon: { fontSize: 13 },
  editProfileText: { fontSize: 13, fontWeight: '600', color: HospitalColors.primaryDark },
  triageCard: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 18,
    marginBottom: 24, elevation: 2,
    shadowColor: HospitalColors.shadow, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 8,
    borderWidth: 1, borderColor: HospitalColors.border,
  },
  triageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  triageTitle: { fontSize: 16, fontWeight: '700', color: HospitalColors.textPrimary },
  triageDate: { fontSize: 12, color: HospitalColors.textLight },
  triageGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  triageItem: { alignItems: 'center', paddingVertical: 4 },
  triageLabel: { fontSize: 11, color: HospitalColors.textLight, fontWeight: '600', marginBottom: 4 },
  triageValue: { fontSize: 20, fontWeight: '700' },
  menuCard: {
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    elevation: 1, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
    borderWidth: 1, borderColor: HospitalColors.border,
  },
  menuCardDisabled: { opacity: 0.45 },
  menuIconBox: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: HospitalColors.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  menuIcon: { fontSize: 22 },
  menuTextBox: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '600', color: HospitalColors.textPrimary },
  menuSub: { fontSize: 12, color: HospitalColors.textLight, marginTop: 2 },
  menuArrow: { fontSize: 24, color: HospitalColors.textLight, fontWeight: '300' },
  helpFooter: {
    textAlign: 'center', fontSize: 12, color: HospitalColors.textLight,
    marginTop: 32, paddingVertical: 8,
  },
  logoutBtn: {
    marginTop: 12, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#EF4444',
    marginBottom: 20,
  },
  logoutText: { color: '#EF4444', fontSize: 15, fontWeight: '600' },
});
