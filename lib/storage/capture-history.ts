import { browser } from 'wxt/browser';
import React from 'react';
import { loadPreferences } from './preferences';

export interface CaptureHistoryItem {
  id: string;
  timestamp: number;
  url: string;
  domain: string;
  title: string;
  type: 'visible' | 'fullpage' | 'element' | 'selection' | 'css';
  format: 'png' | 'jpg' | 'webp';
  dataUrl: string;
  size: number; // in bytes
  dimensions: {
    width: number;
    height: number;
  };
}

const STORAGE_KEY = 'captureHistory';

export function useCaptureHistory() {
  const [history, setHistory] = React.useState<CaptureHistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadHistory().then(setHistory).finally(() => setLoading(false));

    // Listen for changes from other tabs/windows
    const listener = (changes: any) => {
      if (changes[STORAGE_KEY]) {
        setHistory(changes[STORAGE_KEY].newValue || []);
      }
    };

    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, []);

  const addToHistory = React.useCallback(async (item: Omit<CaptureHistoryItem, 'id' | 'timestamp'>) => {
    const preferences = await loadPreferences();
    const newItem: CaptureHistoryItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };

    const currentHistory = await loadHistory();
    const updatedHistory = [newItem, ...currentHistory].slice(0, preferences.historyLimit);
    
    await saveHistory(updatedHistory);
    setHistory(updatedHistory);
  }, []);

  const removeFromHistory = React.useCallback(async (id: string) => {
    const currentHistory = await loadHistory();
    const updatedHistory = currentHistory.filter(item => item.id !== id);
    
    await saveHistory(updatedHistory);
    setHistory(updatedHistory);
  }, []);

  const clearHistory = React.useCallback(async () => {
    await saveHistory([]);
    setHistory([]);
  }, []);

  return { history, loading, addToHistory, removeFromHistory, clearHistory };
}

export async function clearHistory(): Promise<void> {
  await saveHistory([]);
}

async function loadHistory(): Promise<CaptureHistoryItem[]> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || [];
  } catch (error) {
    console.error('Failed to load capture history:', error);
    return [];
  }
}

async function saveHistory(history: CaptureHistoryItem[]): Promise<void> {
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: history });
  } catch (error) {
    console.error('Failed to save capture history:', error);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function addCaptureToHistory(
  type: CaptureHistoryItem['type'],
  format: CaptureHistoryItem['format'],
  dataUrl: string
): Promise<void> {
  try {
    // Get image dimensions
    const dimensions = await getImageDimensions(dataUrl);
    
    // Calculate file size (approximate)
    const size = Math.round((dataUrl.length * 3) / 4); // Base64 to bytes approximation
    
    const item: Omit<CaptureHistoryItem, 'id' | 'timestamp'> = {
      url: window.location.href,
      domain: window.location.hostname,
      title: document.title,
      type,
      format,
      dataUrl,
      size,
      dimensions,
    };

    // Load current history and add new item
    const preferences = await loadPreferences();
    const currentHistory = await loadHistory();
    const newItem: CaptureHistoryItem = {
      ...item,
      id: generateId(),
      timestamp: Date.now(),
    };
    
    const updatedHistory = [newItem, ...currentHistory].slice(0, preferences.historyLimit);
    await saveHistory(updatedHistory);
  } catch (error) {
    console.error('Failed to add capture to history:', error);
  }
}

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = dataUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}