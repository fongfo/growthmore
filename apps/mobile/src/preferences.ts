import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Locale } from "./i18n";

const localePreferenceKey = "growthmore.locale";
const demoSessionKey = "growthmore.demoSessionToken";

export async function loadLocalePreference(): Promise<Locale | null> {
  const value = await AsyncStorage.getItem(localePreferenceKey);
  return value === "zh-CN" || value === "en-US" ? value : null;
}

export async function saveLocalePreference(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(localePreferenceKey, locale);
}

export async function loadDemoSessionToken(): Promise<string | null> {
  return AsyncStorage.getItem(demoSessionKey);
}

export async function saveDemoSessionToken(token: string): Promise<void> {
  await AsyncStorage.setItem(demoSessionKey, token);
}

export async function clearDemoSessionToken(): Promise<void> {
  await AsyncStorage.removeItem(demoSessionKey);
}
