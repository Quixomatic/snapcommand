import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {

  // Handle extension icon click
  browser.action.onClicked.addListener(async (tab) => {
    if (!tab.id || !tab.url) return;

    // Check if we can inject into this page
    const url = new URL(tab.url);
    const isRestrictedPage = url.protocol === 'chrome:' || 
                            url.protocol === 'chrome-extension:' || 
                            url.protocol === 'edge:' || 
                            url.protocol === 'about:' ||
                            url.protocol === 'data:' ||
                            url.protocol === 'blob:' ||
                            url.protocol === 'file:' ||
                            url.hostname === 'chromewebstore.google.com';

    if (isRestrictedPage) {
      // Could optionally show a notification here
      return;
    }

    try {
      // First try to send a message to check if content script is loaded
      await browser.tabs.sendMessage(tab.id, { action: "toggle-command-menu" });
    } catch (err) {
      // If content script is not loaded, inject it first
      try {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['/content-scripts/content.js']
        });
        // Now try again
        await browser.tabs.sendMessage(tab.id, { action: "toggle-command-menu" });
      } catch (injectErr) {
        console.error("Failed to inject content script:", injectErr);
      }
    }
  });

  // Handle keyboard commands
  browser.commands.onCommand.addListener(async (command, tab) => {
    if (!tab?.id || !tab?.url) return;

    // Check if we can inject into this page
    const url = new URL(tab.url);
    const isRestrictedPage = url.protocol === 'chrome:' || 
                            url.protocol === 'chrome-extension:' || 
                            url.protocol === 'edge:' || 
                            url.protocol === 'about:' ||
                            url.protocol === 'data:' ||
                            url.protocol === 'blob:' ||
                            url.protocol === 'file:' ||
                            url.hostname === 'chromewebstore.google.com';

    if (isRestrictedPage) {
      return;
    }

    try {
      switch (command) {
        case "open-command-menu":
          await browser.tabs.sendMessage(tab.id, { action: "toggle-command-menu" });
          break;
        case "capture-visible":
          await browser.tabs.sendMessage(tab.id, { action: "capture-visible" });
          break;
        case "capture-fullpage":
          await browser.tabs.sendMessage(tab.id, { action: "capture-fullpage" });
          break;
        case "capture-element":
          await browser.tabs.sendMessage(tab.id, { action: "capture-element" });
          break;
      }
    } catch (err) {
      // If content script is not loaded, inject it first
      try {
        await browser.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content-scripts/content.js']
        });
        // Now try the command again
        await browser.tabs.sendMessage(tab.id, { action: command === "open-command-menu" ? "toggle-command-menu" : command });
      } catch (injectErr) {
        console.error("Failed to inject content script:", injectErr);
      }
    }
  });

  // Handle context menu
  browser.runtime.onInstalled.addListener(() => {

    browser.contextMenus.create({
      id: "snapcommand-capture",
      title: "Capture with SnapCommand",
      contexts: ["page", "image", "link"],
    });

    // Command Menu option
    browser.contextMenus.create({
      id: "snapcommand-menu",
      parentId: "snapcommand-capture",
      title: "Open Command Menu",
      contexts: ["page", "image", "link"],
    });

    browser.contextMenus.create({
      id: "snapcommand-separator1",
      parentId: "snapcommand-capture",
      type: "separator",
      contexts: ["page", "image", "link"],
    });

    // Capture modes
    browser.contextMenus.create({
      id: "snapcommand-visible",
      parentId: "snapcommand-capture",
      title: "Capture Visible Area",
      contexts: ["page"],
    });

    browser.contextMenus.create({
      id: "snapcommand-full",
      parentId: "snapcommand-capture",
      title: "Capture Full Page",
      contexts: ["page"],
    });

    browser.contextMenus.create({
      id: "snapcommand-element",
      parentId: "snapcommand-capture",
      title: "Select Element",
      contexts: ["page", "image", "link"],
    });

    browser.contextMenus.create({
      id: "snapcommand-selection",
      parentId: "snapcommand-capture",
      title: "Draw Selection",
      contexts: ["page"],
    });

    browser.contextMenus.create({
      id: "snapcommand-css",
      parentId: "snapcommand-capture",
      title: "CSS Selector",
      contexts: ["page"],
    });
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id || !tab?.url) return;

    // Check if we can inject into this page
    const url = new URL(tab.url);
    const isRestrictedPage = url.protocol === 'chrome:' || 
                            url.protocol === 'chrome-extension:' || 
                            url.protocol === 'edge:' || 
                            url.protocol === 'about:' ||
                            url.protocol === 'data:' ||
                            url.protocol === 'blob:' ||
                            url.protocol === 'file:' ||
                            url.hostname === 'chromewebstore.google.com';

    if (isRestrictedPage) {
      return;
    }

    const actionMap: Record<string, string> = {
      "snapcommand-menu": "toggle-command-menu",
      "snapcommand-visible": "capture-visible",
      "snapcommand-full": "capture-fullpage",
      "snapcommand-element": "capture-element",
      "snapcommand-selection": "capture-selection",
      "snapcommand-css": "capture-css"
    };

    const action = actionMap[info.menuItemId as string];
    if (action) {
      try {
        await browser.tabs.sendMessage(tab.id, { 
          action, 
          targetElement: info.menuItemId === "snapcommand-element" 
        });
      } catch (err) {
          try {
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['/content-scripts/content.js']
          });
          await browser.tabs.sendMessage(tab.id, { 
            action, 
            targetElement: info.menuItemId === "snapcommand-element" 
          });
        } catch (injectErr) {
          console.error("Failed to inject content script:", injectErr);
        }
      }
    }
  });

  // Handle messages from content script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {

    if (message.action === "capture-visible-area") {
      captureVisibleTab()
        .then((dataUrl) => {
          sendResponse(dataUrl);
        })
        .catch((error) => {
          console.error("Capture failed:", error);
          sendResponse({ error: error.message });
        });
      return true; // Will respond asynchronously
    }


    if (message.action === "download") {
      browser.downloads
        .download({
          url: message.url,
          filename: message.filename,
          saveAs: message.saveAs ?? false,
        })
        .catch((err) => {
          console.error("Download failed:", err);
        });
    }

    return false;
  });

});

async function captureVisibleTab(): Promise<string> {
  try {
    // Get current active tab
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab.windowId) throw new Error("No window ID");
    
    // Capture the visible area
    const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, {
      format: "png",
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to capture visible tab:", error);
    throw error;
  }
}

