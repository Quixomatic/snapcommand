import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'SnapCommand',
    description: 'Professional screenshot extension with command menu interface',
    version: '1.0.0',
    permissions: [
      'activeTab',
      'storage',
      'contextMenus',
      'tabs',
      '<all_urls>'
    ],
    commands: {
      'open-command-menu': {
        suggested_key: {
          default: 'Ctrl+Shift+S',
          mac: 'Command+Shift+S'
        },
        description: 'Open SnapCommand menu'
      },
      'capture-visible': {
        suggested_key: {
          default: 'Ctrl+Shift+V',
          mac: 'Command+Shift+V'
        },
        description: 'Capture visible area'
      },
      'capture-fullpage': {
        suggested_key: {
          default: 'Ctrl+Shift+F',
          mac: 'Command+Shift+F'
        },
        description: 'Capture full page'
      },
      'capture-element': {
        suggested_key: {
          default: 'Ctrl+Shift+E',
          mac: 'Command+Shift+E'
        },
        description: 'Select element to capture'
      }
    },
    icons: {
      16: '/icon-16.png',
      32: '/icon-32.png',
      48: '/icon-48.png',
      128: '/icon-128.png'
    }
  }
});