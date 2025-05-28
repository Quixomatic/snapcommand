import React from 'react';

interface CaptureContextType {
  isCapturing: boolean;
  setIsCapturing: (value: boolean) => void;
  captureHistory: CaptureHistoryItem[];
  addToHistory: (item: CaptureHistoryItem) => void;
}

export interface CaptureHistoryItem {
  id: string;
  url: string;
  timestamp: Date;
  type: 'visible' | 'fullpage' | 'element' | 'selection';
  domain: string;
  title: string;
  thumbnail?: string;
}

const CaptureContext = React.createContext<CaptureContextType | undefined>(undefined);

export function CaptureProvider({ children }: { children: React.ReactNode }) {
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [captureHistory, setCaptureHistory] = React.useState<CaptureHistoryItem[]>([]);

  const addToHistory = React.useCallback((item: CaptureHistoryItem) => {
    setCaptureHistory(prev => [item, ...prev].slice(0, 50)); // Keep last 50 items
  }, []);

  return (
    <CaptureContext.Provider value={{ isCapturing, setIsCapturing, captureHistory, addToHistory }}>
      {children}
    </CaptureContext.Provider>
  );
}

export function useCaptureContext() {
  const context = React.useContext(CaptureContext);
  if (!context) {
    throw new Error('useCaptureContext must be used within CaptureProvider');
  }
  return context;
}