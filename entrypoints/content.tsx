import React from "react";
import ReactDOM from "react-dom/client";
import { browser } from "wxt/browser";
import { defineContentScript } from "wxt/utils/define-content-script";
import { createShadowRootUi } from "wxt/utils/content-script-ui/shadow-root";
import CommandMenu from "@/components/command-menu/CommandMenu";
import ElementSelector from "@/components/capture/ElementSelector";
import DrawSelection from "@/components/capture/DrawSelection";
import CapturePreview from "@/components/capture/CapturePreview";
import CssSelectorInput from "@/components/capture/CssSelectorInput";
import PreferencesModal from "@/components/preferences/PreferencesModal";
import KeyboardShortcutsModal from "@/components/shortcuts/KeyboardShortcutsModal";
import CaptureHistoryModal from "@/components/history/CaptureHistoryModal";
import HelpTipsModal from "@/components/help/HelpTipsModal";
import AboutModal from "@/components/about/AboutModal";
// Only import MockupMode in development
const MockupMode = import.meta.env.DEV 
  ? React.lazy(() => import("@/components/mockup/MockupMode"))
  : null;
import { CaptureProvider } from "@/lib/capture/capture-context";
import { PortalProvider } from "@/lib/utils/portal-provider";
import { Toaster } from "@/components/ui/toaster";
import { usePreferences } from "@/lib/storage/preferences";
import { addCaptureToHistory } from "@/lib/storage/capture-history";
import { keybindingManager } from "@/lib/utils/keybinding-manager";
import { incrementScreenshotCount } from "@/lib/storage/usage-stats";
import "@/styles/globals.css";

// Filter out Radix UI DialogTitle errors since we have proper accessibility
const originalError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  if (message.includes('DialogContent') && message.includes('DialogTitle')) {
    return; // Suppress this specific error
  }
  originalError.apply(console, args);
};

export default defineContentScript({
  matches: ["<all_urls>"],
  cssInjectionMode: "ui",
  runAt: "document_idle",

  async main(ctx) {

    // Store UI instance and root globally to ensure React stays in shadow DOM
    let uiRoot: ReactDOM.Root | null = null;
    
    // Create UI container
    const ui = await createShadowRootUi(ctx, {
      name: "snapcommand-ui",
      position: "overlay",
      anchor: "body",
      append: "last",
      onMount: (container, shadow) => {
        
        // Ensure the shadow root handles events properly
        if (shadow) {
          // Allow wheel events to work properly in shadow DOM
          shadow.addEventListener('wheel', (e) => {
            // Don't prevent wheel events within our UI
            e.stopPropagation();
          }, { passive: true });
        }
        
        // The container IS the shadow DOM root's container
        // React needs to render directly into this
        const root = document.createElement("div");
        root.id = "snapcommand-root";
        container.appendChild(root);

        // Force React to use this specific root element in the shadow DOM
        uiRoot = ReactDOM.createRoot(root);
        uiRoot.render(
          <React.StrictMode>
            <PortalProvider container={root}>
              <CaptureProvider>
                <App />
              </CaptureProvider>
            </PortalProvider>
          </React.StrictMode>
        );
      },
      onRemove: () => {
        // Clean up React when UI is removed
        if (uiRoot) {
          uiRoot.unmount();
          uiRoot = null;
        }
      }
    });

    // Mount UI
    ui.mount();
  },
});

