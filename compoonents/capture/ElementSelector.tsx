import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ElementSelectorProps {
  onSelect: (element: HTMLElement) => void;
  onCancel: () => void;
}

export default function ElementSelector({ onSelect, onCancel }: ElementSelectorProps) {
  const [hoveredElement, setHoveredElement] = React.useState<HTMLElement | null>(null);
  const [selectedElement, setSelectedElement] = React.useState<HTMLElement | null>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const highlightRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
      
      // Ignore our own UI elements
      if (target && !target.closest('[data-snapcommand]')) {
        setHoveredElement(target);
        updateHighlight(target, e.clientX, e.clientY);
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (hoveredElement) {
        setSelectedElement(hoveredElement);
        onSelect(hoveredElement);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'Enter' && hoveredElement) {
        onSelect(hoveredElement);
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeyDown, true);

    // Prevent all other interactions
    document.body.style.cursor = 'crosshair';
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove, true);
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.cursor = '';
    };
  }, [hoveredElement, onSelect, onCancel]);

  const updateHighlight = (element: HTMLElement, mouseX: number, mouseY: number) => {
    if (!highlightRef.current || !tooltipRef.current) return;

    const rect = element.getBoundingClientRect();
    
    // Update highlight position
    highlightRef.current.style.left = `${rect.left + window.scrollX}px`;
    highlightRef.current.style.top = `${rect.top + window.scrollY}px`;
    highlightRef.current.style.width = `${rect.width}px`;
    highlightRef.current.style.height = `${rect.height}px`;

    // Update tooltip
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classes = element.className ? `.${element.className.split(' ').filter(Boolean).join('.')}` : '';
    const selector = `${tagName}${id}${classes}`;
    const dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;

    tooltipRef.current.innerHTML = `
      <div class="font-mono text-xs">${selector}</div>
      <div class="text-xs opacity-75">${dimensions}</div>
    `;

    // Position tooltip
    const tooltipWidth = 200;
    const tooltipHeight = 50;
    let tooltipX = mouseX + 10;
    let tooltipY = mouseY + 10;

    // Keep tooltip in viewport
    if (tooltipX + tooltipWidth > window.innerWidth) {
      tooltipX = mouseX - tooltipWidth - 10;
    }
    if (tooltipY + tooltipHeight > window.innerHeight) {
      tooltipY = mouseY - tooltipHeight - 10;
    }

    tooltipRef.current.style.left = `${tooltipX}px`;
    tooltipRef.current.style.top = `${tooltipY}px`;
  };

  return (
    <div data-snapcommand className="fixed inset-0 z-[999999]">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/20"
        style={{ pointerEvents: 'none' }}
      />

      {/* Highlight */}
      <div
        ref={highlightRef}
        className="absolute pointer-events-none transition-all duration-75"
        style={{
          border: '2px solid #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.3)',
          zIndex: 999998
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-gray-900 text-white px-3 py-2 rounded-md shadow-lg"
        style={{ zIndex: 999999 }}
      />

      {/* Instructions */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg"
        style={{ zIndex: 999999 }}
      >
        Click an element to capture • Press ESC to cancel
      </div>
    </div>
  );
}