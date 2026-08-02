import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CmsValues = Record<string, string>;

interface CmsContentContextValue {
  values: CmsValues;
  isLoading: boolean;
  getText: (key: string, fallback?: string) => string;
  refresh: () => Promise<void>;
}

const CmsContentContext = createContext<CmsContentContextValue | null>(null);

const readCmsValues = async (): Promise<CmsValues> => {
  const response = await fetch('/api/cms/content', {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    return {};
  }

  const data = await response.json().catch(() => ({}));
  const rawValues = data?.values && typeof data.values === 'object' ? data.values : data;

  return Object.fromEntries(
    Object.entries(rawValues || {})
      .filter(([, value]) => typeof value === 'string')
      .map(([key, value]) => [key, value as string])
  );
};

export function CmsContentProvider({ children }: { children: React.ReactNode }) {
  const [values, setValues] = useState<CmsValues>({});
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setValues(await readCmsValues());
    } catch {
      setValues({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getText = useCallback((key: string, fallback = '') => {
    return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback;
  }, [values]);

  const contextValue = useMemo<CmsContentContextValue>(() => ({
    values,
    isLoading,
    getText,
    refresh
  }), [values, isLoading, getText, refresh]);

  return (
    <CmsContentContext.Provider value={contextValue}>
      {children}
    </CmsContentContext.Provider>
  );
}

export function useCmsContent() {
  const context = useContext(CmsContentContext);
  if (!context) {
    throw new Error('useCmsContent must be used within CmsContentProvider');
  }
  return context;
}

export function useCmsText() {
  return useCmsContent().getText;
}
