import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { usePreferences } from '@/lib/storage/preferences';
import { clearHistory } from '@/lib/storage/capture-history';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Image, Download, Copy, Eye, Palette, ArrowLeft, History, Trash2, Cog } from 'lucide-react';

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

export default function PreferencesModal({ open, onClose, onBackToMenu }: PreferencesModalProps) {
  const { preferences, updatePreferences } = usePreferences();
  const { toast } = useToast();

  const handleReset = () => {
    updatePreferences({
      format: 'png',
      quality: 95,
      scale: 1,
      backgroundColor: '#ffffff',
      copyToClipboard: false,
      autoDownload: true,
      showPreview: true,
      playSound: false,
      filenameTemplate: 'snapcommand-{domain}-{timestamp}',
      captureDelay: 0,
      includeCursor: false,
      historyLimit: 10,
    });
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all capture history? This action cannot be undone.')) {
      await clearHistory();
      toast({
        title: "History cleared",
        description: "All screenshots have been removed from history.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
            <Settings className="h-5 w-5" />
            Preferences
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Format Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <h3 className="font-medium">Image Format</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={preferences.format} onValueChange={(value: any) => updatePreferences({ format: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Scale Factor</Label>
                <Select value={preferences.scale.toString()} onValueChange={(value) => updatePreferences({ scale: parseFloat(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5x (Half Size)</SelectItem>
                    <SelectItem value="0.66">0.66x (Two Thirds)</SelectItem>
                    <SelectItem value="0.75">0.75x (Three Quarters)</SelectItem>
                    <SelectItem value="1">1x (Normal)</SelectItem>
                    <SelectItem value="1.5">1.5x (One and Half)</SelectItem>
                    <SelectItem value="2">2x (High DPI)</SelectItem>
                    <SelectItem value="2.5">2.5x (Two and Half)</SelectItem>
                    <SelectItem value="3">3x (Ultra High DPI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(preferences.format === 'jpg' || preferences.format === 'webp') && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Quality</Label>
                    <span className="text-sm text-muted-foreground">{preferences.quality}%</span>
                  </div>
                  <Slider
                    value={[preferences.quality]}
                    onValueChange={([value]) => updatePreferences({ quality: value })}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={preferences.backgroundColor}
                      onChange={(e) => updatePreferences({ backgroundColor: e.target.value })}
                      className="w-16 h-8 p-1"
                    />
                    <Input
                      value={preferences.backgroundColor}
                      onChange={(e) => updatePreferences({ backgroundColor: e.target.value })}
                      className="flex-1 font-mono"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <Separator />

          {/* Behavior Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <h3 className="font-medium">Behavior</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  <Label>Copy to Clipboard</Label>
                </div>
                <Switch
                  checked={preferences.copyToClipboard}
                  onCheckedChange={(checked) => {
                    const updates: any = { copyToClipboard: checked };
                    
                    // If disabling copy and auto download is also disabled, enable show preview
                    if (!checked && !preferences.autoDownload) {
                      updates.showPreview = true;
                    }
                    
                    updatePreferences(updates);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <Label>Auto Download</Label>
                </div>
                <Switch
                  checked={preferences.autoDownload}
                  onCheckedChange={(checked) => {
                    const updates: any = { autoDownload: checked };
                    
                    // If disabling auto download and copy is also disabled, enable show preview
                    if (!checked && !preferences.copyToClipboard) {
                      updates.showPreview = true;
                    }
                    
                    updatePreferences(updates);
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <Label>Show Preview</Label>
                </div>
                <Switch
                  checked={preferences.showPreview}
                  onCheckedChange={(checked) => {
                    // Prevent disabling if both copy and download are disabled
                    if (preferences.showPreview && !preferences.copyToClipboard && !preferences.autoDownload) {
                      return;
                    }
                    updatePreferences({ showPreview: checked });
                  }}
                  disabled={preferences.showPreview && !preferences.copyToClipboard && !preferences.autoDownload}
                />
              </div>

            </div>
          </div>

          <Separator />

          {/* File Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <h3 className="font-medium">File Settings</h3>
            </div>

            <div className="space-y-2">
              <Label>Filename Template</Label>
              <Input
                value={preferences.filenameTemplate}
                onChange={(e) => updatePreferences({ filenameTemplate: e.target.value })}
                placeholder="snapcommand-{domain}-{timestamp}"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Available variables: {'{domain}'}, {'{timestamp}'}, {'{title}'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Advanced Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Cog className="h-4 w-4" />
              <h3 className="font-medium">Advanced Settings</h3>
            </div>

            <div className="space-y-2">
              <Label>CORS Proxy URL</Label>
              <Input
                value={preferences.corsProxy}
                onChange={(e) => updatePreferences({ corsProxy: e.target.value })}
                placeholder="https://corsproxy.io/?url="
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Optional proxy for cross-origin images. Leave empty to disable.
              </p>
            </div>
          </div>

          <Separator />

          {/* History Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <h3 className="font-medium">History Settings</h3>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>History Limit</Label>
                  <span className="text-sm text-muted-foreground">{preferences.historyLimit} screenshots</span>
                </div>
                <Slider
                  value={[preferences.historyLimit]}
                  onValueChange={([value]) => updatePreferences({ historyLimit: value })}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Number of screenshots to keep in history (5-100)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Clear History</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove all screenshots from history
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}