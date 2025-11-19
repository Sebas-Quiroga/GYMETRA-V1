import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gymetra.app',
  appName: 'GYMETRA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Asegurar que las rutas funcionen correctamente en Android
    allowNavigation: ['*']
  },
  android: {
    // Configuración específica para Android
    allowMixedContent: true
  }
};

export default config;
