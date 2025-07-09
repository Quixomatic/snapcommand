import hotkeys from 'hotkeys-js';
import { Preferences } from '@/lib/storage/preferences';

export interface KeybindingCommand {
  id: string;
  label: string;
  description: string;
  category: string;
  handler: () => void;
}

export interface KeybindingConflict {
  keys: string;
  commands: string[];
}

class KeybindingManager {
  private commands: Map<string, KeybindingCommand> = new Map();
  private activeBindings: Map<string, string> = new Map(); // commandId -> keys

  constructor() {
    // Configure hotkeys
    hotkeys.filter = (event) => {
      // Allow hotkeys in all contexts
      return true;
    };
  }

  /**
   * Register a command that can be bound to keys
   */
  registerCommand(command: KeybindingCommand) {
    this.commands.set(command.id, command);
  }

  /**
   * Update an existing command's handler
   */
  updateCommand(commandId: string, updates: Partial<KeybindingCommand>) {
    const existing = this.commands.get(commandId);
    if (existing) {
      this.commands.set(commandId, { ...existing, ...updates });
    }
  }

  /**
   * Update keybindings based on preferences
   */
  updateKeybindings(preferences: Preferences) {
    // Clear existing bindings
    this.clearAllBindings();

    // Register new bindings
    Object.entries(preferences.keybindings).forEach(([commandId, binding]) => {
      if (binding.enabled && binding.keys) {
        this.bindCommand(commandId, binding.keys);
      }
    });
  }

  /**
   * Bind a command to specific keys
   */
  private bindCommand(commandId: string, keys: string) {
    const command = this.commands.get(commandId);
    if (!command) {
      console.warn(`Command ${commandId} not found`);
      return;
    }

    try {
      hotkeys(keys, (event) => {
        event.preventDefault();
        command.handler();
      });
      
      this.activeBindings.set(commandId, keys);
    } catch (error) {
      console.error(`Failed to bind ${keys} to ${commandId}:`, error);
    }
  }

  /**
   * Clear all active bindings
   */
  private clearAllBindings() {
    this.activeBindings.forEach((keys) => {
      hotkeys.unbind(keys);
    });
    this.activeBindings.clear();
  }

  /**
   * Check for conflicts in proposed keybindings
   */
  checkConflicts(keybindings: Preferences['keybindings']): KeybindingConflict[] {
    const conflicts: KeybindingConflict[] = [];
    const keyMap: Map<string, string[]> = new Map();

    // Build map of keys to commands
    Object.entries(keybindings).forEach(([commandId, binding]) => {
      if (binding.enabled && binding.keys) {
        const normalizedKeys = this.normalizeKeys(binding.keys);
        if (!keyMap.has(normalizedKeys)) {
          keyMap.set(normalizedKeys, []);
        }
        keyMap.get(normalizedKeys)!.push(commandId);
      }
    });

    // Find conflicts
    keyMap.forEach((commands, keys) => {
      if (commands.length > 1) {
        conflicts.push({ keys, commands });
      }
    });

    return conflicts;
  }

  /**
   * Normalize key combination for comparison
   */
  private normalizeKeys(keys: string): string {
    return keys.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/cmd/g, 'ctrl') // Normalize cmd to ctrl
      .split('+')
      .sort()
      .join('+');
  }

  /**
   * Get all registered commands
   */
  getCommands(): KeybindingCommand[] {
    return Array.from(this.commands.values());
  }

  /**
   * Check if a key combination is valid
   */
  isValidKeyCombination(keys: string): boolean {
    try {
      // Test if hotkeys can parse the combination
      const testHandler = () => {};
      hotkeys(keys, testHandler);
      hotkeys.unbind(keys);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Record key combination from keyboard events
   */
  recordKeyCombination(event: KeyboardEvent): string | null {
    if (!event.key || event.key === 'Tab' || event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt' || event.key === 'Meta') {
      return null;
    }

    const parts: string[] = [];
    
    if (event.ctrlKey || event.metaKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    
    // Handle special keys
    let key = event.key.toLowerCase();
    if (key === ' ') key = 'space';
    if (key === 'escape') key = 'esc';
    if (key === 'arrowup') key = 'up';
    if (key === 'arrowdown') key = 'down';
    if (key === 'arrowleft') key = 'left';
    if (key === 'arrowright') key = 'right';
    
    parts.push(key);
    
    return parts.join('+');
  }

  /**
   * Format key combination for display
   */
  formatKeysForDisplay(keys: string): string {
    if (!keys) return '';
    
    return keys
      .split('+')
      .map(key => {
        switch (key.toLowerCase()) {
          case 'ctrl': return '⌘';
          case 'alt': return '⌥';
          case 'shift': return '⇧';
          case 'meta': return '⌘';
          case 'cmd': return '⌘';
          case 'space': return '⎵';
          case 'esc': return '⎋';
          case 'enter': return '⏎';
          case 'backspace': return '⌫';
          case 'delete': return '⌦';
          case 'tab': return '⇥';
          case 'up': return '↑';
          case 'down': return '↓';
          case 'left': return '←';
          case 'right': return '→';
          default: return key.toUpperCase();
        }
      })
      .join('');
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    this.clearAllBindings();
    this.commands.clear();
  }
}

// Export singleton instance
export const keybindingManager = new KeybindingManager();