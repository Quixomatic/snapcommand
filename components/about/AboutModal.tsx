import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Github, User, Code } from 'lucide-react';
import TipFooter from '@/components/tip/TipFooter';
import { useUsageStats } from '@/lib/storage/usage-stats';

interface AboutModalProps {
  open: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

export default function AboutModal({ open, onClose, onBackToMenu }: AboutModalProps) {
  const { dismissTip } = useUsageStats();
  const [showTip, setShowTip] = React.useState(true); // Always show tip in About modal

  const handleTipDismiss = () => {
    setShowTip(false);
    dismissTip();
  };

  const version = "1.0.0"; // This could be dynamically imported from package.json in a real app

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-mockup-target="about-modal" className="max-w-md">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBackToMenu}
            className="h-8 w-8 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Camera className="h-5 w-5" />
            <DialogTitle className="text-lg font-semibold">About SnapCommand</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* App Info */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mb-3">
              <Camera className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold">SnapCommand</h2>
            <p className="text-sm text-muted-foreground">
              Professional screenshot extension with command menu interface
            </p>
            <div className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs">
              Version {version}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Features</h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Multiple capture modes (Visible, Full Page, Element, Selection)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Customizable keyboard shortcuts
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Professional image processing (PNG, JPG, WebP)
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                Capture history and management
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Built With</h3>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-secondary rounded">React 18</span>
              <span className="px-2 py-1 bg-secondary rounded">TypeScript</span>
              <span className="px-2 py-1 bg-secondary rounded">WXT Framework</span>
              <span className="px-2 py-1 bg-secondary rounded">Tailwind CSS</span>
              <span className="px-2 py-1 bg-secondary rounded">Radix UI</span>
            </div>
          </div>

          {/* Author & Links */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Developer</h3>
            <div className="space-y-2">
              <p className="text-sm">Created by <span className="font-medium">James Freund</span></p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => window.open('https://github.com/Quixomatic', '_blank')}
                >
                  <User className="h-3 w-3" />
                  Developer
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-2"
                  onClick={() => window.open('https://github.com/Quixomatic/snapcommand', '_blank')}
                >
                  <Github className="h-3 w-3" />
                  Repository
                </Button>
              </div>
            </div>
          </div>

          {/* License */}
          <div className="pt-4 border-t text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <Code className="h-3 w-3" />
              Open source under MIT License
            </div>
            <p className="mt-1">
              Made with ❤️ for productivity enthusiasts
            </p>
          </div>
        </div>

        {/* Always show tip footer in About modal */}
        {showTip && (
          <div className="-mx-6 -mb-6 mt-4">
            <TipFooter onDismiss={handleTipDismiss} hideDismiss={true} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}