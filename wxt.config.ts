import { defineConfig } from "wxt";
import path from "path";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  alias: {
    "@/components": path.resolve(__dirname, "./components"),
    "@/lib": path.resolve(__dirname, "./lib"),
    "@/styles": path.resolve(__dirname, "./styles"),
    "@/entrypoints": path.resolve(__dirname, "./entrypoints"),
  },
  manifest: {
    name: "SnapCommand",
    description:
      "Professional screenshot extension with command menu interface",
    version: "1.0.0",
    permissions: [
      "activeTab",
      "storage",
      "contextMenus",
      "tabs",
      "downloads",
      "scripting",
      "clipboardWrite"
    ],
    host_permissions: ["<all_urls>"],
    // Remove popup to allow onClicked event
    // No default_popup specified
    action: {
      default_title: "Open SnapCommand (Ctrl+Shift+S)",
      default_icon: {
        16: "/icon-16.png",
        32: "/icon-32.png",
        48: "/icon-48.png",
        128: "/icon-128.png",
      },
    },
    commands: {
      "open-command-menu": {
        suggested_key: {
          default: "Ctrl+Shift+S",
          mac: "Command+Shift+S",
        },
        description: "Open SnapCommand menu",
      },
      "capture-visible": {
        suggested_key: {
          default: "Ctrl+Shift+V",
          mac: "Command+Shift+V",
        },
        description: "Capture visible area",
      },
      "capture-fullpage": {
        suggested_key: {
          default: "Ctrl+Shift+F",
          mac: "Command+Shift+F",
        },
        description: "Capture full page",
      },
      "capture-element": {
        suggested_key: {
          default: "Ctrl+Shift+E",
          mac: "Command+Shift+E",
        },
        description: "Select element to capture",
      },
    },
    icons: {
      16: "/icon-16.png",
      32: "/icon-32.png",
      48: "/icon-48.png",
      128: "/icon-128.png",
    },
  },
});
