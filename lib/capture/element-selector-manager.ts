export class ElementSelectorManager {
  private overlay: HTMLDivElement | null = null;
  private highlight: HTMLDivElement | null = null;
  private tooltip: HTMLDivElement | null = null;
  private instructions: HTMLDivElement | null = null;
  private hoveredElement: HTMLElement | null = null;
  private selectedElement: HTMLElement | null = null;
  private elementHistory: HTMLElement[] = [];
  private historyIndex: number = 0;
  private mode: 'selecting' | 'confirming' = 'selecting';
  private onSelect: ((element: HTMLElement) => void) | null = null;
  private onCancel: (() => void) | null = null;
  private onShowPopover: ((element: HTMLElement, currentElement: HTMLElement, canMoveUp: boolean, canMoveDown: boolean) => void) | null = null;
  private popoverOpen: boolean = false;
  private boundHandlers: {
    mouseMove: (e: MouseEvent) => void;
    click: (e: MouseEvent) => void;
    keyDown: (e: KeyboardEvent) => void;
    scroll: (e: Event) => void;
  };

  constructor() {
    this.boundHandlers = {
      mouseMove: this.handleMouseMove.bind(this),
      click: this.handleClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      scroll: this.handleScroll.bind(this)
    };
  }

  start(onSelect: (element: HTMLElement) => void, onCancel: () => void, onShowPopover?: (element: HTMLElement, currentElement: HTMLElement, canMoveUp: boolean, canMoveDown: boolean) => void) {
    this.onSelect = onSelect;
    this.onCancel = onCancel;
    this.onShowPopover = onShowPopover;
    this.mode = 'selecting';
    this.elementHistory = [];
    this.historyIndex = 0;
    this.createOverlay();
    this.attachEventListeners();
  }

  stop() {
    this.removeEventListeners();
    this.removeOverlay();
    this.onSelect = null;
    this.onCancel = null;
    this.popoverOpen = false;
  }

  private createOverlay() {
    // Create container that's outside shadow DOM
    const container = document.createElement('div');
    container.id = 'snapcommand-element-selector';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2147483646;
      pointer-events: none;
    `;

    // Overlay
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.2);
      pointer-events: none;
    `;
    container.appendChild(this.overlay);

    // Highlight
    this.highlight = document.createElement('div');
    this.highlight.style.cssText = `
      position: absolute;
      border: 2px solid #3b82f6;
      background-color: rgba(59, 130, 246, 0.1);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      pointer-events: none;
      transition: all 75ms ease;
      display: none;
    `;
    container.appendChild(this.highlight);

    // Tooltip
    this.tooltip = document.createElement('div');
    this.tooltip.style.cssText = `
      position: absolute;
      background-color: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-family: monospace;
      font-size: 12px;
      pointer-events: none;
      display: none;
    `;
    container.appendChild(this.tooltip);

    // Instructions
    this.instructions = document.createElement('div');
    this.instructions.style.cssText = `
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      background-color: #1f2937;
      color: white;
      padding: 8px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      font-size: 14px;
      pointer-events: none;
    `;
    this.instructions.textContent = 'Click an element to capture • Press ESC to cancel';
    container.appendChild(this.instructions);

    document.body.appendChild(container);
    document.body.style.cursor = 'crosshair';
  }

  private removeOverlay() {
    const container = document.getElementById('snapcommand-element-selector');
    if (container) {
      container.remove();
    }
    document.body.style.cursor = '';
    this.overlay = null;
    this.highlight = null;
    this.tooltip = null;
    this.instructions = null;
  }

  private attachEventListeners() {
    // Use capture phase (true) and prevent all clicks
    document.addEventListener('mousemove', this.boundHandlers.mouseMove, true);
    document.addEventListener('click', this.boundHandlers.click, true);
    document.addEventListener('mousedown', this.preventEvent, true);
    document.addEventListener('mouseup', this.preventEvent, true);
    document.addEventListener('keydown', this.boundHandlers.keyDown, true);
    document.addEventListener('scroll', this.boundHandlers.scroll, true);
    // Prevent context menu
    document.addEventListener('contextmenu', this.preventEvent, true);
  }

  private removeEventListeners() {
    document.removeEventListener('mousemove', this.boundHandlers.mouseMove, true);
    document.removeEventListener('click', this.boundHandlers.click, true);
    document.removeEventListener('mousedown', this.preventEvent, true);
    document.removeEventListener('mouseup', this.preventEvent, true);
    document.removeEventListener('keydown', this.boundHandlers.keyDown, true);
    document.removeEventListener('scroll', this.boundHandlers.scroll, true);
    document.removeEventListener('contextmenu', this.preventEvent, true);
  }

  private preventEvent = (e: Event) => {
    // Don't interfere with our own UI
    const target = e.target as HTMLElement;
    
    // Always allow events within our shadow DOM (#snapcommand-root)
    if (target && target.closest('#snapcommand-root')) {
      return;
    }
    
    // Also allow events within the element selector overlay
    if (target && target.closest('#snapcommand-element-selector')) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  private handleMouseMove(e: MouseEvent) {
    const target = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    
    // Ignore our own UI elements
    if (target && 
        !target.closest('#snapcommand-element-selector') && 
        !target.closest('#snapcommand-root') &&
        !target.closest('[data-snapcommand]')) {
      
      // Only update hover in selecting mode
      if (this.mode === 'selecting') {
        this.hoveredElement = target;
        this.updateHighlight(target, e.clientX, e.clientY);
      }
    }
  }

  private handleClick(e: MouseEvent) {
    // Allow clicks on our UI elements
    const target = e.target as HTMLElement;
    
    // Always allow clicks within our shadow DOM (#snapcommand-root)
    if (target && target.closest('#snapcommand-root')) {
      return;
    }
    
    // Also allow clicks within the element selector overlay
    if (target && target.closest('#snapcommand-element-selector')) {
      return;
    }
    
    // Allow clicks on the shadow root host itself (snapcommand-ui)
    if (target && target.tagName === 'SNAPCOMMAND-UI') {
      return;
    }

    // Prevent all other clicks to avoid accidental webpage interactions
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    
    // Get the element that was clicked on
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
    
    if (this.mode === 'selecting' && this.hoveredElement) {
      // Ensure the element has dimensions
      const rect = this.hoveredElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.selectedElement = this.hoveredElement;
        this.mode = 'confirming';
        
        // Initialize history with the selected element
        this.elementHistory = [this.hoveredElement];
        this.historyIndex = 0;
        
        // Hide selection UI and show popover
        this.hideSelectionUI();
        this.updateHighlightForSelected();
        this.showPopover();
      } else {
        console.warn('Cannot capture element with zero dimensions');
      }
    } else if (this.mode === 'confirming') {
      // If clicking on a different element while confirming, reset and select the new element
      if (clickedElement && clickedElement !== this.selectedElement && 
          !clickedElement.closest('#snapcommand-element-selector') &&
          !clickedElement.closest('#snapcommand-root') &&
          !clickedElement.closest('[data-snapcommand]')) {
        
        const rect = clickedElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.selectedElement = clickedElement;
          this.elementHistory = [clickedElement];
          this.historyIndex = 0;
          this.updateHighlightForSelected();
          this.showPopover();
        }
      }
    }
  }

  private showPopover() {
    if (this.onShowPopover && this.selectedElement) {
      const canMoveUp = this.selectedElement.parentElement && this.selectedElement.parentElement !== document.body;
      const canMoveDown = this.historyIndex > 0;
      
      this.popoverOpen = true;
      this.onShowPopover(this.selectedElement, this.selectedElement, canMoveUp, canMoveDown);
    }
  }

  private hideSelectionUI() {
    if (this.tooltip) this.tooltip.style.display = 'none';
    if (this.instructions) this.instructions.style.display = 'none';
  }

  private updateHighlightForSelected() {
    if (this.highlight && this.selectedElement) {
      const rect = this.selectedElement.getBoundingClientRect();
      this.highlight.style.left = `${rect.left}px`;
      this.highlight.style.top = `${rect.top}px`;
      this.highlight.style.width = `${rect.width}px`;
      this.highlight.style.height = `${rect.height}px`;
      this.highlight.style.display = 'block';
      // Change to green for confirmation mode
      this.highlight.style.border = '3px solid #10b981';
      this.highlight.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      this.highlight.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.3)';
    }
  }

  moveToParent() {
    if (!this.selectedElement?.parentElement || this.selectedElement.parentElement === document.body) return;
    
    // Add current to history if we're at the end
    if (this.historyIndex === this.elementHistory.length - 1) {
      this.elementHistory.push(this.selectedElement.parentElement);
      this.historyIndex++;
    } else {
      // We're navigating in existing history
      this.historyIndex++;
    }
    
    this.selectedElement = this.elementHistory[this.historyIndex];
    this.updateHighlightForSelected();
    this.showPopover();
  }

  moveToChild() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.selectedElement = this.elementHistory[this.historyIndex];
      this.updateHighlightForSelected();
      this.showPopover();
    }
  }

  confirmCurrentSelection() {
    this.popoverOpen = false;
    this.confirmElement();
  }

  cancelCurrentSelection() {
    this.popoverOpen = false;
    this.cancelSelection();
  }

  private confirmElement() {
    if (this.selectedElement && this.onSelect) {
      this.onSelect(this.selectedElement);
    }
    this.stop();
  }

  private cancelSelection() {
    if (this.onCancel) {
      this.onCancel();
    }
    this.stop();
  }

  private resetToSelecting() {
    this.mode = 'selecting';
    this.selectedElement = null;
    this.elementHistory = [];
    this.historyIndex = 0;
    
    // Show selection UI
    if (this.instructions) this.instructions.style.display = 'block';
    if (this.tooltip) this.tooltip.style.display = 'block';
    
    // Reset highlight color
    if (this.highlight) {
      this.highlight.style.border = '2px solid #3b82f6';
      this.highlight.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      this.highlight.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.3)';
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (this.mode === 'confirming') {
        this.cancelSelection();
      } else if (this.onCancel) {
        this.onCancel();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.mode === 'confirming' && this.selectedElement) {
        this.confirmElement();
      } else if (this.mode === 'selecting' && this.hoveredElement) {
        const rect = this.hoveredElement.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          this.selectedElement = this.hoveredElement;
          this.mode = 'confirming';
          this.elementHistory = [this.hoveredElement];
          this.historyIndex = 0;
          this.hideSelectionUI();
          this.updateHighlightForSelected();
          this.showPopover();
        }
      }
    } else if (this.mode === 'confirming') {
      // Navigation keys in confirmation mode
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.moveToParent();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.moveToChild();
      }
    }
  }

  private handleScroll(e: Event) {
    // Update highlight position when scrolling in confirming mode
    if (this.mode === 'confirming' && this.selectedElement) {
      this.updateHighlightForSelected();
    }
  }

  private updateHighlight(element: HTMLElement, mouseX: number, mouseY: number) {
    if (!this.highlight || !this.tooltip) return;

    const rect = element.getBoundingClientRect();
    
    // Skip elements with no dimensions
    if (rect.width === 0 || rect.height === 0) {
      this.highlight.style.display = 'none';
      this.tooltip.style.display = 'none';
      return;
    }

    // Update highlight position
    this.highlight.style.display = 'block';
    this.highlight.style.left = `${rect.left}px`;
    this.highlight.style.top = `${rect.top}px`;
    this.highlight.style.width = `${rect.width}px`;
    this.highlight.style.height = `${rect.height}px`;

    // Update tooltip
    const tagName = element.tagName.toLowerCase();
    const id = element.id ? `#${element.id}` : '';
    const classList = element.className ? element.className.split(' ').filter(Boolean) : [];
    const classes = classList.length > 0 ? `.${classList.slice(0, 2).join('.')}` : '';
    const selector = `${tagName}${id}${classes}`;
    const dimensions = `${Math.round(rect.width)} × ${Math.round(rect.height)} px`;

    this.tooltip.innerHTML = `
      <div>${selector}</div>
      <div style="opacity: 0.75; font-size: 11px; margin-top: 2px;">${dimensions}</div>
    `;
    this.tooltip.style.display = 'block';

    // Position tooltip
    const tooltipRect = this.tooltip.getBoundingClientRect();
    let tooltipX = mouseX + 10;
    let tooltipY = mouseY + 10;

    // Keep tooltip in viewport
    if (tooltipX + tooltipRect.width > window.innerWidth) {
      tooltipX = mouseX - tooltipRect.width - 10;
    }
    if (tooltipY + tooltipRect.height > window.innerHeight) {
      tooltipY = mouseY - tooltipRect.height - 10;
    }

    this.tooltip.style.left = `${tooltipX}px`;
    this.tooltip.style.top = `${tooltipY}px`;
  }
}

// Create a singleton instance
export const elementSelectorManager = new ElementSelectorManager();