function App() {
  const [showCommandMenu, setShowCommandMenu] = React.useState(false);
  const [captureMode, setCaptureMode] = React.useState<string | null>(null);
  const [captureResult, setCaptureResult] = React.useState<{ imageUrl: string; format: string } | null>(null);
  const [showPreferences, setShowPreferences] = React.useState(false);
  const [showShortcuts, setShowShortcuts] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [showHelp, setShowHelp] = React.useState(false);
  const [showAbout, setShowAbout] = React.useState(false);
  const [showMockup, setShowMockup] = React.useState(false);
  const { preferences, updatePreferences } = usePreferences();

  // Create a global modal manager that can be used anywhere
  const modalManager = React.useMemo(() => ({
    closeAll: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
    },
    openCommandMenu: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
      setShowCommandMenu(true);
    },
    openPreferences: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
      setShowPreferences(true);
    },
    openShortcuts: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
      setShowShortcuts(true);
    },
    openHistory: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
      setShowHistory(true);
    },
    openHelp: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
      setShowHelp(true);
    },
    openAbout: () => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(null);
      setShowAbout(true);
    },
    startCapture: (mode: string) => {
      setShowCommandMenu(false);
      setShowPreferences(false);
      setShowShortcuts(false);
      setShowHistory(false);
      setShowHelp(false);
      setShowAbout(false);
      setShowMockup(false);
      setCaptureResult(null);
      setCaptureMode(mode);
    },
    closeCaptureMode: () => {
      setCaptureMode(null);
    }
  }), []);

  // Store modalManager globally so keybindings can access it
  React.useEffect(() => {
    (window as any).__snapcommandModalManager = modalManager;
  }, [modalManager]);

  React.useEffect(() => {
    // Register keybinding commands using global modal manager
    keybindingManager.registerCommand({
      id: 'toggle-menu',
      label: 'Toggle Command Menu',
      description: 'Open/close the main command menu',
      category: 'main',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.openCommandMenu();
      }
    });
    
    keybindingManager.registerCommand({
      id: 'capture-visible',
      label: 'Capture Visible Area',
      description: 'Capture what you see in the viewport',
      category: 'main',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.closeAll();
        
        // Get fresh preferences from storage just like format keybindings do
        import('@/lib/storage/preferences').then(({ loadPreferences }) => {
          loadPreferences().then(currentPrefs => {
            // Call the capture handler with fresh preferences
            setTimeout(async () => {
              const response = await browser.runtime.sendMessage({
                action: "capture-visible-area",
              });
              
              // Use fresh preferences for processing
              const dataUrl = response;
              let processedDataUrl = dataUrl;
              if (currentPrefs.format !== 'png') {
                processedDataUrl = await convertImageFormat(dataUrl, currentPrefs.format, currentPrefs.quality);
              }
              
              await addCaptureToHistory('visible', currentPrefs.format, processedDataUrl);
              await incrementScreenshotCount();
              
              if (currentPrefs.copyToClipboard) {
                await copyToClipboard(processedDataUrl);
              }
              
              if (currentPrefs.autoDownload) {
                await downloadImage(processedDataUrl);
              }
              
              if (currentPrefs.showPreview) {
                setCaptureResult({ imageUrl: processedDataUrl, format: currentPrefs.format });
              }
            }, 100);
          });
        });
      }
    });
    
    keybindingManager.registerCommand({
      id: 'capture-fullpage',
      label: 'Capture Full Page',
      description: 'Capture the entire scrollable page',
      category: 'main',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.closeAll();
        
        // Get fresh preferences from storage just like format keybindings do
        import('@/lib/storage/preferences').then(({ loadPreferences }) => {
          loadPreferences().then(currentPrefs => {
            // Call the capture handler with fresh preferences
            setTimeout(async () => {
              const snapdom = (await import("@zumer/snapdom")).snapdom;
              const result = await snapdom(document.documentElement, 
                getSnapdomOptions(currentPrefs.scale, currentPrefs.corsProxy)
              );
              const dataUrl = await result.toPng();
              
              // Use fresh preferences for processing
              let processedDataUrl = dataUrl.src;
              if (currentPrefs.format !== 'png') {
                processedDataUrl = await convertImageFormat(dataUrl.src, currentPrefs.format, currentPrefs.quality);
              }
              
              await addCaptureToHistory('fullpage', currentPrefs.format, processedDataUrl);
              await incrementScreenshotCount();
              
              if (currentPrefs.copyToClipboard) {
                await copyToClipboard(processedDataUrl);
              }
              
              if (currentPrefs.autoDownload) {
                await downloadImage(processedDataUrl);
              }
              
              if (currentPrefs.showPreview) {
                setCaptureResult({ imageUrl: processedDataUrl, format: currentPrefs.format });
              }
            }, 100);
          });
        });
      }
    });
    
    keybindingManager.registerCommand({
      id: 'capture-element',
      label: 'Select Element',
      description: 'Click to select any element',
      category: 'main',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.startCapture('element');
      }
    });
    
    keybindingManager.registerCommand({
      id: 'capture-selection',
      label: 'Draw Selection',
      description: 'Click and drag to capture any area',
      category: 'main',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.startCapture('draw');
      }
    });
    
    keybindingManager.registerCommand({
      id: 'capture-css',
      label: 'CSS Selector',
      description: 'Target elements by CSS selector',
      category: 'main',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.startCapture('css');
      }
    });
    
    keybindingManager.registerCommand({
      id: 'format-png',
      label: 'PNG Format',
      description: 'Switch to PNG format',
      category: 'format',
      handler: () => {
        // Get fresh preferences from storage instead of using stale closure
        import('@/lib/storage/preferences').then(({ loadPreferences, savePreferences }) => {
          loadPreferences().then(currentPrefs => {
            const newPrefs = { ...currentPrefs, format: 'png' as const };
            savePreferences(newPrefs);
          });
        });
      }
    });
    
    keybindingManager.registerCommand({
      id: 'format-jpg',
      label: 'JPG Format',
      description: 'Switch to JPG format',
      category: 'format',
      handler: () => {
        // Get fresh preferences from storage instead of using stale closure
        import('@/lib/storage/preferences').then(({ loadPreferences, savePreferences }) => {
          loadPreferences().then(currentPrefs => {
            const newPrefs = { ...currentPrefs, format: 'jpg' as const };
            savePreferences(newPrefs);
          });
        });
      }
    });
    
    keybindingManager.registerCommand({
      id: 'format-webp',
      label: 'WebP Format',
      description: 'Switch to WebP format',
      category: 'format',
      handler: () => {
        // Get fresh preferences from storage instead of using stale closure
        import('@/lib/storage/preferences').then(({ loadPreferences, savePreferences }) => {
          loadPreferences().then(currentPrefs => {
            const newPrefs = { ...currentPrefs, format: 'webp' as const };
            savePreferences(newPrefs);
          });
        });
      }
    });
    
    keybindingManager.registerCommand({
      id: 'preferences',
      label: 'Open Preferences',
      description: 'Open the preferences modal',
      category: 'other',
      handler: () => {
        const manager = (window as any).__snapcommandModalManager;
        if (manager) manager.openPreferences();
      }
    });
    
    const handleMessage = (message: any) => {
      switch (message.action) {
        case 'toggle-command-menu':
          const manager = (window as any).__snapcommandModalManager;
          if (manager) {
            if (showCommandMenu) {
              manager.closeAll();
            } else {
              manager.openCommandMenu();
            }
          }
          break;
        case 'capture-visible':
          const manager1 = (window as any).__snapcommandModalManager;
          if (manager1) manager1.closeAll();
          
          // Get fresh preferences from storage just like format keybindings do
          import('@/lib/storage/preferences').then(({ loadPreferences }) => {
            loadPreferences().then(currentPrefs => {
              setTimeout(async () => {
                const response = await browser.runtime.sendMessage({
                  action: "capture-visible-area",
                });
                
                // Use fresh preferences for processing
                const dataUrl = response;
                let processedDataUrl = dataUrl;
                if (currentPrefs.format !== 'png') {
                  processedDataUrl = await convertImageFormat(dataUrl, currentPrefs.format, currentPrefs.quality);
                }
                
                await addCaptureToHistory('visible', currentPrefs.format, processedDataUrl);
                await incrementScreenshotCount();
                
                if (currentPrefs.copyToClipboard) {
                  await copyToClipboard(processedDataUrl);
                }
                
                if (currentPrefs.autoDownload) {
                  await downloadImage(processedDataUrl);
                }
                
                if (currentPrefs.showPreview) {
                  setCaptureResult({ imageUrl: processedDataUrl, format: currentPrefs.format });
                }
              }, 100);
            });
          });
          break;
        case 'capture-fullpage':
          const manager2 = (window as any).__snapcommandModalManager;
          if (manager2) manager2.closeAll();
          
          // Get fresh preferences from storage just like format keybindings do
          import('@/lib/storage/preferences').then(({ loadPreferences }) => {
            loadPreferences().then(currentPrefs => {
              setTimeout(async () => {
                const snapdom = (await import("@zumer/snapdom")).snapdom;
                const result = await snapdom(document.documentElement, 
                  getSnapdomOptions(currentPrefs.scale, currentPrefs.corsProxy)
                );
                const dataUrl = await result.toPng();
                
                // Use fresh preferences for processing
                let processedDataUrl = dataUrl.src;
                if (currentPrefs.format !== 'png') {
                  processedDataUrl = await convertImageFormat(dataUrl.src, currentPrefs.format, currentPrefs.quality);
                }
                
                await addCaptureToHistory('fullpage', currentPrefs.format, processedDataUrl);
                await incrementScreenshotCount();
                
                if (currentPrefs.copyToClipboard) {
                  await copyToClipboard(processedDataUrl);
                }
                
                if (currentPrefs.autoDownload) {
                  await downloadImage(processedDataUrl);
                }
                
                if (currentPrefs.showPreview) {
                  setCaptureResult({ imageUrl: processedDataUrl, format: currentPrefs.format });
                }
              }, 100);
            });
          });
          break;
        case 'capture-element':
          const manager3 = (window as any).__snapcommandModalManager;
          if (manager3) manager3.startCapture('element');
          break;
        case 'capture-selection':
          const manager4 = (window as any).__snapcommandModalManager;
          if (manager4) manager4.startCapture('draw');
          break;
        case 'capture-css':
          const manager5 = (window as any).__snapcommandModalManager;
          if (manager5) manager5.startCapture('css');
          break;
      }
    };

    browser.runtime.onMessage.addListener(handleMessage);
    return () => {
      browser.runtime.onMessage.removeListener(handleMessage);
      keybindingManager.destroy();
    };
  }, []);

  // Update keybindings when preferences change
  React.useEffect(() => {
    keybindingManager.updateKeybindings(preferences);
  }, [preferences]);

  // Secret mockup mode activation (Ctrl+Shift+K) - Development only
  React.useEffect(() => {
    if (!import.meta.env.DEV) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+K to toggle mockup mode
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowMockup(!showMockup);
      }

      // ESC to close mockup mode
      if (e.key === 'Escape' && showMockup) {
        setShowMockup(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showMockup]);




  const handleCaptureVisible = async () => {
    try {
      // Wait a brief moment for modals to be removed from DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await browser.runtime.sendMessage({
        action: "capture-visible-area",
      });
      
      await processCapturedImage(response, 'visible');
    } catch (error) {
      console.error("Failed to capture visible area:", error);
    }
  };

  const handleCaptureFullPage = async () => {
    try {
      // Wait a brief moment for modals to be removed from DOM
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const snapdom = (await import("@zumer/snapdom")).snapdom;
      const result = await snapdom(document.documentElement, 
        getSnapdomOptions(preferences.scale, preferences.corsProxy)
      );
      const dataUrl = await result.toPng();
      
      await processCapturedImage(dataUrl.src, 'fullpage');
    } catch (error) {
      console.error("Failed to capture full page:", error);
      
      // Show error toast for encoding failures
      if (error.name === 'EncodingError' || error.message?.includes('cannot be decoded')) {
        // Import toast dynamically to avoid circular dependencies
        const { toast } = await import('@/components/ui/use-toast');
        toast({
          title: "Capture failed",
          description: "Image too large to encode. Try reducing the scale in preferences.",
          variant: "destructive"
        });
      }
    }
  };

  const handleElementCapture = async (element: HTMLElement) => {
    try {
      const snapdom = (await import("@zumer/snapdom")).snapdom;
      const result = await snapdom(element, 
        getSnapdomOptions(preferences.scale, preferences.corsProxy)
      );
      const dataUrl = await result.toPng();
      
      await processCapturedImage(dataUrl.src, 'element');
      modalManager.closeCaptureMode();
    } catch (error) {
      console.error("Failed to capture element:", error);
    }
  };

  const handleCSSCapture = async (element: HTMLElement) => {
    try {
      const snapdom = (await import("@zumer/snapdom")).snapdom;
      const result = await snapdom(element, 
        getSnapdomOptions(preferences.scale, preferences.corsProxy)
      );
      const dataUrl = await result.toPng();
      
      await processCapturedImage(dataUrl.src, 'css');
      modalManager.closeCaptureMode();
    } catch (error) {
      console.error("Failed to capture CSS element:", error);
    }
  };

  const handleDrawCapture = async (selection: any) => {
    try {
      // Hide the draw selection overlay first
      modalManager.closeCaptureMode();
      
      // Wait a brief moment for the overlay to be removed from DOM
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Now capture visible area
      const response = await browser.runtime.sendMessage({
        action: "capture-visible-area",
      });

      // Crop to selection
      const croppedImage = await cropImage(response, selection);
      
      await processCapturedImage(croppedImage, 'selection');
    } catch (error) {
      console.error("Failed to capture selection:", error);
      // Restore capture mode if something went wrong
      modalManager.startCapture('draw');
    }
  };


  const processCapturedImage = async (dataUrl: string, captureType: 'visible' | 'fullpage' | 'element' | 'selection' | 'css' = 'visible') => {
    try {
      // Convert format if needed
      let processedDataUrl = dataUrl;
      if (preferences.format !== 'png') {
        processedDataUrl = await convertImageFormat(dataUrl, preferences.format, preferences.quality);
      }
      
      // Add to capture history
      await addCaptureToHistory(captureType, preferences.format, processedDataUrl);
      
      // Increment screenshot count for tip tracking
      await incrementScreenshotCount();
      
      // Handle copy to clipboard
      if (preferences.copyToClipboard) {
        await copyToClipboard(processedDataUrl);
      }
      
      // Handle auto download
      if (preferences.autoDownload) {
        await downloadImage(processedDataUrl);
      }
      
      // Show preview if enabled
      if (preferences.showPreview) {
        setCaptureResult({ imageUrl: processedDataUrl, format: preferences.format });
      }
      
    } catch (error) {
      console.error('Failed to process captured image:', error);
      // Still show the result even if processing failed
      setCaptureResult({ imageUrl: dataUrl, format: 'png' });
    }
  };

  const getSnapdomOptions = (scale: number, corsProxy?: string) => {
    const options: any = { scale };
    if (corsProxy && corsProxy.trim()) {
      options.useProxy = corsProxy;
    }
    return options;
  };

  const convertImageFormat = async (dataUrl: string, format: string, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // White background for JPG/WebP
        if (format === 'jpg' || format === 'webp') {
          ctx.fillStyle = preferences.backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(img, 0, 0);
        
        const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
        resolve(canvas.toDataURL(mimeType, quality / 100));
      };
      img.src = dataUrl;
    });
  };

  const copyToClipboard = async (dataUrl: string) => {
    try {
      const blob = await fetch(dataUrl).then(r => r.blob());
      
      if ('ClipboardItem' in window) {
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
      } else {
        await navigator.clipboard.writeText(dataUrl);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const downloadImage = async (dataUrl: string) => {
    try {
      const date = new Date();
      const timestamp = date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const domain = window.location.hostname.replace(/\./g, '-');
      const filename = `snapcommand-${domain}-${timestamp}.${preferences.format}`;
      
      await browser.runtime.sendMessage({
        action: 'download',
        url: dataUrl,
        filename: filename,
        saveAs: false
      });
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  };

  return (
    <>
      {showCommandMenu && (
        <CommandMenu
          onClose={() => modalManager.closeAll()}
          onCaptureVisible={() => {
            modalManager.closeAll();
            setTimeout(() => handleCaptureVisible(), 100);
          }}
          onCaptureFullPage={() => {
            modalManager.closeAll();
            setTimeout(() => handleCaptureFullPage(), 100);
          }}
          onCaptureElement={() => modalManager.startCapture('element')}
          onCaptureSelection={() => modalManager.startCapture('draw')}
          onCaptureCSS={() => modalManager.startCapture('css')}
          onOpenPreferences={() => modalManager.openPreferences()}
          onOpenShortcuts={() => modalManager.openShortcuts()}
          onOpenHistory={() => modalManager.openHistory()}
          onOpenHelp={() => modalManager.openHelp()}
          onOpenAbout={() => modalManager.openAbout()}
        />
      )}

      {captureMode === "element" && (
        <ElementSelector
          onSelect={handleElementCapture}
          onCancel={() => modalManager.closeAll()}
        />
      )}

      {captureMode === "draw" && (
        <DrawSelection
          onSelect={handleDrawCapture}
          onCancel={() => modalManager.closeAll()}
        />
      )}

      {captureMode === "css" && (
        <CssSelectorInput
          onSelect={handleCSSCapture}
          onCancel={() => modalManager.closeAll()}
        />
      )}

      {captureResult && (
        <CapturePreview
          imageUrl={captureResult}
          onClose={() => modalManager.closeAll()}
        />
      )}

      <PreferencesModal
        open={showPreferences}
        onClose={() => modalManager.closeAll()}
        onBackToMenu={() => modalManager.openCommandMenu()}
      />

      <KeyboardShortcutsModal
        open={showShortcuts}
        onClose={() => modalManager.closeAll()}
        onBackToMenu={() => modalManager.openCommandMenu()}
      />

      <CaptureHistoryModal
        open={showHistory}
        onClose={() => modalManager.closeAll()}
        onBackToMenu={() => modalManager.openCommandMenu()}
      />

      <HelpTipsModal
        open={showHelp}
        onClose={() => modalManager.closeAll()}
        onBackToMenu={() => modalManager.openCommandMenu()}
      />

      <AboutModal
        open={showAbout}
        onClose={() => modalManager.closeAll()}
        onBackToMenu={() => modalManager.openCommandMenu()}
      />
      
      <Toaster />

      {/* Secret Mockup Mode - Development Only */}
      {showMockup && MockupMode && (
        <React.Suspense fallback={null}>
          <MockupMode onClose={() => setShowMockup(false)} />
        </React.Suspense>
      )}
    </>
  );
}

async function cropImage(dataUrl: string, selection: any): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

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

      resolve(canvas.toDataURL("image/png"));
    };
    img.src = dataUrl;
  });
}
