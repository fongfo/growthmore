import { useCallback, useEffect, useRef, useState } from "react";
import {
  defaultApiBaseUrl,
  emptyMobileAppData,
  fallbackMobileAppData,
  loginDemoParticipant,
  loadMobileAppData,
  MobileApiError,
  setActiveAccessToken,
  validateActiveSession,
  type MobileAppData,
  type MobileDataModule
} from "./mobileAppData";
import { clearDemoSessionToken, loadDemoSessionToken, saveDemoSessionToken } from "../preferences";

type MobileAppDataState = {
  data: MobileAppData;
  errorMessage: string | null;
  isFallback: boolean;
  isDemoMode: boolean;
  moduleErrors: Partial<Record<MobileDataModule, string>>;
  refresh: (module?: MobileDataModule) => Promise<void>;
  setDemoMode: (enabled: boolean) => void;
  status: "loading" | "ready" | "partial" | "error";
  accountStatus: "restoring" | "signedOut" | "signedIn";
  signIn: (participantCode: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useMobileAppData(apiBaseUrl = defaultApiBaseUrl): MobileAppDataState {
  const [data, setData] = useState<MobileAppData>(emptyMobileAppData);
  const dataRef = useRef(data);
  const [status, setStatus] = useState<MobileAppDataState["status"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [moduleErrors, setModuleErrors] = useState<Partial<Record<MobileDataModule, string>>>({});
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [accountStatus, setAccountStatus] = useState<MobileAppDataState["accountStatus"]>("restoring");
  const generation = useRef(0);
  const sessionToken = useRef<string | null>(null);

  const refresh = useCallback(async (module?: MobileDataModule) => {
    if (!sessionToken.current) return;
    const currentGeneration = generation.current;
    if (!module) setStatus("loading");

    try {
      const result = await loadMobileAppData(apiBaseUrl, fetch, dataRef.current, module);
      if (currentGeneration !== generation.current) return;
      dataRef.current = result.data;
      setData(result.data);
      setModuleErrors((current) => module ? { ...current, [module]: result.errors[module] } : result.errors);
      const messages = Object.values(result.errors);
      setErrorMessage(messages.length > 0 ? messages.join(" ") : null);
      setStatus(messages.length > 0 ? "partial" : "ready");
    } catch (error) {
      if (currentGeneration !== generation.current) return;
      setErrorMessage(error instanceof Error ? error.message : "API data load failed.");
      setStatus("error");
    }
  }, [apiBaseUrl]);

  const signIn = useCallback(async (participantCode: string) => {
    const { session } = await loginDemoParticipant(participantCode, apiBaseUrl);
    await saveDemoSessionToken(session.auth.accessToken);
    generation.current += 1;
    sessionToken.current = session.auth.accessToken;
    setActiveAccessToken(session.auth.accessToken);
    dataRef.current = emptyMobileAppData;
    setData(emptyMobileAppData);
    setIsDemoMode(false);
    setAccountStatus("restoring");
    await refresh();
    setAccountStatus("signedIn");
  }, [apiBaseUrl, refresh]);

  const signOut = useCallback(async () => {
    await clearDemoSessionToken();
    generation.current += 1;
    sessionToken.current = null;
    setActiveAccessToken(null);
    dataRef.current = emptyMobileAppData;
    setData(emptyMobileAppData);
    setIsDemoMode(false);
    setErrorMessage(null);
    setModuleErrors({});
    setAccountStatus("signedOut");
  }, []);

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
    let mounted = true;
    void loadDemoSessionToken().then(async (token) => {
      if (!mounted) return;
      if (!token) { setAccountStatus("signedOut"); return; }
      sessionToken.current = token;
      setActiveAccessToken(token);
      try {
        await validateActiveSession(apiBaseUrl);
      } catch (error) {
        if (error instanceof MobileApiError && error.status === 401) {
          await clearDemoSessionToken();
          if (mounted) { sessionToken.current = null; setActiveAccessToken(null); setAccountStatus("signedOut"); }
          return;
        }
      }
      if (!mounted) return;
      await refresh();
      if (mounted) setAccountStatus("signedIn");
    }).catch(() => { if (mounted) setAccountStatus("signedOut"); });
    return () => { mounted = false; generation.current += 1; };
  }, [apiBaseUrl, refresh]);

  return {
    data,
    errorMessage,
    isFallback: isDemoMode,
    isDemoMode,
    moduleErrors,
    refresh,
    setDemoMode,
    status,
    accountStatus,
    signIn,
    signOut
  };
}
