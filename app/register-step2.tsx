import { HospitalColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    documentType: string; documentNumber: string; password: string;
  }>();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [ubigeo, setUbigeo] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dataAccepted, setDataAccepted] = useState(false);

  const handleRegister = () => {
    if (!phone.trim() || !email.trim() || !verificationCode.trim() || !ubigeo.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos.');
      return;
    }
    if (phone.length < 9) {
      Alert.alert('Error', 'El número de celular debe tener al menos 9 dígitos.');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Error', 'Ingrese un correo electrónico válido.');
      return;
    }
    if (!termsAccepted || !dataAccepted) {
      Alert.alert('Error', 'Debe aceptar los términos y condiciones y la autorización de datos personales.');
      return;
    }
    Alert.alert('Registro exitoso', 'Su cuenta ha sido creada correctamente.', [
      { text: 'OK', onPress: () => router.replace('/login') },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.stepLabel}>Paso 2 de 2 — Datos de contacto</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Info chip from step 1 */}
        <View style={styles.infoChip}>
          <Text style={styles.infoChipText}>
            {params.documentType}: {params.documentNumber}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 987654321"
            placeholderTextColor={HospitalColors.textLight}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={9}
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

          <Text style={styles.label}>Código verificador</Text>
          <TextInput
            style={styles.input}
            placeholder="Código de verificación"
            placeholderTextColor={HospitalColors.textLight}
            value={verificationCode}
            onChangeText={setVerificationCode}
            maxLength={6}
          />

          <Text style={styles.label}>Ubigeo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 150101"
            placeholderTextColor={HospitalColors.textLight}
            value={ubigeo}
            onChangeText={setUbigeo}
            keyboardType="numeric"
            maxLength={6}
          />

          {/* Checkboxes */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Términos y Condiciones de Uso</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.checkboxRow} onPress={() => setDataAccepted(!dataAccepted)}>
            <View style={[styles.checkbox, dataAccepted && styles.checkboxChecked]}>
              {dataAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>Autorización para el Tratamiento de Datos Personales</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.85}>
            <Text style={styles.registerButtonText}>Registrarme</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginLink}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginBtnText}>Inicia tu Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { flexGrow: 1, paddingTop: 56, paddingBottom: 40, paddingHorizontal: 24 },
  header: { marginBottom: 20 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '700', color: HospitalColors.textPrimary },
  stepLabel: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4, marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: HospitalColors.border, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: HospitalColors.primary, borderRadius: 2 },
  infoChip: {
    backgroundColor: HospitalColors.primarySoft, alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 16,
  },
  infoChipText: { fontSize: 12, fontWeight: '600', color: HospitalColors.primaryDark },
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: HospitalColors.primary,
    borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  checkboxChecked: { backgroundColor: HospitalColors.primary },
  checkmark: { color: HospitalColors.white, fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 13, color: HospitalColors.textSecondary },
  registerButton: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  registerButtonText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 28 },
  loginText: { fontSize: 14, color: HospitalColors.textSecondary, marginBottom: 8 },
  loginBtnText: { color: HospitalColors.primary, fontSize: 15, fontWeight: '600' },
});
