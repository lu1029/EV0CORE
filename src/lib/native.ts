import { Capacitor } from "@capacitor/core";

/**
 * Initialize native plugins only when running inside Capacitor (iOS/Android).
 * On web, this is a no-op so the site keeps working exactly the same.
 */
export async function initNative() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#0B1220" });
    }
  } catch (e) {
    console.warn("[native] StatusBar init failed", e);
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    // give the app a moment to render, then hide
    setTimeout(() => SplashScreen.hide().catch(() => {}), 600);
  } catch (e) {
    console.warn("[native] SplashScreen init failed", e);
  }

  // Push notifications: register only if permission already granted; otherwise
  // request when the user opts in from settings — avoids surprise prompts.
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const perm = await PushNotifications.checkPermissions();
    if (perm.receive === "granted") {
      await PushNotifications.register();
    }
  } catch (e) {
    console.warn("[native] Push init failed", e);
  }
}

export const isNative = () => Capacitor.isNativePlatform();
export const nativePlatform = () => Capacitor.getPlatform();
