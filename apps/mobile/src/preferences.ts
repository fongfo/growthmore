import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Locale } from "./i18n";

const localePreferenceKey = "growthmore.locale";

export async function loadLocalePreference(): Promise<Locale | null> {
  const value = await AsyncStorage.getItem(localePreferenceKey);
  return value === "zh-CN" || value === "en-US" ? value : null;
}

export async function saveLocalePreference(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(localePreferenceKey, locale);
}
