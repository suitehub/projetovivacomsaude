import { useState, useEffect } from "react";
import { getStoreSettings, StoreSettings } from "@/data/store-settings";

export function useStoreSettings(): StoreSettings {
  const [settings, setSettings] = useState<StoreSettings>(() => getStoreSettings());

  useEffect(() => {
    setSettings(getStoreSettings());
    const handleUpdate = () => {
      setSettings(getStoreSettings());
    };

    window.addEventListener("viva_store_settings_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("viva_store_settings_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return settings;
}
