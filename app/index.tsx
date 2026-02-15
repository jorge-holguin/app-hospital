import { HospitalColors } from '@/constants/theme';
import { startNetworkMonitor } from '@/services/networkManager';
import { SessionManager } from '@/utils/session';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start network monitor for offline-first sync
    startNetworkMonitor();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(async () => {
      const isLoggedIn = await SessionManager.isLoggedIn();
      router.replace(isLoggedIn ? '/dashboard' : '/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topCurve} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoRing}>
          <Image
            source={require('@/assets/images/hospital-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Hospital José Agurto Tello</Text>
        <Text style={styles.subtitle}>Chosica</Text>
      </Animated.View>
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.loader} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: HospitalColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topCurve: {
    position: 'absolute',
    top: -height * 0.15,
    left: -50,
    right: -50,
    height: height * 0.45,
    backgroundColor: HospitalColors.primary,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
    opacity: 0.08,
  },
  content: {
    alignItems: 'center',
  },
  logoRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: HospitalColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: HospitalColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    borderWidth: 3,
    borderColor: HospitalColors.primarySoft,
    marginBottom: 28,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: HospitalColors.primaryDark,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: HospitalColors.textLight,
    marginTop: 4,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  loader: {
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: HospitalColors.primaryLight,
  },
});
