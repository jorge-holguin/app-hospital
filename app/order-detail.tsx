import { mockOrders, OrderStatus } from '@/constants/mockData';
import { HospitalColors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const TYPE_ICONS: Record<string, string> = {
  laboratorio: '🔬',
  rayos_x: '🩻',
  ecografia: '🖥️',
  tomografia: '🧠',
};

const STATUS_CONFIG: Record<OrderStatus, { bg: string; text: string; label: string }> = {
  ready: {
    bg: HospitalColors.statusReady,
    text: HospitalColors.statusReadyText,
    label: 'Disponible',
  },
  process: {
    bg: HospitalColors.statusProcess,
    text: HospitalColors.statusProcessText,
    label: 'En proceso',
  },
  pending: {
    bg: HospitalColors.statusPending,
    text: HospitalColors.statusPendingText,
    label: 'Pendiente',
  },
};

export default function OrderDetailScreen() {
  const router = useRouter();
  const { type, title } = useLocalSearchParams<{ type: string; title: string }>();

  const filteredOrders = mockOrders.filter((order) => order.type === type);
  const icon = TYPE_ICONS[type || 'laboratorio'] || '📋';

  const handleViewOrder = (orderId: string, status: OrderStatus) => {
    if (status === 'ready') {
      Alert.alert('Resultado disponible', `Mostrando resultado de la orden ${orderId}.\n\n(Aquí se mostraría el PDF o detalle del resultado)`);
    } else if (status === 'process') {
      Alert.alert('En proceso', 'Esta orden aún está siendo procesada. Por favor espere.');
    } else {
      Alert.alert('Pendiente', 'Esta orden aún no ha sido realizada.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title || 'Órdenes'}</Text>
        <Text style={styles.subtitle}>Resultados e informes médicos</Text>
      </View>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No hay órdenes disponibles</Text>
        </View>
      ) : (
        filteredOrders.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status];
          return (
            <TouchableOpacity
              key={order.id}
              style={styles.orderCard}
              onPress={() => handleViewOrder(order.id, order.status)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusDot, { backgroundColor: statusConfig.text }]} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderDate}>Fecha: {order.date}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                  <Text style={[styles.statusBadgeText, { color: statusConfig.text }]}>
                    {statusConfig.label}
                  </Text>
                </View>
              </View>
              <Text style={styles.orderIcon}>{icon}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.helpFooter}>¿Necesitas ayuda? Llámanos al (01) 418-3232</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: HospitalColors.background },
  scrollContent: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { fontSize: 15, color: HospitalColors.primary, fontWeight: '500', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: HospitalColors.textPrimary },
  subtitle: { fontSize: 14, color: HospitalColors.textLight, marginTop: 4 },
  emptyContainer: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: HospitalColors.textSecondary },
  orderCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: HospitalColors.white, borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: HospitalColors.border,
    elevation: 1, shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  orderInfo: { flex: 1 },
  orderTitle: { fontSize: 15, fontWeight: '600', color: HospitalColors.textPrimary, marginBottom: 2 },
  orderDate: { fontSize: 12, color: HospitalColors.textLight, marginBottom: 6 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  orderIcon: { fontSize: 22, marginHorizontal: 8 },
  arrow: { fontSize: 24, color: HospitalColors.textLight, fontWeight: '300' },
  helpFooter: {
    textAlign: 'center', fontSize: 12, color: HospitalColors.textLight,
    marginTop: 24, paddingVertical: 16,
  },
});
