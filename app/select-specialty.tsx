import { HospitalColors } from '@/constants/theme';
import { Especialidad, fetchEspecialidades } from '@/services/citasApi';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View,
} from 'react-native';

export default function SelectSpecialtyScreen() {
  const router = useRouter();
  const { patientType, appointmentType } = useLocalSearchParams<{ patientType: string; appointmentType: string }>();
  const [search, setSearch] = useState('');
  const [specialties, setSpecialties] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchEspecialidades();
      setSpecialties(data);
      setLoading(false);
    })();
  }, []);

  const filtered = specialties.filter((s) =>
    s.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (specialtyId: string, specialtyName: string) => {
    router.push({
      pathname: '/search-type',
      params: { patientType, appointmentType, specialtyId, specialtyName },
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Seleccionar Especialidad</Text>
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: HospitalColors.primarySoft }]}>
            <Text style={[styles.chipText, { color: HospitalColors.primaryDark }]}>{patientType}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: HospitalColors.accentLight }]}>
            <Text style={[styles.chipText, { color: HospitalColors.accent }]}>{appointmentType}</Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar especialidad..."
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
          <Text style={styles.loadingText}>Cargando especialidades...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.resultCount}>
            {filtered.length} especialidad{filtered.length !== 1 ? 'es' : ''} disponible{filtered.length !== 1 ? 's' : ''}
          </Text>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.idEspecialidad}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.specialtyCard}
                onPress={() => handleSelect(item.idEspecialidad, item.nombre)}
                activeOpacity={0.7}
              >
                <View style={styles.specialtyIcon}>
                  <Text style={styles.specialtyEmoji}>🩺</Text>
                </View>
                <Text style={styles.specialtyName}>{item.nombre}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>No se encontraron especialidades</Text>
                <Text style={styles.emptySub}>Intenta con otro término de búsqueda</Text>
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
  title: { fontSize: 22, fontWeight: '700', color: HospitalColors.textPrimary, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: '700' },
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
  specialtyCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: HospitalColors.border,
  },
  specialtyIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: HospitalColors.primarySoft,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  specialtyEmoji: { fontSize: 18 },
  specialtyName: { flex: 1, fontSize: 15, fontWeight: '500', color: HospitalColors.textPrimary },
  arrow: { fontSize: 22, color: HospitalColors.textLight, fontWeight: '300' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary },
  emptySub: { fontSize: 13, color: HospitalColors.textLight, marginTop: 4 },
  loadingBox: { alignItems: 'center', paddingTop: 80 },
  loadingText: { fontSize: 14, color: HospitalColors.textLight, marginTop: 12 },
});
