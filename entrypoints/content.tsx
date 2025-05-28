import React from 'react';
import ReactDOM from 'react-dom/client';
import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import CommandMenu from '@/components/command-menu/CommandMenu';
import ElementSelector from '@/components/capture/ElementSelector';
import DrawSelection from '@/components/capture/DrawSelection';
import CapturePreview from '@/components/capture/CapturePreview';
import { CaptureProvider } from '@/lib/capture/capture-context';
import '@/styles/globals.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  cssInjectionMode: 'ui',
  
  async main(ctx: any) {
    // Create UI container
    const ui = await createShadowRootUi(ctx, {
      name: 'snapcommand-ui',
      position: 'overlay',
      onMount: (container: HTMLElement) => {
        // Create a root element inside the container
        const root = document.createElement('div');
        root.id = 'snapcommand-root';
        container.appendChild(root);
        
        const reactRoot = ReactDOM.createRoot(root);
        reactRoot.render(
          <CaptureProvider>
            <App />
          </CaptureProvider>
        );
      },
    });

    // Mount UI
    ui.mount();
  }
});

function App() {
  const [showCommandMenu, setShowCommandMenu] = React.useState(false);
  const [captureMode, setCaptureMode] = React.useState<string | null>(null);
  const [captureResult, setCaptureResult] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleMessage = (message: any) => {
      switch (message.action) {
        case 'toggle-command-menu':
          setShowCommandMenu(prev => !prev);
          break;
        case 'capture-visible':
          handleCaptureVisible();
          break;
        case 'capture-fullpage':
          handleCaptureFullPage();
          break;
        case 'capture-element':
          setCaptureMode('element');
          setShowCommandMenu(false);
          break;
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCaptureVisible = async () => {
    try {
      const response = await browser.runtime.sendMessage({
        action: 'capture-visible-area'
      });
      setCaptureResult(response);
      setShowCommandMenu(false);
    } catch (error) {
      console.error('Failed to capture visible area:', error);
    }
  };

  const handleCaptureFullPage = async () => {
    try {
      const { snapdom } = await import('@zumer/snapdom');
      const result = await snapdom(document.documentElement);
      const dataUrl = await result.toPng();
      setCaptureResult(dataUrl.src);
      setShowCommandMenu(false);
    } catch (error) {
      console.error('Failed to capture full page:', error);
    }
  };

  const handleElementCapture = async (element: HTMLElement) => {
    try {
      const { snapdom } = await import('@zumer/snapdom');
      const result = await snapdom(element);
      const dataUrl = await result.toPng();
      setCaptureResult(dataUrl.src);
      setCaptureMode(null);
    } catch (error) {
      console.error('Failed to capture element:', error);
    }
  };

  const handleDrawCapture = async (selection: any) => {
    try {
      // Capture visible area first
      const response = await browser.runtime.sendMessage({
        action: 'capture-visible-area'
      });
      
      // Crop to selection
      const croppedImage = await cropImage(response, selection);
      setCaptureResult(croppedImage);
      setCaptureMode(null);
    } catch (error) {
      console.error('Failed to capture selection:', error);
    }
  };

  return (
    <>
      {showCommandMenu && (
        <CommandMenu
          onClose={() => setShowCommandMenu(false)}
          onCaptureVisible={handleCaptureVisible}
          onCaptureFullPage={handleCaptureFullPage}
          onCaptureElement={() => {
            setCaptureMode('element');
            setShowCommandMenu(false);
          }}
          onCaptureSelection={() => {
            setCaptureMode('draw');
            setShowCommandMenu(false);
          }}
        />
      )}

      {captureMode === 'element' && (
        <ElementSelector
          onSelect={handleElementCapture}
          onCancel={() => setCaptureMode(null)}
        />
      )}

      {captureMode === 'draw' && (
        <DrawSelection
          onSelect={handleDrawCapture}
          onCancel={() => setCaptureMode(null)}
        />
      )}

      {captureResult && (
        <CapturePreview
          imageUrl={captureResult}
          onClose={() => setCaptureResult(null)}
        />
      )}
    </>
  );
}

async function cropImage(dataUrl: string, selection: any): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = selection.width;
      canvas.height = selection.height;
      
      ctx.drawImage(
        img,
        selection.x * dpr,
        selection.y * dpr,
        selection.width * dpr,
        selection.height * dpr,
        0,
        0,
        selection.width,
        selection.height
      );
      
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = dataUrl;
  });
}