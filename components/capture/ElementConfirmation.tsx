import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, ArrowUp, ArrowDown } from 'lucide-react';

interface ElementConfirmationProps {
  selectedElement: HTMLElement;
  onConfirm: (element: HTMLElement) => void;
  onCancel: () => void;
}

export default function ElementConfirmation({ selectedElement, onConfirm, onCancel }: ElementConfirmationProps) {
  const [currentElement, setCurrentElement] = React.useState<HTMLElement>(selectedElement);
  const [elementPath, setElementPath] = React.useState<HTMLElement[]>([]);

  React.useEffect(() => {
    // Build the path from current element to document.body
    const path: HTMLElement[] = [];
    let element = currentElement;
    
    while (element && element !== document.body && element.parentElement) {
      path.push(element);
      element = element.parentElement;
    }
    
    setElementPath(path);
  }, [currentElement]);

  React.useEffect(() => {
    // Highlight the current element
    const highlight = document.getElementById('snapcommand-element-highlight');
    if (highlight && currentElement) {
      const rect = currentElement.getBoundingClientRect();
      highlight.style.left = `${rect.left}px`;
      highlight.style.top = `${rect.top}px`;
      highlight.style.width = `${rect.width}px`;
      highlight.style.height = `${rect.height}px`;
      highlight.style.display = 'block';
    }
  }, [currentElement]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleMoveUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMoveDown();
          break;
        case 'Enter':
          e.preventDefault();
          onConfirm(currentElement);
          break;
        case 'Escape':
          e.preventDefault();
          onCancel();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentElement, onConfirm, onCancel]);

  const handleMoveUp = () => {
    if (currentElement.parentElement && currentElement.parentElement !== document.body) {
      setCurrentElement(currentElement.parentElement);
    }
  };

  const handleMoveDown = () => {
    const currentIndex = elementPath.indexOf(currentElement);
    if (currentIndex > 0) {
      setCurrentElement(elementPath[currentIndex - 1]);
    }
  };

  const getElementInfo = (element: HTMLElement) => {
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classList = element.className ? element.className.split(' ').filter(Boolean) : [];
    const classes = classList.length > 0 ? `.${classList.slice(0, 2).join('.')}${classList.length > 2 ? '...' : ''}` : '';
    const rect = element.getBoundingClientRect();
    
    return {
      selector: `${tagName}${id}${classes}`,
      dimensions: `${Math.round(rect.width)} × ${Math.round(rect.height)} px`
    };
  };

  const currentInfo = getElementInfo(currentElement);
  const canMoveUp = currentElement.parentElement && currentElement.parentElement !== document.body;
  const canMoveDown = elementPath.indexOf(currentElement) > 0;

  return (
    <>
      {/* Highlight overlay */}
      <div
        id="snapcommand-element-highlight"
        style={{
          position: 'fixed',
          border: '3px solid #10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.3)',
          pointerEvents: 'none',
          zIndex: 2147483645,
          transition: 'all 150ms ease',
          display: 'none'
        }}
      />

      {/* Confirmation UI */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#1f2937',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          zIndex: 2147483647,
          minWidth: '320px',
          maxWidth: '500px'
        }}
      >
        {/* Element info */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontFamily: 'monospace', 
            fontSize: '14px', 
            fontWeight: 'bold',
            marginBottom: '4px',
            color: '#10b981'
          }}>
            {currentInfo.selector}
          </div>
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.8 
          }}>
            {currentInfo.dimensions}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <button
            onClick={handleMoveUp}
            disabled={!canMoveUp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: canMoveUp ? '#374151' : '#1f2937',
              color: canMoveUp ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: canMoveUp ? 'pointer' : 'not-allowed'
            }}
          >
            <ArrowUp size={14} />
            Parent
          </button>
          
          <button
            onClick={handleMoveDown}
            disabled={!canMoveDown}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              fontSize: '12px',
              backgroundColor: canMoveDown ? '#374151' : '#1f2937',
              color: canMoveDown ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '6px',
              cursor: canMoveDown ? 'pointer' : 'not-allowed'
            }}
          >
            <ArrowDown size={14} />
            Child
          </button>
        </div>

        {/* Action buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => onConfirm(currentElement)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <Check size={16} />
            Capture This
          </button>
          
          <button
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <X size={16} />
            Cancel
          </button>
        </div>

        {/* Instructions */}
        <div style={{ 
          marginTop: '12px',
          fontSize: '11px',
          opacity: 0.7,
          textAlign: 'center'
        }}>
          Use ↑↓ arrows or Parent/Child buttons to navigate • ESC to cancel
        </div>
      </div>
    </>
  );
}