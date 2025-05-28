# SnapCommand

A professional Chrome extension for capturing screenshots with a command menu interface.

## Features

- 🎯 **Multiple Capture Modes**
  - Visible Area - Capture the current viewport
  - Full Page - Capture entire scrollable page using snapDOM
  - Select Element - Interactive element picker with hover highlighting
  - Draw Selection - Click and drag to capture any area
  - CSS Selector - Target elements by CSS selector
  - All Open Tabs - Batch capture visible areas

- ⌨️ **Command Menu Interface**
  - Quick access with Cmd/Ctrl+Shift+S
  - Searchable commands
  - Keyboard shortcuts for all actions
  - Real-time settings toggles

- 🎨 **Advanced Features**
  - Multiple format support (PNG, JPG, WebP)
  - Quality settings for JPG/WebP
  - Copy to clipboard
  - Auto-download with smart filenames
  - Preview with zoom and editing
  - Capture history
  - Dark/light theme support

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snapcommand.git
cd snapcommand
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Start development:
```bash
npm run dev
# or
pnpm dev
```

4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` directory

## Usage

### Keyboard Shortcuts

- **Cmd/Ctrl+Shift+S** - Open command menu
- **Cmd/Ctrl+Shift+V** - Capture visible area
- **Cmd/Ctrl+Shift+F** - Capture full page
- **Cmd/Ctrl+Shift+E** - Select element to capture
- **Cmd/Ctrl+Shift+D** - Draw selection area
- **Cmd/Ctrl+Shift+A** - Capture all tabs

### Command Menu

The command menu provides access to all features:
- Type to search commands
- Use arrow keys to navigate
- Press Enter to execute
- Toggle settings with a single click
- Switch formats with Cmd/Ctrl+1/2/3

### Element Selection

When selecting elements:
- Move mouse to highlight elements
- Click to capture
- Use arrow keys for fine navigation
- Press Escape to cancel

### Draw Selection

For area selection:
- Click and drag to draw rectangle
- Hold Shift for square selection
- Press G to toggle grid
- Use arrow keys to adjust
- Press Enter to capture

## Development

### Project Structure

```
snapcommand/
├── entrypoints/        # Extension entry points
│   ├── background.ts   # Background service worker
│   ├── content.tsx     # Content script with React UI
│   └── popup/          # Extension popup
├── components/         # React components
│   ├── command-menu/   # Command menu components
│   ├── capture/        # Capture-related components
│   ├── ui/            # shadcn/ui components
│   └── settings/      # Settings components
├── lib/               # Core functionality
│   ├── capture/       # Capture logic
│   ├── storage/       # Preferences & history
│   └── utils/         # Utilities
└── styles/            # Global styles
```

### Technologies Used

- **WXT** - Next-gen web extension framework
- **React** - UI components
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **CmdK** - Command menu
- **snapDOM** - High-quality DOM capture
- **Zustand** - State management

### Building for Production

```bash
# Build for Chrome
npm run build

# Build for Firefox
npm run build:firefox

# Create zip for distribution
npm run zip
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Plans

- [ ] Cloud integration (placeholder for future development)
- [ ] Annotation tools
- [ ] Custom presets
- [ ] Macro recording
- [ ] Advanced batch operations

## License

MIT License - see LICENSE file for details

## Acknowledgments

- [WXT](https://wxt.dev/) for the extension framework
- [snapDOM](https://github.com/zumerlab/snapdom) for DOM capture
- [CmdK](https://cmdk.paco.me/) for the command menu
- [shadcn/ui](https://ui.shadcn.com/) for UI components