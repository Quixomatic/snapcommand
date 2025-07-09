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
  
  // File settings
  filenameTemplate: string;
  
  
  // History settings
  historyLimit: number; // Number of screenshots to keep in history
  
  // Keybinding settings
  keybindings: {
    [commandId: string]: {
      keys: string | null; // null = disabled
      enabled: boolean;
    }
  }
}

const defaultPreferences: Preferences = {
  format: 'png',
  quality: 95,
  scale: 1,
  backgroundColor: '#ffffff',
  copyToClipboard: false,
  autoDownload: true,
  showPreview: true,
  filenameTemplate: 'snapcommand-{domain}-{timestamp}',
  historyLimit: 10,
  keybindings: {
    'toggle-menu': { keys: 'ctrl+shift+s', enabled: true },
    'capture-visible': { keys: 'ctrl+shift+v', enabled: true },
    'capture-fullpage': { keys: 'ctrl+shift+f', enabled: true },
    'capture-element': { keys: 'ctrl+shift+e', enabled: true },
    'capture-selection': { keys: 'ctrl+shift+d', enabled: true },
    'capture-css': { keys: 'ctrl+shift+c', enabled: true },
    'format-png': { keys: 'ctrl+1', enabled: true },
    'format-jpg': { keys: 'ctrl+2', enabled: true },
    'format-webp': { keys: 'ctrl+3', enabled: true },
    'preferences': { keys: 'ctrl+,', enabled: true },
  },
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