export default {
  expo: {
    name: 'Road Runner',
    slug: 'road-runner',
    version: '1.0.0',
    platforms: ['ios', 'android'],
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    scheme: 'roadrunner',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#121212',
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSLocationWhenInUseUsageDescription: '러닝 코스 출발지를 설정하고 경로를 만들기 위해 위치 권한이 필요합니다.',
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#121212',
      },
      permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    },
    plugins: ['expo-router', 'expo-location'],
    extra: {
      APPS_SCRIPT_URL:
        process.env.APPS_SCRIPT_URL ||
        'https://script.google.com/macros/s/AKfycbzjez6Q7J9eP0YLXsdG2KYs6GJnWsLhOYPoc1B9aUjJKjmKpHgZH0G45WWbYGjTdw5V/exec',
    },
  },
};
