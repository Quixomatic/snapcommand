import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { X, Target, AlertTriangle } from 'lucide-react';

interface CssSelectorInputProps {
  onSelect: (element: HTMLElement) => void;
  onCancel: () => void;
}

export default function CssSelectorInput({ onSelect, onCancel }: CssSelectorInputProps) {
  const [selector, setSelector] = React.useState('');
  const [isValid, setIsValid] = React.useState(true);
  const [matchCount, setMatchCount] = React.useState(0);
  const [selectedElement, setSelectedElement] = React.useState<HTMLElement | null>(null);
  const { toast } = useToast();

  const validateSelector = React.useCallback((selectorString: string) => {
    if (!selectorString.trim()) {
      setIsValid(true);
      setMatchCount(0);
      setSelectedElement(null);
      return;
    }

    try {
      const elements = document.querySelectorAll(selectorString);
      setIsValid(true);
      setMatchCount(elements.length);
      setSelectedElement(elements.length > 0 ? elements[0] as HTMLElement : null);
      
      // Highlight the first matching element
      if (elements.length > 0) {
        const element = elements[0] as HTMLElement;
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add temporary highlight
        const originalOutline = element.style.outline;
        element.style.outline = '3px solid #3b82f6';
        element.style.outlineOffset = '2px';
        
        setTimeout(() => {
          element.style.outline = originalOutline;
        }, 2000);
      }
    } catch (error) {
      setIsValid(false);
      setMatchCount(0);
      setSelectedElement(null);
    }
  }, []);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      validateSelector(selector);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selector, validateSelector]);

  const handleCapture = () => {
    if (!selectedElement) {
      toast({
        title: "No element found",
        description: "Please enter a valid CSS selector that matches an element.",
        variant: "destructive"
      });
      return;
    }

    const rect = selectedElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      toast({
        title: "Invalid element",
        description: "The selected element has zero dimensions and cannot be captured.",
        variant: "destructive"
      });
      return;
    }

    onSelect(selectedElement);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid && selectedElement) {
      handleCapture();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            CSS Selector Capture
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="css-selector">CSS Selector</Label>
            <Input
              id="css-selector"
              value={selector}
              onChange={(e) => setSelector(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., .main-content, #header, h1"
              className={`font-mono ${!isValid ? 'border-red-500' : ''}`}
              autoFocus
            />
            
            {!isValid && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                Invalid CSS selector
              </div>
            )}
            
            {isValid && selector && (
              <div className="text-sm text-muted-foreground">
                {matchCount === 0 ? (
                  "No elements found"
                ) : matchCount === 1 ? (
                  "1 element found"
                ) : (
                  `${matchCount} elements found (first will be captured)`
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Common Selectors</Label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Main Content', selector: 'main, .main, .content' },
                { label: 'Header', selector: 'header, .header' },
                { label: 'Navigation', selector: 'nav, .nav, .navigation' },
                { label: 'First Article', selector: 'article:first-of-type' },
                { label: 'All Images', selector: 'img' },
                { label: 'Code Blocks', selector: 'pre, code' }
              ].map(({ label, selector: exampleSelector }) => (
                <Button
                  key={label}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelector(exampleSelector)}
                  className="text-xs"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleCapture}
              disabled={!isValid || !selectedElement}
            >
              Capture Element
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}