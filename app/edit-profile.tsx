import { mockUser } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert, Image,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

export default function EditProfileScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState(mockUser.firstName);
  const [lastName, setLastName] = useState(mockUser.lastName);
  const [phone, setPhone] = useState(mockUser.phone || '987654321');
  const [email, setEmail] = useState(mockUser.email || 'usuario@ejemplo.com');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para tomar una foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert('Cambiar foto de perfil', 'Selecciona una opción', [
      { text: 'Tomar foto', onPress: takePhoto },
      { text: 'Elegir de galería', onPress: pickImageFromGallery },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleSave = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Error', 'El nombre y apellido son obligatorios.');
      return;
    }
    if (phone.length < 9) {
      Alert.alert('Error', 'El celular debe tener al menos 9 dígitos.');
      return;
    }
    Alert.alert('Perfil actualizado', 'Tus datos han sido actualizados correctamente.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backBtn}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Perfil</Text>
          <Text style={styles.subtitle}>Actualiza tu información personal</Text>
        </View>

        {/* Avatar section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.8}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.changePhotoBtn} onPress={handleChangePhoto} activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Cambiar foto</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          <Text style={styles.label}>Nombre(s)</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Tu nombre"
            placeholderTextColor={HospitalColors.textLight}
          />

          <Text style={styles.label}>Apellidos</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Tu apellido"
            placeholderTextColor={HospitalColors.textLight}
          />

          <Text style={styles.label}>Número de celular</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Ej: 987654321"
            placeholderTextColor={HospitalColors.textLight}
            keyboardType="phone-pad"
            maxLength={9}
          />

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Ej: correo@ejemplo.com"
            placeholderTextColor={HospitalColors.textLight}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Read-only fields */}
          <Text style={styles.label}>DNI</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{mockUser.documentNumber}</Text>
            <Text style={styles.readOnlyBadge}>No editable</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Guardar Cambios</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.cancelBtnText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: HospitalColors.inputBg, justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: HospitalColors.border, marginBottom: 12,
  },
  avatarText: { color: HospitalColors.textSecondary, fontSize: 30, fontWeight: '700' },
  avatarImage: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: HospitalColors.border, marginBottom: 12,
  },
  changePhotoBtn: {
    backgroundColor: HospitalColors.primarySoft, paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: { fontSize: 13, fontWeight: '600', color: HospitalColors.primaryDark },
  card: {
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 22,
    borderWidth: 1, borderColor: HospitalColors.border, marginBottom: 20,
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
  readOnlyInput: {
    height: 50, borderWidth: 1, borderColor: HospitalColors.border, borderRadius: 12,
    paddingHorizontal: 14, backgroundColor: '#F3F4F6', marginBottom: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  readOnlyText: { fontSize: 15, color: HospitalColors.textLight },
  readOnlyBadge: { fontSize: 10, color: HospitalColors.textLight, fontWeight: '600' },
  saveBtn: {
    backgroundColor: HospitalColors.primary, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  saveBtnText: { color: HospitalColors.white, fontSize: 16, fontWeight: '700' },
  cancelBtn: {
    height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: HospitalColors.border,
  },
  cancelBtnText: { color: HospitalColors.textSecondary, fontSize: 15, fontWeight: '600' },
});
