# SnapCommand

A powerful Chrome extension for capturing screenshots with a professional command menu interface. Built with modern web technologies for speed, reliability, and ease of use.

<!-- TODO: Add main hero screenshot/GIF showing the command menu in action -->
![SnapCommand Demo](screenshots/hero-demo.gif)

## 🚀 Features

### 📸 **Multiple Capture Modes**
- **Visible Area** - Capture the current viewport
- **Full Page** - Capture entire scrollable page with high quality
- **Select Element** - Interactive element picker with hover highlighting
- **Draw Selection** - Click and drag to capture any rectangular area
- **CSS Selector** - Target elements using CSS selectors

### ⌨️ **Command Menu Interface**
- Lightning-fast access with **Ctrl+Shift+S** (or Cmd+Shift+S on Mac)
- Searchable commands with fuzzy matching
- Customizable keyboard shortcuts for all actions
- Real-time settings toggles and format switching

### 🎨 **Professional Features**
- **Multiple formats**: PNG, JPG, WebP with quality controls
- **Smart actions**: Copy to clipboard, auto-download, or preview
- **Capture history** with search and management
- **Customizable preferences** for workflow optimization
- **Scale options** from 0.5x to 3x for different quality needs

<!-- TODO: Add screenshots showing different capture modes -->
## 📷 Screenshots

### Command Menu
<!-- TODO: Replace with actual screenshot -->
![Command Menu](screenshots/command-menu.png)
*The main command interface with search and quick actions*

### Element Selection
<!-- TODO: Replace with actual screenshot -->
![Element Selection](screenshots/element-selection.png)
*Interactive element selection with visual highlighting*

### Preview Modal
<!-- TODO: Replace with actual screenshot -->
![Preview Modal](screenshots/preview-modal.png)
*Screenshot preview with copy, download, and zoom controls*

### Capture History
<!-- TODO: Replace with actual screenshot -->
![Capture History](screenshots/capture-history.png)
*Manage and search through your screenshot history*

### Settings & Preferences
<!-- TODO: Replace with actual screenshot -->
![Preferences](screenshots/preferences.png)
*Comprehensive settings for customizing your workflow*

## 🎬 Demo Videos

<!-- TODO: Add demo GIFs showing key features -->
### Quick Capture Workflow
![Quick Capture](screenshots/quick-capture-demo.gif)
*Capturing a screenshot in under 3 seconds*

### Element Selection in Action
![Element Selection Demo](screenshots/element-selection-demo.gif)
*Selecting and capturing specific page elements*

## 📦 Installation

### From Chrome Web Store
1. Visit the [Chrome Web Store page](https://chrome.google.com/webstore/detail/snapcommand/YOUR_EXTENSION_ID)
2. Click "Add to Chrome"
3. Start capturing with **Ctrl+Shift+S**!

### For Development
1. Clone the repository:
```bash
git clone https://github.com/yourusername/snapcommand.git
cd snapcommand
```

2. Install dependencies:
```bash
npm install
```

3. Start development:
```bash
npm run dev
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` directory

## 🎮 Usage

### Default Keyboard Shortcuts
All shortcuts are customizable in the preferences!

- **Ctrl+Shift+S** - Open command menu
- **Ctrl+Shift+V** - Capture visible area
- **Ctrl+Shift+F** - Capture full page
- **Ctrl+Shift+E** - Select element to capture
- **Ctrl+Shift+D** - Draw selection area
- **Ctrl+Shift+C** - CSS selector mode
- **Ctrl+1/2/3** - Switch format (PNG/JPG/WebP)

### Command Menu
The heart of SnapCommand - access everything from one interface:
- Type to search commands
- Use arrow keys to navigate
- Press Enter to execute
- Toggle settings instantly
- See your current format and preferences at a glance

### Element Selection
Perfect for capturing specific UI components:
- Hover to highlight elements
- Click to select and capture
- Use arrow keys for precise navigation
- Confirmation dialog with parent/child navigation
- Press Escape to cancel

### Area Selection
Draw custom capture areas:
- Click and drag to define the area
- Visual feedback with measurement overlay
- Press Escape to cancel selection

## 🛠️ Development

### Tech Stack
- **[WXT](https://wxt.dev/)** - Next-generation web extension framework
- **React 18** - Modern UI components
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible components
- **[CMDK](https://cmdk.paco.me/)** - Command menu interface
- **[SnapDOM](https://github.com/zumerlab/snapdom)** - High-quality DOM capture
- **[Hotkeys.js](https://github.com/jaywcjlove/hotkeys-js)** - Keyboard shortcut management

### Project Structure
```
snapcommand/
├── entrypoints/           # Extension entry points
│   ├── background.ts      # Service worker (handles captures)
│   └── content.tsx        # Main UI injected into pages
├── components/            # React components
│   ├── command-menu/      # Command palette
│   ├── capture/           # Capture modes and preview
│   ├── preferences/       # Settings management
│   ├── history/          # Capture history
│   └── ui/               # Reusable UI components
├── lib/                  # Core functionality
│   ├── capture/          # Capture logic and utilities
│   ├── storage/          # Preferences and history storage
│   └── utils/            # Shared utilities
└── styles/               # Global styles and themes
```

### Building for Production
```bash
# Development build with hot reload
npm run dev

# Production build
npm run build

# Build for different browsers
npm run build:chrome
npm run build:firefox

# Create distributable zip
npm run zip
```

### Testing
```bash
# Type checking
npm run type-check

# Build verification
npm run build
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Quick Start for Contributors
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with a clear message: `git commit -m 'Add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request with a detailed description

### Development Guidelines
- Follow the existing code style and patterns
- Add TypeScript types for new functionality
- Test your changes across different websites
- Update documentation for new features
- Ensure accessibility compliance

## 📋 Roadmap

### Near Term
- [ ] Firefox support
- [ ] Safari support (when WebExtensions API is available)
- [ ] Two-pass CORS recovery system (automatically fix cross-origin images)
- [ ] Enhanced annotation tools
- [ ] Custom capture presets

### Future Considerations
- [ ] Cloud storage integration
- [ ] Team collaboration features
- [ ] API for third-party integrations
- [ ] Advanced editing capabilities

## 🐛 Known Issues

### Cross-Origin Images
SnapCommand uses [SnapDOM](https://github.com/zumerlab/snapdom) for high-quality DOM capture. Due to browser security restrictions, some cross-origin images (like external favicons and CDN images) may not appear in screenshots. This is a [known limitation](https://github.com/zumerlab/snapdom/blob/main/README.md#cross-origin-images) of SnapDOM.

**Workarounds:**
- **Draw Selection mode** works well as a fallback for capturing specific areas
- Configure a CORS proxy in Advanced Settings (for power users)
- Most page content captures perfectly - only external images are affected

Check our [Issues page](https://github.com/yourusername/snapcommand/issues) for current known issues and their status.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[WXT](https://wxt.dev/)** for the excellent extension development framework
- **[SnapDOM](https://github.com/zumerlab/snapdom)** for reliable DOM capture technology
- **[CMDK](https://cmdk.paco.me/)** for the beautiful command palette
- **[shadcn/ui](https://ui.shadcn.com/)** for the gorgeous UI component library
- **[Radix UI](https://www.radix-ui.com/)** for accessible primitives

## 💝 Support

If SnapCommand helps improve your workflow, consider:
- ⭐ Starring this repository
- 🐛 Reporting bugs or requesting features
- 💖 [Supporting development](https://ko-fi.com/quixomatic)

---

**Made with ❤️ for productivity enthusiasts**