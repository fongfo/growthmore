import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = new Map<string, string>();

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => { storage.set(key, value); })
  }
}));

import { loadLocalePreference, saveLocalePreference } from "./preferences";

describe("locale preference", () => {
  beforeEach(() => storage.clear());

  it("persists and restores a supported locale", async () => {
    await saveLocalePreference("en-US");
    await expect(loadLocalePreference()).resolves.toBe("en-US");
  });

  it("ignores an unsupported stored value", async () => {
    storage.set("growthmore.locale", "fr-FR");
    await expect(loadLocalePreference()).resolves.toBeNull();
  });
});
