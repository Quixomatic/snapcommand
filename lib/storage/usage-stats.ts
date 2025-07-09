import { browser } from 'wxt/browser';
import React from 'react';

export interface UsageStats {
  screenshotCount: number;
  menuOpenCount: number;
  lastTipShown: number; // timestamp
  lastTipActionCount: number; // action count when tip was last shown/dismissed
  tipDismissCount: number;
  installDate: number; // timestamp
}

const STORAGE_KEY = 'usageStats';
const TIP_FREQUENCY = 3; // Show tip every 3 actions

const defaultStats: UsageStats = {
  screenshotCount: 0,
  menuOpenCount: 0,
  lastTipShown: 0,
  lastTipActionCount: 0,
  tipDismissCount: 0,
  installDate: Date.now(),
};

// Session-based dismiss count (resets on page reload)
let sessionDismissCount = 0;

export function useUsageStats() {
  const [stats, setStats] = React.useState<UsageStats>(defaultStats);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStats().then(setStats).finally(() => setLoading(false));

    // Listen for changes from other tabs/windows
    const listener = (changes: any) => {
      if (changes[STORAGE_KEY]) {
        setStats(changes[STORAGE_KEY].newValue || defaultStats);
      }
    };

    browser.storage.onChanged.addListener(listener);
    return () => browser.storage.onChanged.removeListener(listener);
  }, []);

  const updateStats = React.useCallback(async (updates: Partial<UsageStats>) => {
    const currentStats = await loadStats();
    const newStats = { ...currentStats, ...updates };
    setStats(newStats);
    await saveStats(newStats);
  }, []);

  const incrementScreenshots = React.useCallback(async () => {
    const currentStats = await loadStats();
    await updateStats({ screenshotCount: currentStats.screenshotCount + 1 });
  }, [updateStats]);

  const incrementMenuOpens = React.useCallback(async () => {
    const currentStats = await loadStats();
    await updateStats({ menuOpenCount: currentStats.menuOpenCount + 1 });
  }, [updateStats]);

  const markTipShown = React.useCallback(async () => {
    const totalActions = stats.screenshotCount + stats.menuOpenCount;
    await updateStats({ 
      lastTipShown: Date.now(),
      lastTipActionCount: totalActions
    });
  }, [stats.screenshotCount, stats.menuOpenCount, updateStats]);

  const dismissTip = React.useCallback(async () => {
    const totalActions = stats.screenshotCount + stats.menuOpenCount;
    sessionDismissCount++;
    await updateStats({ 
      lastTipShown: Date.now(),
      lastTipActionCount: totalActions
    });
  }, [stats.screenshotCount, stats.menuOpenCount, updateStats]);

  const shouldShowTip = React.useCallback(() => {
    const totalActions = stats.screenshotCount + stats.menuOpenCount;
    const actionsSinceLastTip = totalActions - stats.lastTipActionCount;
    
    // Show tip if:
    // 1. User has taken at least TIP_FREQUENCY actions
    // 2. It's been TIP_FREQUENCY actions since last tip
    // 3. User hasn't dismissed tips too many times this session (max 3 dismissals)
    const shouldShow = totalActions >= TIP_FREQUENCY && 
           actionsSinceLastTip >= TIP_FREQUENCY && 
           sessionDismissCount < 3;
    
    
    return shouldShow;
  }, [stats]);

  return { 
    stats, 
    loading, 
    incrementScreenshots, 
    incrementMenuOpens, 
    markTipShown, 
    dismissTip,
    shouldShowTip: shouldShowTip()
  };
}

async function loadStats(): Promise<UsageStats> {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY);
    const stored = result[STORAGE_KEY];
    
    if (!stored) {
      // First time - save default stats
      await saveStats(defaultStats);
      return defaultStats;
    }
    
    return { ...defaultStats, ...stored };
  } catch (error) {
    console.error('Failed to load usage stats:', error);
    return defaultStats;
  }
}

async function saveStats(stats: UsageStats): Promise<void> {
  try {
    await browser.storage.local.set({ [STORAGE_KEY]: stats });
  } catch (error) {
    console.error('Failed to save usage stats:', error);
  }
}

export async function incrementScreenshotCount(): Promise<void> {
  try {
    const stats = await loadStats();
    await saveStats({ ...stats, screenshotCount: stats.screenshotCount + 1 });
  } catch (error) {
    console.error('Failed to increment screenshot count:', error);
  }
}

export async function incrementMenuOpenCount(): Promise<void> {
  try {
    const stats = await loadStats();
    await saveStats({ ...stats, menuOpenCount: stats.menuOpenCount + 1 });
  } catch (error) {
    console.error('Failed to increment menu open count:', error);
  }
}