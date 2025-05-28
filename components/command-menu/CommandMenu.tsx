import React from 'react';
import { Command } from 'cmdk';
import { 
  Camera, 
  Maximize, 
  MousePointer, 
  Square, 
  Code,
  Grid3X3,
  Settings,
  Keyboard,
  History,
  HelpCircle,
  Copy,
  Download,
  Eye,
  Image,
  FileImage,
  X
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePreferences } from '@/lib/storage/preferences';
import { cn } from '@/lib/utils/cn';

interface CommandMenuProps {
  onClose: () => void;
  onCaptureVisible: () => void;
  onCaptureFullPage: () => void;
  onCaptureElement: () => void;
  onCaptureSelection: () => void;
}

export default function CommandMenu({
  onClose,
  onCaptureVisible,
  onCaptureFullPage,
  onCaptureElement,
  onCaptureSelection
}: CommandMenuProps) {
  const [search, setSearch] = React.useState('');
  const { preferences, updatePreferences } = usePreferences();

  const captureActions = [
    {
      id: 'capture-visible',
      label: 'Visible Area',
      description: 'Capture what you see (viewport only)',
      icon: Camera,
      shortcut: '⌘⇧V',
      action: onCaptureVisible
    },
    {
      id: 'capture-fullpage',
      label: 'Full Page',
      description: 'Capture entire scrollable page',
      icon: Maximize,
      shortcut: '⌘⇧F',
      action: onCaptureFullPage
    },
    {
      id: 'capture-element',
      label: 'Select Element',
      description: 'Click to choose any element',
      icon: MousePointer,
      shortcut: '⌘⇧E',
      action: onCaptureElement
    },
    {
      id: 'capture-selection',
      label: 'Draw Selection',
      description: 'Click and drag to capture any area',
      icon: Square,
      shortcut: '⌘⇧D',
      action: onCaptureSelection
    },
    {
      id: 'capture-css',
      label: 'CSS Selector...',
      description: 'Target elements by CSS selector',
      icon: Code,
      shortcut: '⌘⇧S',
      action: () => {} // TODO: Implement CSS selector
    },
    {
      id: 'capture-tabs',
      label: 'All Open Tabs',
      description: 'Batch capture visible areas',
      icon: Grid3X3,
      shortcut: '⌘⇧A',
      action: () => {} // TODO: Implement batch capture
    }
  ];

  const formatOptions = [
    { id: 'png', label: 'PNG', icon: Image, shortcut: '⌘1' },
    { id: 'jpg', label: 'JPG', icon: FileImage, shortcut: '⌘2' },
    { id: 'webp', label: 'WebP', icon: FileImage, shortcut: '⌘3' }
  ];

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      
      // Format shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '3') {
        e.preventDefault();
        const formatIndex = parseInt(e.key) - 1;
        const format = formatOptions[formatIndex];
        if (format) {
          updatePreferences({ format: format.id as any });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, updatePreferences]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="p-0 max-w-2xl overflow-hidden">
        <Command className="rounded-lg shadow-lg">
          <div className="flex items-center border-b px-3">
            <Camera className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type to search for commands..."
              className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <button
              onClick={onClose}
              className="ml-2 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <Command.List className="max-h-[400px] overflow-y-auto">
            <Command.Empty className="py-6 text-center text-sm">
              No results found.
            </Command.Empty>

            {/* Capture Modes */}
            <Command.Group heading="Capture Modes">
              {captureActions.map((action) => (
                <Command.Item
                  key={action.id}
                  value={action.label}
                  onSelect={action.action}
                  className="relative flex cursor-pointer items-center px-4 py-3 hover:bg-accent"
                >
                  <action.icon className="mr-3 h-4 w-4" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{action.label}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="bg-secondary px-1.5 py-0.5 rounded">
                          {preferences.format.toUpperCase()}
                        </span>
                        <span className="bg-secondary px-1.5 py-0.5 rounded">
                          {preferences.autoDownload ? 'Download' : 'Copy'}
                        </span>
                        <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                          {action.shortcut}
                        </kbd>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator />

            {/* Quick Settings */}
            <Command.Group heading="Quick Settings">
              <Command.Item
                value="Copy to Clipboard"
                onSelect={() => updatePreferences({ copyToClipboard: !preferences.copyToClipboard })}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent"
              >
                <div className="flex items-center">
                  <Copy className="mr-3 h-4 w-4" />
                  <span>Copy to Clipboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={preferences.copyToClipboard} />
                  <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    ⌘⇧C
                  </kbd>
                </div>
              </Command.Item>

              <Command.Item
                value="Auto Download"
                onSelect={() => updatePreferences({ autoDownload: !preferences.autoDownload })}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent"
              >
                <div className="flex items-center">
                  <Download className="mr-3 h-4 w-4" />
                  <span>Auto Download</span>
                </div>
                <Switch checked={preferences.autoDownload} />
              </Command.Item>

              <Command.Item
                value="Show Preview"
                onSelect={() => updatePreferences({ showPreview: !preferences.showPreview })}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent"
              >
                <div className="flex items-center">
                  <Eye className="mr-3 h-4 w-4" />
                  <span>Show Preview</span>
                </div>
                <Switch checked={preferences.showPreview} />
              </Command.Item>
            </Command.Group>

            <Command.Separator />

            {/* Format Selection */}
            <Command.Group heading="Format">
              {formatOptions.map((format) => (
                <Command.Item
                  key={format.id}
                  value={format.label}
                  onSelect={() => updatePreferences({ format: format.id as any })}
                  className="flex items-center justify-between px-4 py-2 hover:bg-accent"
                >
                  <div className="flex items-center">
                    <format.icon className="mr-3 h-4 w-4" />
                    <span>{format.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-4 h-4 rounded-full border-2",
                      preferences.format === format.id 
                        ? "border-primary bg-primary" 
                        : "border-muted-foreground"
                    )}>
                      {preferences.format === format.id && (
                        <span className="block w-2 h-2 rounded-full bg-background m-0.5" />
                      )}
                    </span>
                    <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                      {format.shortcut}
                    </kbd>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator />

            {/* More Options */}
            <Command.Group heading="More Options">
              <Command.Item
                value="Preferences"
                onSelect={() => {}}
                className="flex items-center px-4 py-2 hover:bg-accent"
              >
                <Settings className="mr-3 h-4 w-4" />
                <span>Preferences</span>
                <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                  ⌘,
                </kbd>
              </Command.Item>

              <Command.Item
                value="Keyboard Shortcuts"
                onSelect={() => {}}
                className="flex items-center px-4 py-2 hover:bg-accent"
              >
                <Keyboard className="mr-3 h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </Command.Item>

              <Command.Item
                value="Capture History"
                onSelect={() => {}}
                className="flex items-center px-4 py-2 hover:bg-accent"
              >
                <History className="mr-3 h-4 w-4" />
                <span>Capture History</span>
              </Command.Item>

              <Command.Item
                value="Help & Tips"
                onSelect={() => {}}
                className="flex items-center px-4 py-2 hover:bg-accent"
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                <span>Help & Tips</span>
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="border-t px-4 py-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>[{preferences.format.toUpperCase()}]</span>
                <span>[{preferences.autoDownload ? 'Auto-Download ✓' : 'Download'}]</span>
                <span>[{preferences.copyToClipboard ? 'Copy ✓' : 'Copy'}]</span>
                <span>[Scale: {preferences.scale}x]</span>
              </div>
              <span>⌘K to search</span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}