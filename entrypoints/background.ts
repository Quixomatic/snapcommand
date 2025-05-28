import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

export default defineBackground(() => {
  console.log("Background script started");

  // Handle extension icon click - check if action API is available
  if (browser.action && browser.action.onClicked) {
    browser.action.onClicked.addListener((tab) => {
      console.log("Extension icon clicked", tab);
      if (tab.id) {
        browser.tabs
          .sendMessage(tab.id, { action: "toggle-command-menu" })
          .catch((err) => {
            console.error("Failed to send message to tab:", err);
          });
      }
    });
  } else if (browser.browserAction && browser.browserAction.onClicked) {
    // Fallback for older API
    browser.browserAction.onClicked.addListener((tab) => {
      console.log("Extension icon clicked (browserAction)", tab);
      if (tab.id) {
        browser.tabs
          .sendMessage(tab.id, { action: "toggle-command-menu" })
          .catch((err) => {
            console.error("Failed to send message to tab:", err);
          });
      }
    });
  } else {
    console.warn("No action API available");
  }

  // Handle keyboard commands
  if (browser.commands && browser.commands.onCommand) {
    browser.commands.onCommand.addListener(async (command, tab) => {
      console.log("Command received:", command, tab);
      if (!tab?.id) return;

      switch (command) {
        case "open-command-menu":
          browser.tabs
            .sendMessage(tab.id, { action: "toggle-command-menu" })
            .catch((err) => {
              console.error("Failed to send command message:", err);
            });
          break;
        case "capture-visible":
          browser.tabs
            .sendMessage(tab.id, { action: "capture-visible" })
            .catch((err) => {
              console.error("Failed to send capture-visible message:", err);
            });
          break;
        case "capture-fullpage":
          browser.tabs
            .sendMessage(tab.id, { action: "capture-fullpage" })
            .catch((err) => {
              console.error("Failed to send capture-fullpage message:", err);
            });
          break;
        case "capture-element":
          browser.tabs
            .sendMessage(tab.id, { action: "capture-element" })
            .catch((err) => {
              console.error("Failed to send capture-element message:", err);
            });
          break;
      }
    });
  }

  // Handle context menu
  if (browser.contextMenus) {
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

    browser.contextMenus.onClicked.addListener((info, tab) => {
      console.log("Context menu clicked:", info.menuItemId);
      if (!tab?.id) return;

      switch (info.menuItemId) {
        case "snapcommand-element":
          browser.tabs
            .sendMessage(tab.id, {
              action: "capture-element",
              targetElement: true,
            })
            .catch((err) => {
              console.error("Failed to send context menu message:", err);
            });
          break;
        case "snapcommand-visible":
          browser.tabs
            .sendMessage(tab.id, { action: "capture-visible" })
            .catch((err) => {
              console.error("Failed to send context menu message:", err);
            });
          break;
        case "snapcommand-full":
          browser.tabs
            .sendMessage(tab.id, { action: "capture-fullpage" })
            .catch((err) => {
              console.error("Failed to send context menu message:", err);
            });
          break;
      }
    });
  }

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
    // Call without parameters to capture the current window
    const dataUrl = await browser.tabs.captureVisibleTab({
      format: "png",
    });
    return dataUrl;
  } catch (error) {
    console.error("Failed to capture visible tab:", error);
    throw error;
  }
}
