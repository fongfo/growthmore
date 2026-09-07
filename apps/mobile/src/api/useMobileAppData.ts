import { useCallback, useEffect, useState } from "react";
import {
  defaultApiBaseUrl,
  fallbackMobileAppData,
  loadMobileAppData,
  type MobileAppData
} from "./mobileAppData";

type MobileAppDataState = {
  data: MobileAppData;
  errorMessage: string | null;
  isFallback: boolean;
  refresh: () => Promise<void>;
  status: "loading" | "ready" | "error";
};

export function useMobileAppData(apiBaseUrl = defaultApiBaseUrl): MobileAppDataState {
  const [data, setData] = useState<MobileAppData>(fallbackMobileAppData);
  const [status, setStatus] = useState<MobileAppDataState["status"]>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(true);

  const refresh = useCallback(async () => {
    setStatus("loading");

    try {
      const nextData = await loadMobileAppData(apiBaseUrl);
      setData(nextData);
      setErrorMessage(null);
      setIsFallback(false);
      setStatus("ready");
    } catch (error) {
      setData(fallbackMobileAppData);
      setErrorMessage(error instanceof Error ? error.message : "API 数据加载失败");
      setIsFallback(true);
      setStatus("error");
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    data,
    errorMessage,
    isFallback,
    refresh,
    status
  };
}
