import React from 'react';
import { elementSelectorManager } from '@/lib/capture/element-selector-manager';
import ElementSelectionPopover from './ElementSelectionPopover';

interface ElementSelectorProps {
  onSelect: (element: HTMLElement) => void;
  onCancel: () => void;
}

export default function ElementSelector({ onSelect, onCancel }: ElementSelectorProps) {
  const [showPopover, setShowPopover] = React.useState(false);
  const [targetElement, setTargetElement] = React.useState<HTMLElement | null>(null);
  const [currentElement, setCurrentElement] = React.useState<HTMLElement | null>(null);
  const [canMoveUp, setCanMoveUp] = React.useState(false);
  const [canMoveDown, setCanMoveDown] = React.useState(false);

  const handleShowPopover = React.useCallback((target: HTMLElement, current: HTMLElement, moveUp: boolean, moveDown: boolean) => {
    setTargetElement(target);
    setCurrentElement(current);
    setCanMoveUp(moveUp);
    setCanMoveDown(moveDown);
    setShowPopover(true);
  }, []);

  const handleMoveUp = React.useCallback(() => {
    elementSelectorManager.moveToParent();
  }, []);

  const handleMoveDown = React.useCallback(() => {
    elementSelectorManager.moveToChild();
  }, []);

  const handleConfirm = React.useCallback(() => {
    if (currentElement) {
      onSelect(currentElement);
    }
    setShowPopover(false);
  }, [currentElement, onSelect]);

  const handleCancel = React.useCallback(() => {
    setShowPopover(false);
    onCancel();
  }, [onCancel]);

  React.useEffect(() => {
    // Start the element selector with popover callback
    elementSelectorManager.start(onSelect, onCancel, handleShowPopover);

    // Cleanup on unmount
    return () => {
      elementSelectorManager.stop();
    };
  }, [onSelect, onCancel, handleShowPopover]);

  return (
    <>
      {showPopover && targetElement && currentElement && (
        <ElementSelectionPopover
          targetElement={targetElement}
          currentElement={currentElement}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
        />
      )}
    </>
  );
}