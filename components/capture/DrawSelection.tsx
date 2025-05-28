import React from 'react';

interface DrawSelectionProps {
  onSelect: (selection: SelectionArea) => void;
  onCancel: () => void;
}

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function DrawSelection({ onSelect, onCancel }: DrawSelectionProps) {
  const [isDrawing, setIsDrawing] = React.useState(false);
  const [startPoint, setStartPoint] = React.useState({ x: 0, y: 0 });
  const [endPoint, setEndPoint] = React.useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = React.useState(false);
  
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const selectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return; // Only left click
      
      setIsDrawing(true);
      setStartPoint({ x: e.clientX, y: e.clientY });
      setEndPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      let x = e.clientX;
      let y = e.clientY;
      
      // Constrain to square if shift is held
      if (e.shiftKey) {
        const width = Math.abs(x - startPoint.x);
        const height = Math.abs(y - startPoint.y);
        const size = Math.max(width, height);
        
        x = startPoint.x + (x > startPoint.x ? size : -size);
        y = startPoint.y + (y > startPoint.y ? size : -size);
      }
      
      setEndPoint({ x, y });
      updateSelection();
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDrawing) return;
      
      setIsDrawing(false);
      
      const selection = getSelection();
      if (selection.width > 10 && selection.height > 10) {
        onSelect(selection);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      } else if (e.key === 'g' || e.key === 'G') {
        setShowGrid(!showGrid);
      } else if (e.key === 'Enter' && !isDrawing) {
        const selection = getSelection();
        if (selection.width > 10 && selection.height > 10) {
          onSelect(selection);
        }
      }
      
      // Arrow keys for fine adjustment
      if (!isDrawing && selectionRef.current) {
        const step = e.shiftKey ? 10 : 1;
        
        switch (e.key) {
          case 'ArrowUp':
            e.preventDefault();
            setStartPoint(p => ({ ...p, y: p.y - step }));
            setEndPoint(p => ({ ...p, y: p.y - step }));
            break;
          case 'ArrowDown':
            e.preventDefault();
            setStartPoint(p => ({ ...p, y: p.y + step }));
            setEndPoint(p => ({ ...p, y: p.y + step }));
            break;
          case 'ArrowLeft':
            e.preventDefault();
            setStartPoint(p => ({ ...p, x: p.x - step }));
            setEndPoint(p => ({ ...p, x: p.x - step }));
            break;
          case 'ArrowRight':
            e.preventDefault();
            setStartPoint(p => ({ ...p, x: p.x + step }));
            setEndPoint(p => ({ ...p, x: p.x + step }));
            break;
        }
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    document.body.style.cursor = 'crosshair';
    
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.cursor = '';
    };
  }, [isDrawing, startPoint, endPoint, showGrid, onSelect, onCancel]);

  const getSelection = (): SelectionArea => {
    const x = Math.min(startPoint.x, endPoint.x);
    const y = Math.min(startPoint.y, endPoint.y);
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    
    return { x, y, width, height };
  };

  const updateSelection = () => {
    if (!selectionRef.current) return;
    
    const selection = getSelection();
    
    selectionRef.current.style.left = `${selection.x}px`;
    selectionRef.current.style.top = `${selection.y}px`;
    selectionRef.current.style.width = `${selection.width}px`;
    selectionRef.current.style.height = `${selection.height}px`;
  };

  React.useEffect(() => {
    updateSelection();
  }, [startPoint, endPoint]);

  const selection = getSelection();
  const hasSelection = selection.width > 0 && selection.height > 0;

  return (
    <div data-snapcommand className="fixed inset-0 z-[999999]">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/30"
        style={{ cursor: 'crosshair' }}
      />

      {/* Grid overlay */}
      {showGrid && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            zIndex: 999997
          }}
        />
      )}

      {/* Selection rectangle */}
      {hasSelection && (
        <div
          ref={selectionRef}
          className="absolute pointer-events-none"
          style={{
            border: '2px solid #3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            zIndex: 999998
          }}
        >
          {/* Marching ants animation */}
          <style>{`
            @keyframes marching-ants {
              0% { background-position: 0 0, 0 0, 0 0, 0 0; }
              100% { background-position: 8px 0, 0 8px, -8px 0, 0 -8px; }
            }
          `}</style>
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(90deg, #3b82f6 50%, transparent 50%),
                linear-gradient(0deg, #3b82f6 50%, transparent 50%),
                linear-gradient(90deg, #3b82f6 50%, transparent 50%),
                linear-gradient(0deg, #3b82f6 50%, transparent 50%)
              `,
              backgroundSize: '8px 2px, 2px 8px, 8px 2px, 2px 8px',
              backgroundPosition: '0 0, 100% 0, 0 100%, 0 0',
              backgroundRepeat: 'repeat-x, repeat-y, repeat-x, repeat-y',
              animation: 'marching-ants 0.5s linear infinite'
            }}
          />
          
          {/* Dimension display */}
          <div 
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap"
            style={{ zIndex: 999999 }}
          >
            {Math.round(selection.width)} × {Math.round(selection.height)} px
          </div>
        </div>
      )}

      {/* Instructions */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-md shadow-lg"
        style={{ zIndex: 999999 }}
      >
        <div>Click and drag to select area • Hold Shift for square</div>
        <div className="text-xs opacity-75 mt-1">
          Press G for grid • Arrow keys to adjust • Enter to capture • ESC to cancel
        </div>
      </div>

      {/* Action buttons */}
      {hasSelection && !isDrawing && (
        <div 
          className="absolute flex gap-2"
          style={{ 
            left: `${selection.x + selection.width / 2}px`,
            top: `${selection.y + selection.height + 20}px`,
            transform: 'translateX(-50%)',
            zIndex: 999999 
          }}
        >
          <button
            onClick={() => onSelect(selection)}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
          >
            Capture
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}