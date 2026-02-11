import { HospitalColors } from '@/constants/theme';
import { fetchMedicos, Medico } from '@/services/citasApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

export default function SelectDoctorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    patientType: string; appointmentType: string;
    specialtyId: string; specialtyName: string;
  }>();
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchMedicos(params.specialtyId || '');
      setDoctors(data);
      setLoading(false);
    })();
  }, [params.specialtyId]);

  const filtered = doctors.filter((d) =>
    d.medicoId.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (codigoMedico: string, nombreMedico: string) => {
    router.push({
      pathname: '/select-datetime',
      params: {
        ...params,
        doctorName: nombreMedico,
        doctorCode: codigoMedico,
        searchBy: 'doctor',
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seleccionar Médico</Text>
        <Text style={styles.subtitle}>{params.specialtyName}</Text>
      </View>

      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar médico..."
          placeholderTextColor={HospitalColors.textLight}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={HospitalColors.primary} />
          <Text style={styles.loadingText}>Cargando médicos...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {filtered.length} médico{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </Text>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.nombre}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.doctorCard}
                onPress={() => handleSelect(item.nombre, item.medicoId)}
                activeOpacity={0.7}
              >
                <View style={styles.doctorAvatar}>
                  <Text style={styles.avatarText}>
                    {item.medicoId.split(' ')[0]?.charAt(0) || 'D'}
                  </Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>Dr(a). {item.medicoId}</Text>
                  <Text style={styles.doctorCode}>Código: {item.nombre}</Text>
                </View>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>👨‍⚕️</Text>
                <Text style={styles.emptyText}>No se encontraron médicos</Text>
                <Text style={styles.emptySub}>
                  {doctors.length === 0
                    ? 'No hay médicos registrados para esta especialidad'
                    : 'Intenta con otro término de búsqueda'}
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 4 },
  subtitle: { fontSize: 14, color: HospitalColors.primary, fontWeight: '500' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 12,
    marginHorizontal: 20, paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: HospitalColors.border,
  },
  searchIcon: { fontSize: 16, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: HospitalColors.textPrimary },
  clearBtn: { fontSize: 16, color: HospitalColors.textLight, padding: 4 },
  resultCount: {
    fontSize: 12, color: HospitalColors.textLight, marginHorizontal: 20,
    marginTop: 12, marginBottom: 8,
  },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  doctorCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 14, padding: 16,
    marginBottom: 10, borderWidth: 1, borderColor: HospitalColors.border,
  },
  doctorAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: HospitalColors.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  avatarText: { color: HospitalColors.white, fontSize: 18, fontWeight: '700' },
  doctorInfo: { flex: 1 },
  doctorName: { fontSize: 15, fontWeight: '600', color: HospitalColors.textPrimary },
  doctorCode: { fontSize: 12, color: HospitalColors.textLight, marginTop: 2 },
  arrow: { fontSize: 22, color: HospitalColors.textLight, fontWeight: '300' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary },
  emptySub: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  loadingBox: { alignItems: 'center', paddingTop: 80 },
  loadingText: { fontSize: 14, color: HospitalColors.textLight, marginTop: 12 },
});
