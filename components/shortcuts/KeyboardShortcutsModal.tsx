import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { usePreferences } from '@/lib/storage/preferences';
import { keybindingManager, KeybindingConflict } from '@/lib/utils/keybinding-manager';
import { 
  ArrowLeft, 
  Keyboard, 
  Camera, 
  Maximize, 
  MousePointer, 
  Square, 
  Code, 
  Command,
  AlertTriangle,
  X,
  Edit3,
  Image,
  FileImage,
  Settings,
  ExternalLink
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

interface KeybindingCategory {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  commands: {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<any>;
  }[];
}

const KEYBINDING_CATEGORIES: KeybindingCategory[] = [
  {
    id: 'main',
    label: 'Main Commands',
    icon: Command,
    commands: [
      {
        id: 'toggle-menu',
        label: 'Toggle Command Menu',
        description: 'Open/close the main command menu',
        icon: Command,
      },
      {
        id: 'capture-visible',
        label: 'Capture Visible Area',
        description: 'Capture what you see in the viewport',
        icon: Camera,
      },
      {
        id: 'capture-fullpage',
        label: 'Capture Full Page',
        description: 'Capture the entire scrollable page',
        icon: Maximize,
      },
      {
        id: 'capture-element',
        label: 'Select Element',
        description: 'Click to select any element',
        icon: MousePointer,
      },
      {
        id: 'capture-selection',
        label: 'Draw Selection',
        description: 'Click and drag to capture any area',
        icon: Square,
      },
      {
        id: 'capture-css',
        label: 'CSS Selector',
        description: 'Target elements by CSS selector',
        icon: Code,
      },
    ],
  },
  {
    id: 'formats',
    label: 'Format Selection',
    icon: Image,
    commands: [
      {
        id: 'format-png',
        label: 'PNG Format',
        description: 'Switch to PNG format',
        icon: Image,
      },
      {
        id: 'format-jpg',
        label: 'JPG Format',
        description: 'Switch to JPG format',
        icon: FileImage,
      },
      {
        id: 'format-webp',
        label: 'WebP Format',
        description: 'Switch to WebP format',
        icon: FileImage,
      },
    ],
  },
  {
    id: 'other',
    label: 'Other',
    icon: Settings,
    commands: [
      {
        id: 'preferences',
        label: 'Open Preferences',
        description: 'Open the preferences modal',
        icon: Settings,
      },
    ],
  },
];

export default function KeyboardShortcutsModal({ open, onClose, onBackToMenu }: KeyboardShortcutsModalProps) {
  const { preferences, updatePreferences } = usePreferences();
  const { toast } = useToast();
  const [recordingCommand, setRecordingCommand] = React.useState<string | null>(null);
  const [conflicts, setConflicts] = React.useState<KeybindingConflict[]>([]);

  // Check for conflicts whenever keybindings change
  React.useEffect(() => {
    const newConflicts = keybindingManager.checkConflicts(preferences.keybindings);
    setConflicts(newConflicts);
  }, [preferences.keybindings]);

  const handleStartRecording = (commandId: string) => {
    setRecordingCommand(commandId);
  };

  const handleStopRecording = () => {
    setRecordingCommand(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent, commandId: string) => {
    if (recordingCommand !== commandId) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const keys = keybindingManager.recordKeyCombination(event.nativeEvent);
    if (keys) {
      // Check if this creates a conflict
      const tempKeybindings = {
        ...preferences.keybindings,
        [commandId]: { ...preferences.keybindings[commandId], keys }
      };
      
      const newConflicts = keybindingManager.checkConflicts(tempKeybindings);
      const hasConflict = newConflicts.some(conflict => 
        conflict.commands.includes(commandId) && conflict.commands.length > 1
      );
      
      if (hasConflict) {
        toast({
          title: "Keybinding conflict",
          description: `${keybindingManager.formatKeysForDisplay(keys)} is already used by another command.`,
          variant: "destructive"
        });
        return;
      }
      
      // Update the keybinding
      updatePreferences({
        keybindings: tempKeybindings
      });
      
      setRecordingCommand(null);
      
      toast({
        title: "Keybinding updated",
        description: `Command bound to ${keybindingManager.formatKeysForDisplay(keys)}`,
      });
    }
  };

  const handleToggleKeybinding = (commandId: string) => {
    const currentBinding = preferences.keybindings[commandId];
    updatePreferences({
      keybindings: {
        ...preferences.keybindings,
        [commandId]: {
          ...currentBinding,
          enabled: !currentBinding.enabled
        }
      }
    });
  };

  const handleClearKeybinding = (commandId: string) => {
    updatePreferences({
      keybindings: {
        ...preferences.keybindings,
        [commandId]: {
          ...preferences.keybindings[commandId],
          keys: null
        }
      }
    });
  };

  const handleResetKeybindings = () => {
    // Reset to defaults
    updatePreferences({
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
      }
    });
    
    toast({
      title: "Keybindings reset",
      description: "All keybindings have been reset to defaults.",
    });
  };

  const handleOpenChromeShortcuts = () => {
    window.open('chrome://extensions/shortcuts', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-mockup-target="shortcuts-modal" className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToMenu}
              className="h-8 w-8 mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Custom Keybindings</h3>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenChromeShortcuts}
                className="text-xs"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Chrome Settings
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetKeybindings}>
                Reset All
              </Button>
            </div>
          </div>

          {conflicts.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Keybinding Conflicts</span>
              </div>
              <div className="space-y-1">
                {conflicts.map((conflict, index) => (
                  <div key={index} className="text-sm text-red-600">
                    <span className="font-mono bg-red-100 px-1 rounded">
                      {keybindingManager.formatKeysForDisplay(conflict.keys)}
                    </span>
                    {' is used by: '}
                    {conflict.commands.map((cmd, i) => (
                      <span key={cmd}>
                        {KEYBINDING_CATEGORIES.flatMap(cat => cat.commands).find(c => c.id === cmd)?.label || cmd}
                        {i < conflict.commands.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            {KEYBINDING_CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-4">
                <div className="flex items-center gap-2">
                  <category.icon className="h-4 w-4" />
                  <h4 className="font-medium">{category.label}</h4>
                </div>
                
                <div className="space-y-3">
                  {category.commands.map((command) => {
                    const binding = preferences.keybindings[command.id];
                    const isRecording = recordingCommand === command.id;
                    const hasConflict = conflicts.some(conflict => 
                      conflict.commands.includes(command.id)
                    );
                    
                    return (
                      <div
                        key={command.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          hasConflict ? 'border-red-200 bg-red-50' : 'border-border bg-card'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <command.icon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-sm">{command.label}</div>
                            <div className="text-xs text-muted-foreground">
                              {command.description}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={binding?.enabled ?? false}
                            onCheckedChange={() => handleToggleKeybinding(command.id)}
                            disabled={isRecording}
                          />
                          
                          <div className="flex items-center gap-1">
                            {isRecording ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  placeholder="Press keys..."
                                  className="w-32 text-center font-mono"
                                  onKeyDown={(e) => handleKeyDown(e, command.id)}
                                  onBlur={handleStopRecording}
                                  autoFocus
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleStopRecording}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <div className="w-32 text-center font-mono text-sm py-1 px-2 bg-muted rounded">
                                  {binding?.keys ? keybindingManager.formatKeysForDisplay(binding.keys) : 'None'}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStartRecording(command.id)}
                                  disabled={!binding?.enabled}
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                {binding?.keys && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleClearKeybinding(command.id)}
                                    disabled={!binding?.enabled}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {category.id !== 'other' && <Separator />}
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">Tips</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Click the edit button and press your desired key combination</li>
                  <li>• Use the toggle switch to enable/disable individual shortcuts</li>
                  <li>• Chrome Settings manages global shortcuts (work outside webpage)</li>
                  <li>• Custom shortcuts here work when the extension is active</li>
                  <li>• Conflicts are highlighted in red and must be resolved</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}