import React from 'react';
import CommandMenu from '@/components/command-menu/CommandMenu';
import CapturePreview from '@/components/capture/CapturePreview';
import PreferencesModal from '@/components/preferences/PreferencesModal';
import KeyboardShortcutsModal from '@/components/shortcuts/KeyboardShortcutsModal';
import AboutModal from '@/components/about/AboutModal';

interface MockupModeProps {
  onClose: () => void;
}

export default function MockupMode({ onClose }: MockupModeProps) {
  const [stylesApplied, setStylesApplied] = React.useState(false);
  
  // Mock handlers for the demo modals
  const mockHandlers = {
    onClose: () => {},
    onCaptureVisible: () => {},
    onCaptureFullPage: () => {},
    onCaptureElement: () => {},
    onCaptureSelection: () => {},
    onCaptureCSS: () => {},
    onOpenPreferences: () => {},
    onOpenShortcuts: () => {},
    onOpenHistory: () => {},
    onOpenHelp: () => {},
    onOpenAbout: () => {},
    onBackToMenu: () => {},
  };

  // Mock image for preview modal
  const mockImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiM2Njc3ZjQiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiM4Yjk2ZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PHRleHQgeD0iNTAlIiB5PSI0NSUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9IjYwMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TbmFwQ29tbWFuZDwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU1JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuOCkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Nb2NrIFNjcmVlbnNob3Q8L3RleHQ+PC9zdmc+";

  // Apply custom styling to modal dialogs when mockup mode is active
  const applyMockupStyles = () => {
    console.log('[MockupMode] Applying mockup styles...');
    
    // Find the shadow root first
    const shadowHost = document.querySelector('snapcommand-ui');
    console.log('[MockupMode] Shadow host found:', shadowHost);
    
    if (!shadowHost || !shadowHost.shadowRoot) {
      console.log('[MockupMode] No shadow root found!');
      return;
    }

    const shadowRoot = shadowHost.shadowRoot;
    
    // Inject the float animation keyframes into the shadow DOM
    let style = shadowRoot.getElementById('mockup-float-animation') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'mockup-float-animation';
      style.textContent = `
        @keyframes floatLoop {
          0%, 100% {
            transform: rotateX(51deg) rotateZ(43deg) translate3d(-400px, -16px, 50px);
            box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 28px 0 rgb(34 33 81 / 10%), 54px 54px 28px -10px rgb(34 33 81 / 45%);
          }
          50% {
            transform: rotateX(51deg) rotateZ(43deg) translate3d(-400px, -26px, 70px);
            box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 35px 0 rgb(34 33 81 / 15%), 64px 64px 35px -8px rgb(34 33 81 / 55%);
          }
        }
      `;
      shadowRoot.appendChild(style);
      console.log('[MockupMode] Injected animation styles into shadow DOM');
    }

    // Search for dialogs in the shadow DOM
    const commandDialog = shadowRoot.querySelector('[data-mockup-target="command-menu"]') as HTMLElement;
    const previewDialog = shadowRoot.querySelector('[data-mockup-target="preview-modal"]') as HTMLElement;
    const preferencesDialog = shadowRoot.querySelector('[data-mockup-target="preferences-modal"]') as HTMLElement;
    const shortcutsDialog = shadowRoot.querySelector('[data-mockup-target="shortcuts-modal"]') as HTMLElement;
    const aboutDialog = shadowRoot.querySelector('[data-mockup-target="about-modal"]') as HTMLElement;

    console.log('[MockupMode] Found dialogs:', {
      command: !!commandDialog,
      preview: !!previewDialog,
      preferences: !!preferencesDialog,
      shortcuts: !!shortcutsDialog,
      about: !!aboutDialog
    });

    let appliedCount = 0;

    if (commandDialog) {
      commandDialog.style.cssText = `
        z-index: 90000001;
        transform: rotateX(51deg) rotateZ(43deg) translate3d(-400px, -16px, 50px);
        transform-style: preserve-3d;
        transition: 0.4s ease-in-out transform, 0.4s ease-in-out box-shadow;
        box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 28px 0 rgb(34 33 81 / 10%), 54px 54px 28px -10px rgb(34 33 81 / 45%);
        animation: floatLoop 3s ease-in-out infinite;
      `;
      appliedCount++;
    }

    if (previewDialog) {
      previewDialog.style.cssText = `
        z-index: 90000000;
        transform: rotateX(51deg) rotateZ(43deg) translate3d(-900px, -400px, 0px) scale(0.65);
        transform-style: preserve-3d;
        box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 28px 0 rgba(34, 33, 81, 0.01), 28px 28px 28px 0 rgba(34, 33, 81, 0.25);
        opacity: 0.6;
      `;
      appliedCount++;
    }

    if (preferencesDialog) {
      preferencesDialog.style.cssText = `
        z-index: 90000000;
        transform: rotateX(51deg) rotateZ(43deg) translate3d(-450px, -700px, 0px) scale(0.65);
        transform-style: preserve-3d;
        box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 28px 0 rgba(34, 33, 81, 0.01), 28px 28px 28px 0 rgba(34, 33, 81, 0.25);
        opacity: 0.6;
      `;
      appliedCount++;
    }

    if (shortcutsDialog) {
      shortcutsDialog.style.cssText = `
        z-index: 90000000;
        transform: rotateX(51deg) rotateZ(43deg) translate3d(-1250px, 100px, 0px) scale(0.65);
        transform-style: preserve-3d;
        box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 28px 0 rgba(34, 33, 81, 0.01), 28px 28px 28px 0 rgba(34, 33, 81, 0.25);
        opacity: 0.6;
      `;
      appliedCount++;
    }

    if (aboutDialog) {
      aboutDialog.style.cssText = `
        z-index: 90000000;
        transform: rotateX(51deg) rotateZ(43deg) translate3d(-250px, 150px, 0px) scale(0.65);
        transform-style: preserve-3d;
        box-shadow: 1px 1px 0 1px #f9f9fb, -1px 0 28px 0 rgba(34, 33, 81, 0.01), 28px 28px 28px 0 rgba(34, 33, 81, 0.25);
        opacity: 0.6;
      `;
      appliedCount++;
    }

    console.log(`[MockupMode] Applied styles to ${appliedCount} dialogs`);
    setStylesApplied(appliedCount > 0);
  };

  // Try to apply styles on mount and provide manual button
  React.useEffect(() => {
    // Try after different delays to catch dialogs as they render
    const timers = [
      setTimeout(() => applyMockupStyles(), 100),
      setTimeout(() => applyMockupStyles(), 500),
      setTimeout(() => applyMockupStyles(), 1000),
    ];

    // Cleanup function
    return () => {
      timers.forEach(clearTimeout);
      
      // Find shadow root for cleanup
      const shadowHost = document.querySelector('snapcommand-ui');
      if (shadowHost && shadowHost.shadowRoot) {
        const style = shadowHost.shadowRoot.getElementById('mockup-float-animation');
        style?.remove();
        
        // Reset styles on all dialogs in shadow DOM
        const dialogs = shadowHost.shadowRoot.querySelectorAll('[data-mockup-target]') as NodeListOf<HTMLElement>;
        dialogs.forEach(dialog => {
          dialog.style.cssText = '';
        });
      }
    };
  }, []);

  return (
    <div className="mockup-mode-overlay">
      {/* Background overlay */}
      <div className="mockup-background" />
      
      {/* Control buttons */}
      <div className="mockup-controls">
        <button 
          className="mockup-apply-btn"
          onClick={applyMockupStyles}
          title="Apply 3D styles to modals"
        >
          {stylesApplied ? '✓ Styles Applied' : 'Apply Styles'}
        </button>
        <button 
          className="mockup-close-btn"
          onClick={onClose}
          title="Exit Mockup Mode (Press Escape)"
        >
          ✕
        </button>
      </div>
      
      {/* Floating modals container */}
      <div className="mockup-container">
        
        {/* Command Menu - Top Left */}
        <div className="mockup-item command-menu-mockup">
          <div className="mockup-frame">
            <CommandMenu {...mockHandlers} />
          </div>
        </div>

        {/* Preview Modal - Top Right */}
        <div className="mockup-item preview-mockup">
          <div className="mockup-frame">
            <CapturePreview 
              imageUrl={{imageUrl: mockImageUrl, format: 'png'}}
              onClose={mockHandlers.onClose}
            />
          </div>
        </div>

        {/* Preferences Modal - Bottom Left */}
        <div className="mockup-item preferences-mockup">
          <div className="mockup-frame">
            <PreferencesModal 
              open={true}
              onClose={mockHandlers.onClose}
              onBackToMenu={mockHandlers.onBackToMenu}
            />
          </div>
        </div>

        {/* Keyboard Shortcuts - Bottom Right */}
        <div className="mockup-item shortcuts-mockup">
          <div className="mockup-frame">
            <KeyboardShortcutsModal 
              open={true}
              onClose={mockHandlers.onClose}
              onBackToMenu={mockHandlers.onBackToMenu}
            />
          </div>
        </div>

        {/* About Modal - Center */}
        <div className="mockup-item about-mockup">
          <div className="mockup-frame">
            <AboutModal 
              open={true}
              onClose={mockHandlers.onClose}
              onBackToMenu={mockHandlers.onBackToMenu}
            />
          </div>
        </div>

      </div>

      <style jsx>{`
        .mockup-mode-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 999999;
          overflow: hidden;
        }

        .mockup-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%);
        }

        .mockup-controls {
          position: absolute;
          top: 20px;
          right: 20px;
          display: flex;
          gap: 10px;
          z-index: 1000;
        }

        .mockup-apply-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .mockup-apply-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .mockup-close-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          font-size: 18px;
          cursor: pointer;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .mockup-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .mockup-container {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 40px;
        }

        .mockup-item {
          position: absolute;
          transition: transform 0.3s ease;
        }

        .mockup-item:hover {
          transform: scale(1.02);
        }

        /* Positioning */
        .command-menu-mockup {
          top: 5%;
          left: 5%;
          animation: float1 6s ease-in-out infinite;
        }

        .preview-mockup {
          top: 10%;
          right: 5%;
          animation: float2 6s ease-in-out infinite;
        }

        .preferences-mockup {
          bottom: 15%;
          left: 5%;
          animation: float3 6s ease-in-out infinite;
        }

        .shortcuts-mockup {
          bottom: 5%;
          right: 25%;
          animation: float4 6s ease-in-out infinite;
        }

        .about-mockup {
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float5 6s ease-in-out infinite;
        }

        /* Simple frames */
        .mockup-frame {
          background: white;
          border-radius: 12px;
          box-shadow: 
            0 25px 50px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          overflow: hidden;
          transform: perspective(1000px) rotateX(2deg) rotateY(-2deg);
        }

        /* Floating Animations */
        @keyframes float1 {
          0%, 100% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-10px); }
        }

        @keyframes float2 {
          0%, 100% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-15px); }
        }

        @keyframes float3 {
          0%, 100% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-8px); }
        }

        @keyframes float4 {
          0%, 100% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(0px); }
          50% { transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-12px); }
        }

        @keyframes float5 {
          0%, 100% { transform: translate(-50%, -50%) perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(0px); }
          50% { transform: translate(-50%, -50%) perspective(1000px) rotateX(2deg) rotateY(-2deg) translateY(-10px); }
        }

        @media (max-width: 1400px) {
          .mockup-item {
            transform: scale(0.8);
          }
        }

        @media (max-width: 1200px) {
          .mockup-item {
            transform: scale(0.7);
          }
        }
      `}</style>
    </div>
  );
}