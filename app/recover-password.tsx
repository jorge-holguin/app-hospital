import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { HospitalColors } from '@/constants/theme';

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function RecoverPasswordScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');

  useEffect(() => {
    setCaptchaCode(generateCaptcha());
  }, []);

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptchaInput('');
  };

  const handleSearch = () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Error', 'Por favor ingrese su correo electrónico o número de móvil.');
      return;
    }
    if (captchaInput !== captchaCode) {
      Alert.alert('Error', 'El código captcha no es correcto. Intente de nuevo.');
      refreshCaptcha();
      return;
    }
    Alert.alert(
      'Solicitud enviada',
      'Si la cuenta existe, recibirás un correo o SMS con instrucciones para recuperar tu contraseña.',
      [{ text: 'OK', onPress: () => router.replace('/login') }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Encuentra tu cuenta</Text>
          <Text style={styles.description}>
            Introduce tu correo electrónico o número de móvil para buscar tu cuenta
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico o número de móvil"
            placeholderTextColor={HospitalColors.textLight}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
          />

          {/* Captcha Section */}
          <View style={styles.captchaContainer}>
            <View style={styles.captchaDisplay}>
              <Text style={styles.captchaText}>{captchaCode}</Text>
            </View>
            <TouchableOpacity style={styles.refreshButton} onPress={refreshCaptcha}>
              <Text style={styles.refreshText}>↻</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Ingrese el código captcha"
            placeholderTextColor={HospitalColors.textLight}
            value={captchaInput}
            onChangeText={setCaptchaInput}
            autoCapitalize="none"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchText}>Buscar</Text>
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
    backgroundColor: HospitalColors.gradientMiddle,
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
    padding: 25,
    elevation: 5,
    shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: HospitalColors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: HospitalColors.textSecondary,
    marginBottom: 25,
    lineHeight: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: HospitalColors.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    color: HospitalColors.textPrimary,
    marginBottom: 15,
    backgroundColor: HospitalColors.inputBg,
  },
  captchaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  captchaDisplay: {
    flex: 1,
    height: 50,
    backgroundColor: '#E8E8E8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  captchaText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: HospitalColors.textPrimary,
    letterSpacing: 8,
    fontStyle: 'italic',
    textDecorationLine: 'line-through',
  },
  refreshButton: {
    width: 50,
    height: 50,
    backgroundColor: HospitalColors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshText: {
    fontSize: 24,
    color: HospitalColors.white,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: HospitalColors.border,
    marginRight: 10,
  },
  cancelText: {
    color: HospitalColors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  searchButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    backgroundColor: HospitalColors.primary,
    marginLeft: 10,
    elevation: 3,
    shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  searchText: {
    color: HospitalColors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
