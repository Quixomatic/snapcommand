import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  HelpCircle, 
  Camera, 
  Lightbulb, 
  Target, 
  MousePointer, 
  Square, 
  Code, 
  Settings, 
  Zap,
  Download,
  Copy,
  Eye,
  Maximize,
  Keyboard
} from 'lucide-react';

interface HelpTipsModalProps {
  open: boolean;
  onClose: () => void;
  onBackToMenu: () => void;
}

const tips = [
  {
    category: 'Getting Started',
    icon: Camera,
    tips: [
      {
        icon: Zap,
        title: 'Quick Start',
        description: 'Press Ctrl+Shift+S (⌘⇧S on Mac) to open the command menu and start capturing screenshots instantly.'
      },
      {
        icon: Target,
        title: 'Choose Your Method',
        description: 'Select from 5 capture modes: Visible Area, Full Page, Element Selection, Draw Selection, and CSS Selector.'
      },
      {
        icon: Settings,
        title: 'Customize Your Workflow',
        description: 'Set your preferred format (PNG, JPG, WebP), enable auto-download, or copy directly to clipboard.'
      }
    ]
  },
  {
    category: 'Capture Modes',
    icon: MousePointer,
    tips: [
      {
        icon: Camera,
        title: 'Visible Area (⌘⇧V)',
        description: 'Captures exactly what you see in your browser viewport. Perfect for quick screenshots.'
      },
      {
        icon: Maximize,
        title: 'Full Page (⌘⇧F)',
        description: 'Captures the entire scrollable page, including content below the fold. Great for documentation.'
      },
      {
        icon: MousePointer,
        title: 'Element Selection (⌘⇧E)',
        description: 'Click on any element to capture just that component. Hover to see the selection highlight.'
      },
      {
        icon: Square,
        title: 'Draw Selection (⌘⇧D)',
        description: 'Click and drag to draw a custom rectangular selection. Perfect for capturing specific areas.'
      },
      {
        icon: Code,
        title: 'CSS Selector (⌘⇧C)',
        description: 'Enter a CSS selector to target specific elements. Use for repeated captures or complex selections.'
      }
    ]
  },
  {
    category: 'Pro Tips',
    icon: Lightbulb,
    tips: [
      {
        icon: Keyboard,
        title: 'Master the Shortcuts',
        description: 'Learn keyboard shortcuts for faster workflow. Press ⌘1-3 to quickly switch between PNG, JPG, and WebP formats.'
      },
      {
        icon: Copy,
        title: 'Clipboard Integration',
        description: 'Enable "Copy to Clipboard" to paste screenshots directly into other applications like Slack or email.'
      },
      {
        icon: Download,
        title: 'Smart Naming',
        description: 'Auto-generated filenames include the domain and timestamp, making it easy to organize your screenshots.'
      },
      {
        icon: Eye,
        title: 'Preview Before Saving',
        description: 'Enable "Show Preview" to review your screenshots before saving. Edit or recapture if needed.'
      },
      {
        icon: Settings,
        title: 'Format Selection',
        description: 'Choose PNG for transparency, JPG for smaller file sizes, or WebP for the best compression with quality.'
      }
    ]
  },
  {
    category: 'Advanced Features',
    icon: Target,
    tips: [
      {
        icon: Code,
        title: 'CSS Selector Examples',
        description: 'Try selectors like ".main-content", "#header", "article:first-of-type", or "img" to target specific elements.'
      },
      {
        icon: Settings,
        title: 'Scale Factor',
        description: 'Adjust the scale factor in preferences for higher resolution captures when using Element or CSS selector modes.'
      },
      {
        icon: Camera,
        title: 'Quality Settings',
        description: 'Fine-tune JPG and WebP quality settings in preferences to balance file size and image quality.'
      }
    ]
  }
];

export default function HelpTipsModal({ open, onClose, onBackToMenu }: HelpTipsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
            <HelpCircle className="h-5 w-5" />
            Help & Tips
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {tips.map((category, categoryIndex) => (
            <div key={categoryIndex} className="space-y-4">
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{category.category}</h3>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {category.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 rounded-full bg-primary/10">
                        <tip.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h4 className="font-medium text-sm">{tip.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {categoryIndex < tips.length - 1 && <Separator />}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-3 rounded-full bg-primary/20">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-lg mb-3">Need More Help?</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Check the <strong>Keyboard Shortcuts</strong> modal for a complete list of shortcuts</p>
                <p>• Use <strong>Capture History</strong> to revisit and re-download previous screenshots</p>
                <p>• Adjust <strong>Preferences</strong> to customize the extension to your workflow</p>
                <p>• The command menu shows your current settings at the bottom for quick reference</p>
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