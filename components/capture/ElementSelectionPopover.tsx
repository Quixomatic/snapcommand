import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Check, X } from 'lucide-react';

interface ElementSelectionPopoverProps {
  targetElement: HTMLElement;
  currentElement: HTMLElement;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export default function ElementSelectionPopover({
  targetElement,
  currentElement,
  onMoveUp,
  onMoveDown,
  onConfirm,
  onCancel,
  canMoveUp,
  canMoveDown
}: ElementSelectionPopoverProps) {
  const [virtualElement, setVirtualElement] = React.useState<any>(null);

  React.useEffect(() => {
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate optimal position for popover
      // Use a smaller reference area for better positioning
      let positionRect = {
        width: Math.min(rect.width, 200), // Cap width for positioning
        height: Math.min(rect.height, 100), // Cap height for positioning
        top: rect.top,
        left: rect.left,
        right: rect.right,
        bottom: rect.bottom,
        x: rect.left,
        y: rect.top,
      };
      
      // Adjust position to keep popover visible
      // If element is too wide, center the popover position area
      if (rect.width > viewportWidth * 0.8) {
        const centerX = rect.left + rect.width / 2;
        positionRect.left = centerX - 100;
        positionRect.right = centerX + 100;
        positionRect.x = positionRect.left;
        positionRect.width = 200;
      }
      
      // If element is too tall, position near the top
      if (rect.height > viewportHeight * 0.8) {
        positionRect.top = Math.max(rect.top, 50);
        positionRect.bottom = positionRect.top + 100;
        positionRect.y = positionRect.top;
        positionRect.height = 100;
      }
      
      // Ensure the positioning area is within viewport bounds
      positionRect.left = Math.max(10, Math.min(positionRect.left, viewportWidth - 220));
      positionRect.top = Math.max(10, Math.min(positionRect.top, viewportHeight - 150));
      positionRect.x = positionRect.left;
      positionRect.y = positionRect.top;
      positionRect.right = positionRect.left + positionRect.width;
      positionRect.bottom = positionRect.top + positionRect.height;
      
      // Create a virtual element for positioning
      const virtual = {
        getBoundingClientRect: () => positionRect,
        contextElement: targetElement,
      };
      
      setVirtualElement(virtual);
    }
  }, [targetElement]);

  if (!virtualElement) return null;

  return (
    <Popover open={true}>
      <PopoverTrigger asChild>
        <div
          style={{
            position: 'absolute',
            left: virtualElement.getBoundingClientRect().left,
            top: virtualElement.getBoundingClientRect().top,
            width: virtualElement.getBoundingClientRect().width,
            height: virtualElement.getBoundingClientRect().height,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-3 bg-background border shadow-lg"
        side="top"
        align="center"
        sideOffset={8}
        avoidCollisions={true}
        collisionPadding={20}
        collisionBoundary={document.body}
        sticky="always"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-1">
          {/* Navigation buttons */}
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move to parent element"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
          
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            title="Move to child element"
          >
            <ArrowDown className="h-4 w-4" />
          </button>
          
          {/* Separator */}
          <div className="w-px h-6 bg-border mx-1" />
          
          {/* Action buttons */}
          <button
            onClick={onConfirm}
            className="h-8 w-8 flex items-center justify-center rounded bg-green-600 text-white hover:bg-green-700"
            title="Capture this element"
          >
            <Check className="h-4 w-4" />
          </button>
          
          <button
            onClick={onCancel}
            className="h-8 w-8 flex items-center justify-center rounded bg-red-600 text-white hover:bg-red-700"
            title="Cancel selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        {/* Element info */}
        <div className="mt-2 text-xs text-muted-foreground">
          <div className="font-mono">
            {getElementSelector(currentElement)}
          </div>
          <div className="opacity-75">
            {getElementDimensions(currentElement)}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getElementSelector(element: HTMLElement): string {
  const tagName = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classList = element.className ? element.className.split(' ').filter(Boolean) : [];
  const classes = classList.length > 0 ? `.${classList.slice(0, 2).join('.')}${classList.length > 2 ? '...' : ''}` : '';
  return `${tagName}${id}${classes}`;
}

function getElementDimensions(element: HTMLElement): string {
  const rect = element.getBoundingClientRect();
  return `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;
}