import React from 'react';
import { 
  Download, 
  Copy, 
  Check, 
  X, 
  ZoomIn, 
  ZoomOut,
  RotateCw,
  Edit2,
  Share2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { usePreferences } from '@/lib/storage/preferences';
import { browser } from 'wxt/browser';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useUsageStats } from '@/lib/storage/usage-stats';
import TipFooter from '@/components/tip/TipFooter';

interface CapturePreviewProps {
  imageUrl: string | { imageUrl: string; format: string };
  onClose: () => void;
}

export default function CapturePreview({ imageUrl, onClose }: CapturePreviewProps) {
  const { preferences, updatePreferences } = usePreferences();
  const { toast } = useToast();
  const { shouldShowTip, dismissTip } = useUsageStats();
  
  // Handle both string and object formats for imageUrl
  const actualImageUrl = typeof imageUrl === 'string' ? imageUrl : imageUrl.imageUrl;
  const actualFormat = typeof imageUrl === 'string' ? preferences.format : imageUrl.format;
  
  const [filename, setFilename] = React.useState(generateFilename());
  const [format, setFormat] = React.useState(actualFormat);
  const [quality, setQuality] = React.useState(preferences.quality);
  const [scale, setScale] = React.useState(100);
  const [copied, setCopied] = React.useState(false);
  const [showTip, setShowTip] = React.useState(false);
  
  const imageRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    setShowTip(shouldShowTip);
  }, [shouldShowTip]);

  React.useEffect(() => {
    // Auto-copy if preference is set
    if (preferences.copyToClipboard && preferences.showPreview) {
      handleCopy();
    }
  }, []);

  function generateFilename() {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const domain = window.location.hostname.replace(/\./g, '-');
    return `snapcommand-${domain}-${timestamp}`;
  }

  async function handleCopy() {
    try {
      const blob = await fetch(actualImageUrl).then(r => r.blob());
      
      // For Chrome/Edge that support ClipboardItem
      if ('ClipboardItem' in window) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
      } else {
        // Fallback: Copy data URL to clipboard
        await navigator.clipboard.writeText(actualImageUrl);
      }
      
      setCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "The screenshot has been copied to your clipboard.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Failed to copy",
        description: "Could not copy the image to clipboard.",
        variant: "destructive"
      });
    }
  }

  async function handleDownload() {
    try {
      let downloadUrl = actualImageUrl;
      
      // Convert format if needed
      if (format !== 'png') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();
        
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = actualImageUrl;
        });
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // White background for JPG/WebP
        if (format === 'jpg' || format === 'webp') {
          ctx.fillStyle = preferences.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        downloadUrl = canvas.toDataURL(mimeType, quality / 100);
      }
      
      // Send download message to background script
      await browser.runtime.sendMessage({
        action: 'download',
        url: downloadUrl,
        filename: `${filename}.${format}`,
        saveAs: false
      });
      
      toast({
        title: "Download started!",
        description: `Saving as ${filename}.${format}`,
      });
      
      if (!preferences.showPreview) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to download:', error);
      toast({
        title: "Download failed",
        description: "Could not download the image.",
        variant: "destructive"
      });
    }
  }

  const handleZoom = (delta: number) => {
    setScale(prev => Math.max(10, Math.min(200, prev + delta)));
  };

  const handleTipDismiss = () => {
    setShowTip(false);
    dismissTip();
  };


  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <VisuallyHidden>
          <DialogTitle>Hidden Title</DialogTitle>
        </VisuallyHidden>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Screenshot Preview</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Image Preview */}
        <div className="flex-1 overflow-auto bg-checkered rounded-md">
          <div 
            className="min-h-full flex items-center justify-center p-4"
            style={{ transform: `scale(${scale / 100})`, transformOrigin: 'center' }}
          >
            <img
              ref={imageRef}
              src={actualImageUrl}
              alt="Screenshot preview"
              className="max-w-full h-auto shadow-lg"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex-shrink-0 space-y-4 pt-4">
          {/* Zoom controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(-10)}
              className="h-8 w-8"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{scale}%</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleZoom(10)}
              className="h-8 w-8"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setScale(100)}
              className="h-8 w-8 ml-2"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>

          {/* File options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={format} disabled>
                <SelectTrigger id="format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quality slider for JPG/WebP */}
          {(format === 'jpg' || format === 'webp') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">Quality</Label>
                <span className="text-sm text-muted-foreground">{quality}%</span>
              </div>
              <Slider
                id="quality"
                value={[quality]}
                onValueChange={([v]) => setQuality(v)}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {}}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
        
        {/* Tip Footer */}
        {showTip && (
          <div className="-mx-6 -mb-6 mt-4">
            <TipFooter onDismiss={handleTipDismiss} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}