import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {
  console.log("Background script started");

  // Handle extension icon click
  browser.action.onClicked.addListener(async (tab) => {
    console.log("Extension icon clicked", tab);
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
      console.log("Cannot inject content script into restricted page:", tab.url);
      // Could optionally show a notification here
      return;
    }

    try {
      // First try to send a message to check if content script is loaded
      await browser.tabs.sendMessage(tab.id, { action: "toggle-command-menu" });
    } catch (err) {
      console.log("Content script not loaded, injecting it now");
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
    console.log("Command received:", command, tab);
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
      console.log("Cannot use extension on restricted page:", tab.url);
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
      console.log("Content script not loaded, injecting it now");
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
    console.log("Extension installed, creating context menus");

    browser.contextMenus.create({
      id: "snapcommand-capture",
      title: "Capture with SnapCommand",
      contexts: ["page", "image", "link"],
    });

    browser.contextMenus.create({
      id: "snapcommand-element",
      parentId: "snapcommand-capture",
      title: "Capture this element",
      contexts: ["page", "image", "link"],
    });

    browser.contextMenus.create({
      id: "snapcommand-visible",
      parentId: "snapcommand-capture",
      title: "Capture visible area",
      contexts: ["page"],
    });

    browser.contextMenus.create({
      id: "snapcommand-full",
      parentId: "snapcommand-capture",
      title: "Capture full page",
      contexts: ["page"],
    });
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    console.log("Context menu clicked:", info.menuItemId);
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
      console.log("Cannot use extension on restricted page:", tab.url);
      return;
    }

    const actionMap: Record<string, string> = {
      "snapcommand-element": "capture-element",
      "snapcommand-visible": "capture-visible",
      "snapcommand-full": "capture-fullpage"
    };

    const action = actionMap[info.menuItemId as string];
    if (action) {
      try {
        await browser.tabs.sendMessage(tab.id, { 
          action, 
          targetElement: info.menuItemId === "snapcommand-element" 
        });
      } catch (err) {
        console.log("Content script not loaded, injecting it now");
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
    console.log("Message received in background:", message);

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

  console.log("Background script setup complete");
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

