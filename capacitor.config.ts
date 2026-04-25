import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.evocore.mobile',
  appName: 'EvoCore',
  webDir: 'dist',
  server: {
    url: 'https://d0db6e43-e6e3-4a96-8f0d-fb34425ac250.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#0B1220',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B1220',
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Geolocation: {
      // iOS/Android permissions are declared in Info.plist / AndroidManifest.xml
    },
    Camera: {
      // iOS/Android permissions are declared in Info.plist / AndroidManifest.xml
    },
  },
};

export default config;
