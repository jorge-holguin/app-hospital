import { HospitalColors } from '@/constants/theme';
import { changePassword } from '@/services/userApi';
import { SessionManager } from '@/utils/session';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    SessionManager.getUserData().then((data) => {
      if (data?.id) setUserId(data.id);
    });
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Campo requerido', 'Ingrese su contraseña actual.');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Campo requerido', 'Ingrese la nueva contraseña.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (!userId) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Cierre sesión e ingrese nuevamente.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(userId, currentPassword, newPassword);
      Alert.alert(
        'Contraseña actualizada',
        'Su contraseña ha sido cambiada exitosamente.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (error: any) {
      if (error.response?.status === 400) {
        Alert.alert('Error', 'La contraseña actual es incorrecta. Verifique e intente nuevamente.');
      } else {
        const msg =
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Error al cambiar la contraseña. Intente nuevamente.';
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Cambiar contraseña</Text>
          <Text style={styles.subtitle}>Ingresa tu contraseña actual y la nueva contraseña</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🔐</Text>
          </View>

          <Text style={styles.label}>Contraseña actual</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ingrese su contraseña actual"
              placeholderTextColor={HospitalColors.textLight}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrent}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ fontSize: 18 }}>{showCurrent ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Nueva contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={HospitalColors.textLight}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNew}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ fontSize: 18 }}>{showNew ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Repita la nueva contraseña"
              placeholderTextColor={HospitalColors.textLight}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ fontSize: 18 }}>{showConfirm ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, loading && { opacity: 0.7 }]}
            onPress={handleChangePassword}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={HospitalColors.white} />
            ) : (
              <Text style={styles.saveBtnText}>Cambiar contraseña</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: {
    flexGrow: 1, paddingTop: 56, paddingHorizontal: 24, paddingBottom: 40,
  },
  header: { marginBottom: 24 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 24,
    borderWidth: 1, borderColor: HospitalColors.border,
  },
  iconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: HospitalColors.primarySoft, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 24,
  },
  iconText: { fontSize: 28 },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 6, marginLeft: 2,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    height: 50, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 12,
    backgroundColor: HospitalColors.inputBg, marginBottom: 16, paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1, fontSize: 15, color: HospitalColors.textPrimary,
  },
  saveBtn: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
});
