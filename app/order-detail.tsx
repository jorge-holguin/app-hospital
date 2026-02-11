import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HospitalColors } from '@/constants/theme';
import { mockOrders, OrderStatus } from '@/constants/mockData';

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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{title || 'Órdenes'}</Text>
      <Text style={styles.subtitle}>Resultados e informes médicos</Text>

      {filteredOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay órdenes disponibles</Text>
        </View>
      ) : (
        filteredOrders.map((order) => {
          const statusConfig = STATUS_CONFIG[order.status];
          return (
            <TouchableOpacity
              key={order.id}
              style={[styles.orderCard, { backgroundColor: statusConfig.bg }]}
              onPress={() => handleViewOrder(order.id, order.status)}
            >
              <View style={styles.orderInfo}>
                <Text style={styles.orderType}>{title}</Text>
                <Text style={styles.orderTitle}>{order.title}</Text>
                <Text style={styles.orderDate}>Fecha: {order.date}</Text>
                {order.status === 'ready' && (
                  <Text style={[styles.orderStatus, { color: statusConfig.text }]}>
                    Estado: {statusConfig.label}
                  </Text>
                )}
              </View>
              <View style={styles.orderActions}>
                <Text style={styles.orderIcon}>{icon}</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HospitalColors.gradientMiddle,
  },
  scrollContent: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  backIcon: {
    fontSize: 20,
    color: HospitalColors.white,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: HospitalColors.white,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 16,
    color: HospitalColors.white,
    marginBottom: 25,
    opacity: 0.9,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: HospitalColors.white,
    opacity: 0.8,
  },
  orderCard: {
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: HospitalColors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  orderInfo: {
    flex: 1,
  },
  orderType: {
    fontSize: 11,
    color: HospitalColors.textLight,
    fontWeight: '600',
    marginBottom: 2,
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HospitalColors.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 13,
    color: HospitalColors.textSecondary,
  },
  orderStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  orderIcon: {
    fontSize: 28,
    marginRight: 8,
  },
  arrowIcon: {
    fontSize: 20,
    color: HospitalColors.textPrimary,
    fontWeight: 'bold',
  },
});
