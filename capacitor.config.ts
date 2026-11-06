import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'fr.fitduo.app',
  appName: 'FitDuo',
  webDir: 'dist',
  backgroundColor: '#090D16',
  android: {
    // Sur Android TV, la WebView doit garder le focus pour recevoir les touches de la télécommande
    captureInput: false,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    TextToSpeech: {},
  },
};

export default config;
