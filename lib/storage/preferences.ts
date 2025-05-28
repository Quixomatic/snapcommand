import { browser } from 'wxt/browser';
import React from 'react';

export interface Preferences {
  // Capture settings
  format: 'png' | 'jpg' | 'webp';
  quality: number; // 0-100 for jpg/webp
  scale: number; // Device pixel ratio multiplier
  backgroundColor: string; // For jpg/webp
  
  // Behavior settings
  copyToClipboard: boolean;
  autoDownload: boolean;
  showPreview: boolean;
  playSound: boolean;
  
  // File settings
  filenameTemplate: string;
  
  // Advanced settings
  captureDelay: number; // Milliseconds
  includeCursor: boolean;
}

const defaultPreferences: Preferences = {
  format: 'png',
  quality: 95,
  scale: 2,
  backgroundColor: '#ffffff',
  copyToClipboard: false,
  autoDownload: true,
  showPreview: true,
  playSound: false,
  filenameTemplate: 'snapcommand-{domain}-{timestamp}',
  captureDelay: 0,
  includeCursor: false,
};

export function usePreferences() {
  const [preferences, setPreferences] = React.useState<Preferences>(defaultPreferences);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Load preferences from storage
    loadPreferences().then(setPreferences).finally(() => setLoading(false));

    // Listen for changes from other tabs/windows
    const listener = (changes: any) => {
      if (changes.preferences) {
        setPreferences(changes.preferences.newValue);
      }
    };

    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, []);

  const updatePreferences = React.useCallback(async (updates: Partial<Preferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  }, [preferences]);

  return { preferences, updatePreferences, loading };
}

export async function loadPreferences(): Promise<Preferences> {
  try {
    const result = await browser.storage.sync.get('preferences');
    return { ...defaultPreferences, ...result.preferences };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return defaultPreferences;
  }
}

export async function savePreferences(preferences: Preferences): Promise<void> {
  try {
    await browser.storage.sync.set({ preferences });
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}