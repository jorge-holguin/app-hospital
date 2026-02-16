import { Platform, Text } from 'react-native';

export function HelloWave() {
  // On web, use a simple Text component to avoid worklets issues
  if (Platform.OS === 'web') {
    return (
      <Text style={{ fontSize: 28, lineHeight: 32, marginTop: -6 }}>
        👋
      </Text>
    );
  }

  // On native, use Animated.Text with animation
  const Animated = require('react-native-reanimated').default;
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
