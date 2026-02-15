import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HospitalColors } from '@/constants/theme';
import { resetPassword } from '@/services/authApi';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email: string }>();
  const [email, setEmail] = useState(params.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim() || !code.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos.');
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

    setLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      Alert.alert(
        'Contraseña restablecida',
        'Su contraseña ha sido actualizada exitosamente. Ya puede iniciar sesión con su nueva contraseña.',
        [{ text: 'Iniciar sesión', onPress: () => router.replace('/login') }],
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error al restablecer la contraseña. Verifique el código e intente nuevamente.';
      Alert.alert('Error', msg);
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
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>🔑</Text>
          </View>

          <Text style={styles.title}>Restablecer contraseña</Text>
          <Text style={styles.description}>
            Ingresa el código que recibiste en tu correo electrónico junto con tu nueva contraseña.
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: correo@ejemplo.com"
            placeholderTextColor={HospitalColors.textLight}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Código de verificación</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="Ingrese el código"
            placeholderTextColor={HospitalColors.textLight}
            value={code}
            onChangeText={setCode}
            autoCapitalize="none"
            maxLength={10}
            textAlign="center"
          />

          <Text style={styles.label}>Nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={HospitalColors.textLight}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirmar nueva contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repita la nueva contraseña"
            placeholderTextColor={HospitalColors.textLight}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.replace('/login')}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resetButton, loading && { opacity: 0.7 }]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={HospitalColors.white} size="small" />
              ) : (
                <Text style={styles.resetText}>Restablecer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HospitalColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: HospitalColors.white,
    borderRadius: 20,
    padding: 28,
    elevation: 5,
    shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: HospitalColors.border,
  },
  iconContainer: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: HospitalColors.primarySoft, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 20,
  },
  iconText: { fontSize: 28 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: HospitalColors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: HospitalColors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 6, marginLeft: 2,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: HospitalColors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 15,
    color: HospitalColors.textPrimary,
    marginBottom: 16,
    backgroundColor: HospitalColors.inputBg,
  },
  codeInput: {
    width: '100%',
    height: 56,
    borderWidth: 1.5,
    borderColor: HospitalColors.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 4,
    color: HospitalColors.textPrimary,
    marginBottom: 16,
    backgroundColor: HospitalColors.inputBg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HospitalColors.inputBg,
    borderWidth: 1,
    borderColor: HospitalColors.border,
    marginRight: 10,
  },
  cancelText: {
    color: HospitalColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: HospitalColors.primary,
    marginLeft: 10,
  },
  resetText: {
    color: HospitalColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
