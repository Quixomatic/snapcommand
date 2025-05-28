```
snapcommand/
├── package.json
├── tsconfig.json
├── wxt.config.ts
├── vite.config.ts
├── .gitignore
├── README.md
├── entrypoints/
│   ├── background.ts
│   ├── content.tsx
│   └── popup/
│       ├── index.html
│       └── main.tsx
├── components/
│   ├── command-menu/
│   │   ├── CommandMenu.tsx
│   │   ├── CommandItem.tsx
│   │   └── CommandShortcut.tsx
│   ├── capture/
│   │   ├── ElementSelector.tsx
│   │   ├── DrawSelection.tsx
│   │   ├── CapturePreview.tsx
│   │   └── CaptureControls.tsx
│   ├── ui/
│   │   └── (shadcn components)
│   └── settings/
│       ├── SettingsDialog.tsx
│       └── PreferencesForm.tsx
├── lib/
│   ├── capture/
│   │   ├── snapdom-capture.ts
│   │   ├── viewport-capture.ts
│   │   ├── element-picker.ts
│   │   └── image-processor.ts
│   ├── storage/
│   │   ├── preferences.ts
│   │   └── history.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   └── format.ts
│   └── constants.ts
├── types/
│   └── snapdom.d.ts
├── styles/
│   └── globals.css
└── public/
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-48.png
    └── icon-128.png
```