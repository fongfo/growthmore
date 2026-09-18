import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultApiBaseUrl,
  emptyMobileAppData,
  fallbackMobileAppData,
  loadMobileAppData,
  type MobileAppData,
  type MobileDataModule
} from "./mobileAppData";

type MobileAppDataState = {
  data: MobileAppData;
  errorMessage: string | null;
  isFallback: boolean;
  isDemoMode: boolean;
  moduleErrors: Partial<Record<MobileDataModule, string>>;
  refresh: (module?: MobileDataModule) => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
  status: "loading" | "ready" | "partial" | "error";
};

export function useMobileAppData(apiBaseUrl = defaultApiBaseUrl): MobileAppDataState {
  const [data, setData] = useState<MobileAppData>(emptyMobileAppData);
  const dataRef = useRef(data);
  const [status, setStatus] = useState<MobileAppDataState["status"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moduleErrors, setModuleErrors] = useState<Partial<Record<MobileDataModule, string>>>({});
  const [isDemoMode, setIsDemoMode] = useState(false);

  const refresh = useCallback(async (module?: MobileDataModule) => {
    if (!module) setStatus("loading");

    try {
      const result = await loadMobileAppData(apiBaseUrl, fetch, dataRef.current, module);
      dataRef.current = result.data;
      setData(result.data);
      setModuleErrors((current) => module ? { ...current, [module]: result.errors[module] } : result.errors);
      const messages = Object.values(result.errors);
      setErrorMessage(messages.length > 0 ? messages.join(" ") : null);
      setStatus(messages.length > 0 ? "partial" : "ready");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "API data load failed.");
      setStatus("error");
    }
  }, [apiBaseUrl]);

  const setDemoMode = useCallback((enabled: boolean) => {
    setIsDemoMode(enabled);
    if (enabled) {
      dataRef.current = fallbackMobileAppData;
      setData(fallbackMobileAppData);
      setStatus("ready");
      return;
    }
    dataRef.current = emptyMobileAppData;
    setData(emptyMobileAppData);
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    errorMessage,
    isFallback: isDemoMode,
    isDemoMode,
    moduleErrors,
    refresh,
    setDemoMode,
    status
  };
}
