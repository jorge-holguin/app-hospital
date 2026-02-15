import { HospitalColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterStep1Screen() {
  const router = useRouter();
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNext = () => {
    if (!nombres.trim() || !apellidos.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Ingrese un correo electrónico válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    router.push({
      pathname: '/register-step2',
      params: { nombres, apellidos, email, password },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.stepLabel}>Paso 1 de 2 — Datos personales</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombres</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Carlos"
            placeholderTextColor={HospitalColors.textLight}
            value={nombres}
            onChangeText={setNombres}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Apellidos</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Pérez García"
            placeholderTextColor={HospitalColors.textLight}
            value={apellidos}
            onChangeText={setApellidos}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: correo@ejemplo.com"
            placeholderTextColor={HospitalColors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={HospitalColors.textLight}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Repetir contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirma tu contraseña"
            placeholderTextColor={HospitalColors.textLight}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.85}>
            <Text style={styles.nextButtonText}>Siguiente</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginLink}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginButtonText}>Inicia tu Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { flexGrow: 1, paddingTop: 56, paddingBottom: 40, paddingHorizontal: 24 },
  header: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '700', color: HospitalColors.textPrimary },
  stepLabel: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4, marginBottom: 12 },
  progressBar: {
    height: 4, backgroundColor: HospitalColors.border, borderRadius: 2, overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: HospitalColors.primary, borderRadius: 2 },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 22,
    borderWidth: 1, borderColor: HospitalColors.border,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: HospitalColors.textSecondary,
    marginBottom: 6, marginLeft: 2,
  },
  input: {
    height: 50, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 12,
    paddingHorizontal: 14, fontSize: 15, color: HospitalColors.textPrimary,
    backgroundColor: HospitalColors.inputBg, marginBottom: 16,
  },
  nextButton: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
  },
  nextButtonText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 28 },
  loginText: { fontSize: 14, color: HospitalColors.textSecondary, marginBottom: 8 },
  loginButtonText: { color: HospitalColors.primary, fontSize: 15, fontWeight: '600' },
});
