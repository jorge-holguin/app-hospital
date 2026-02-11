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

const DOCUMENT_TYPES = ['DNI', 'CE', 'Pasaporte'];

export default function RegisterStep1Screen() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDocTypes, setShowDocTypes] = useState(false);

  const maxDocLength = documentType === 'DNI' ? 8 : 12;

  const handleNext = () => {
    if (!documentNumber.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos.');
      return;
    }
    if (documentType === 'DNI' && documentNumber.length !== 8) {
      Alert.alert('Error', 'El DNI debe tener 8 dígitos.');
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
      params: { documentType, documentNumber, password },
    });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.stepLabel}>Paso 1 de 2 — Datos de acceso</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <View style={styles.card}>
          {/* Document type selector */}
          <Text style={styles.label}>Tipo de documento</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setShowDocTypes(!showDocTypes)}>
            <Text style={styles.selectorText}>{documentType}</Text>
            <Text style={styles.selectorArrow}>{showDocTypes ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showDocTypes && (
            <View style={styles.dropdown}>
              {DOCUMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.dropdownItem, type === documentType && styles.dropdownItemActive]}
                  onPress={() => { setDocumentType(type); setShowDocTypes(false); }}
                >
                  <Text style={[styles.dropdownText, type === documentType && { color: HospitalColors.primary, fontWeight: '600' }]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Número de documento</Text>
          <TextInput
            style={styles.input}
            placeholder={documentType === 'DNI' ? 'Ej: 72345678' : 'Número de documento'}
            placeholderTextColor={HospitalColors.textLight}
            value={documentNumber}
            onChangeText={setDocumentNumber}
            keyboardType="numeric"
            maxLength={maxDocLength}
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
  selector: {
    height: 50, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 12,
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: HospitalColors.inputBg, marginBottom: 16,
  },
  selectorText: { fontSize: 15, color: HospitalColors.textPrimary, fontWeight: '500' },
  selectorArrow: { fontSize: 10, color: HospitalColors.textLight },
  dropdown: {
    backgroundColor: HospitalColors.white, borderWidth: 1, borderColor: HospitalColors.border,
    borderRadius: 12, marginTop: -12, marginBottom: 16, overflow: 'hidden',
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: HospitalColors.border },
  dropdownItemActive: { backgroundColor: HospitalColors.primarySoft },
  dropdownText: { fontSize: 15, color: HospitalColors.textPrimary },
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
