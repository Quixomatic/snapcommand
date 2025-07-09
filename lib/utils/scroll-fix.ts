// Fix for scroll wheel issues in shadow DOM modals
export function enableScrollInShadowDOM() {
  // Allow wheel events to propagate properly in shadow DOM
  const handleWheel = (e: WheelEvent) => {
    const target = e.target as HTMLElement;
    
    // Check if the target is within our shadow DOM
    const shadowRoot = target.getRootNode() as ShadowRoot;
    if (shadowRoot !== document && shadowRoot.host) {
      const hostElement = shadowRoot.host as HTMLElement;
      if (hostElement.closest('#wxt-ui')) {
        // This is our shadow DOM, check if target is scrollable
        const scrollableElement = findScrollableParent(target);
        if (scrollableElement) {
          // Let the event propagate naturally for scrollable elements
          return;
        }
      }
    }
  };

  // Find the nearest scrollable parent
  function findScrollableParent(element: HTMLElement): HTMLElement | null {
    let current = element;
    while (current && current !== document.body) {
      const style = window.getComputedStyle(current);
      const isScrollable = style.overflow === 'auto' || 
                          style.overflow === 'scroll' || 
                          style.overflowY === 'auto' || 
                          style.overflowY === 'scroll';
      
      if (isScrollable && current.scrollHeight > current.clientHeight) {
        return current;
      }
      current = current.parentElement!;
    }
    return null;
  }

  document.addEventListener('wheel', handleWheel, { passive: true, capture: true });
  
  return () => {
    document.removeEventListener('wheel', handleWheel, true);
  };
}