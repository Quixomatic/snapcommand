import { browser } from 'wxt/browser';
import { defineBackground } from 'wxt/utils/define-background';

export default defineBackground(() => {
  // Handle extension icon click
  browser.action.onClicked.addListener((tab) => {
    if (tab.id) {
      browser.tabs.sendMessage(tab.id, { action: 'toggle-command-menu' });
    }
  });

  // Handle keyboard commands
  browser.commands.onCommand.addListener(async (command, tab) => {
    if (!tab?.id) return;

    switch (command) {
      case 'open-command-menu':
        browser.tabs.sendMessage(tab.id, { action: 'toggle-command-menu' });
        break;
      case 'capture-visible':
        browser.tabs.sendMessage(tab.id, { action: 'capture-visible' });
        break;
      case 'capture-fullpage':
        browser.tabs.sendMessage(tab.id, { action: 'capture-fullpage' });
        break;
      case 'capture-element':
        browser.tabs.sendMessage(tab.id, { action: 'capture-element' });
        break;
    }
  });

  // Handle context menu
  browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
      id: 'snapcommand-capture',
      title: 'Capture with SnapCommand',
      contexts: ['page', 'image', 'link']
    });

    browser.contextMenus.create({
      id: 'snapcommand-element',
      parentId: 'snapcommand-capture',
      title: 'Capture this element',
      contexts: ['page', 'image', 'link']
    });

    browser.contextMenus.create({
      id: 'snapcommand-visible',
      parentId: 'snapcommand-capture',
      title: 'Capture visible area',
      contexts: ['page']
    });

    browser.contextMenus.create({
      id: 'snapcommand-full',
      parentId: 'snapcommand-capture',
      title: 'Capture full page',
      contexts: ['page']
    });
  });

  browser.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id) return;

    switch (info.menuItemId) {
      case 'snapcommand-element':
        browser.tabs.sendMessage(tab.id, { 
          action: 'capture-element',
          targetElement: true 
        });
        break;
      case 'snapcommand-visible':
        browser.tabs.sendMessage(tab.id, { action: 'capture-visible' });
        break;
      case 'snapcommand-full':
        browser.tabs.sendMessage(tab.id, { action: 'capture-fullpage' });
        break;
    }
  });

  // Handle messages from content script
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'capture-visible-area') {
      captureVisibleTab().then(sendResponse);
      return true; // Will respond asynchronously
    }
    
    if (message.action === 'download') {
      browser.downloads.download({
        url: message.url,
        filename: message.filename,
        saveAs: message.saveAs ?? false
      });
    }
  });
});

async function captureVisibleTab(): Promise<string> {
  try {
    // Call without parameters to capture the current window
    const dataUrl = await browser.tabs.captureVisibleTab({
      format: 'png'
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to capture visible tab:', error);
    throw error;
  }
}