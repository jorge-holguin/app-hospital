import { HospitalColors } from '@/constants/theme';
import { register } from '@/services/authApi';
import { SessionManager } from '@/utils/session';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView, Modal, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

const TERMS_TEXT = `TÉRMINOS Y CONDICIONES DE USO — HJATCH App

1. ACEPTACIÓN DE TÉRMINOS
Al registrarse y utilizar esta aplicación, usted acepta estos términos y condiciones en su totalidad.

2. TRATAMIENTO DE DATOS PERSONALES
Sus datos personales (nombre, correo electrónico, número de celular, fecha de nacimiento) serán utilizados exclusivamente para la gestión de citas médicas y comunicaciones relacionadas con los servicios de salud del Hospital José Agurto Tello de Chosica.

3. RESPONSABILIDAD SOBRE LOS DATOS
La aplicación implementa medidas de seguridad para proteger su información. Sin embargo, el Hospital no se responsabiliza por:
  - Accesos no autorizados derivados del mal uso de sus credenciales por parte del usuario.
  - Pérdida de datos ocasionada por el uso indebido del dispositivo móvil.
  - Interceptación de datos en redes públicas o inseguras.

4. OBLIGACIONES DEL USUARIO
  - Mantener la confidencialidad de su contraseña.
  - No compartir sus credenciales de acceso con terceros.
  - Proporcionar información veraz y actualizada.
  - Notificar inmediatamente cualquier uso no autorizado de su cuenta.

5. FINALIDAD DEL SERVICIO
Esta aplicación tiene como único fin facilitar la gestión de citas médicas, consultas de órdenes médicas y servicios de salud del hospital.

6. MODIFICACIONES
El Hospital se reserva el derecho de modificar estos términos en cualquier momento, notificando a los usuarios a través de la aplicación.

7. LEY APLICABLE
Estos términos se rigen por la legislación peruana vigente, en particular la Ley N° 29733, Ley de Protección de Datos Personales.`;

export default function RegisterStep2Screen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    nombres: string; apellidos: string; email: string; password: string;
  }>();

  const [celular, setCelular] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!celular.trim() || !fechaNacimiento.trim()) {
      Alert.alert('Error', 'Por favor complete todos los campos.');
      return;
    }
    if (celular.length < 9) {
      Alert.alert('Error', 'El número de celular debe tener al menos 9 dígitos.');
      return;
    }
    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(fechaNacimiento)) {
      Alert.alert('Error', 'La fecha de nacimiento debe tener formato AAAA-MM-DD (ej: 1990-05-15).');
      return;
    }
    if (!termsAccepted) {
      Alert.alert('Error', 'Debe aceptar los términos y condiciones para continuar.');
      return;
    }

    setLoading(true);
    try {
      const tokens = await register({
        nombres: params.nombres,
        apellidos: params.apellidos,
        email: params.email,
        celular: celular.trim(),
        fechaNacimiento: fechaNacimiento.trim(),
        password: params.password,
        termsAccepted: true,
      });
      await SessionManager.saveTokens(tokens);
      await SessionManager.saveUserData({
        email: params.email,
        nombres: params.nombres,
        apellidos: params.apellidos,
        celular: celular.trim(),
      });
      // Navigate to email verification screen
      router.replace({
        pathname: '/verify-email',
        params: { email: params.email },
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Error al registrar. Intente nuevamente.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
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
            {params.nombres} {params.apellidos} — {params.email}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 987654321"
            placeholderTextColor={HospitalColors.textLight}
            value={celular}
            onChangeText={setCelular}
            keyboardType="phone-pad"
            maxLength={9}
          />

          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-DD (ej: 1990-05-15)"
            placeholderTextColor={HospitalColors.textLight}
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
            keyboardType="numeric"
            maxLength={10}
          />

          {/* Terms checkbox */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}>
              {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Acepto los{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                Términos y Condiciones
              </Text>{' '}
              y autorizo el tratamiento de mis datos personales.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={HospitalColors.white} />
            ) : (
              <Text style={styles.registerButtonText}>Registrarme</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.loginLink}>
          <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.loginBtnText}>Inicia tu Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Terms & Conditions Modal */}
      <Modal visible={showTermsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Términos y Condiciones</Text>
            <TouchableOpacity onPress={() => setShowTermsModal(false)}>
              <Text style={styles.modalClose}>Cerrar</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalText}>{TERMS_TEXT}</Text>
          </ScrollView>
          <TouchableOpacity
            style={styles.modalAcceptBtn}
            onPress={() => { setTermsAccepted(true); setShowTermsModal(false); }}
          >
            <Text style={styles.modalAcceptText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderWidth: 2, borderColor: HospitalColors.primary,
    borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2,
  },
  checkboxChecked: { backgroundColor: HospitalColors.primary },
  checkmark: { color: HospitalColors.white, fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { flex: 1, fontSize: 13, color: HospitalColors.textSecondary, lineHeight: 20 },
  termsLink: { color: HospitalColors.primary, fontWeight: '600', textDecorationLine: 'underline' },
  registerButton: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginTop: 8,
  },
  registerButtonText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', marginTop: 28 },
  loginText: { fontSize: 14, color: HospitalColors.textSecondary, marginBottom: 8 },
  loginBtnText: { color: HospitalColors.primary, fontSize: 15, fontWeight: '600' },
  // Modal styles
  modalContainer: { flex: 1, backgroundColor: HospitalColors.white, paddingTop: Platform.OS === 'ios' ? 56 : 24 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: HospitalColors.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: HospitalColors.textPrimary },
  modalClose: { fontSize: 15, color: HospitalColors.primary, fontWeight: '600' },
  modalBody: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  modalText: { fontSize: 14, color: HospitalColors.textSecondary, lineHeight: 22 },
  modalAcceptBtn: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', margin: 24,
  },
  modalAcceptText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
});
