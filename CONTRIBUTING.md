# Contributing to SnapCommand

Thank you for your interest in contributing to SnapCommand! We welcome contributions from the community and are grateful for your help in making this extension better.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Chrome browser for testing
- Basic knowledge of TypeScript/React

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/yourusername/snapcommand.git
   cd snapcommand
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development mode**
   ```bash
   npm run dev
   ```

4. **Load the extension in Chrome**
   - Open Chrome and go to `chrome://extensions`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select the `.output/chrome-mv3` directory

## 🛠️ Development Guidelines

### Code Style

- Follow existing TypeScript and React patterns
- Use the established component structure and conventions
- Maintain accessibility standards (especially for dialogs)
- Follow the existing naming conventions for files and functions

### Project Architecture

- **`entrypoints/`** - Extension entry points (background, content scripts)
- **`components/`** - React components organized by feature
- **`lib/`** - Core functionality, utilities, and business logic
- **`styles/`** - Global styles and Tailwind configuration

### Key Technologies

- **WXT Framework** - Modern web extension development
- **React 18** - UI components and state management
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **SnapDOM** - High-quality DOM capture library

## 🎯 Types of Contributions

### Bug Fixes
- Check existing issues before creating new ones
- Include steps to reproduce the bug
- Test your fix across different websites
- Ensure accessibility isn't broken

### New Features
- Open an issue first to discuss the feature
- Consider backward compatibility
- Update documentation as needed
- Add appropriate tests if applicable

### Documentation
- Fix typos and improve clarity
- Add examples for complex features
- Update README for new functionality
- Improve inline code comments

## 📋 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Test thoroughly on multiple websites
   - Ensure no console errors or warnings

3. **Test your changes**
   ```bash
   # Type checking
   npm run type-check
   
   # Build verification
   npm run build
   ```

4. **Submit your pull request**
   - Use a clear, descriptive title
   - Include a detailed description of changes
   - Reference any related issues
   - Add screenshots for UI changes

### Pull Request Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (please describe)

## Testing
- [ ] Tested on multiple websites
- [ ] No console errors or warnings
- [ ] All capture modes work correctly
- [ ] Keyboard shortcuts function properly

## Screenshots (if applicable)
Add screenshots here for UI changes.

## Additional Notes
Any additional context or considerations.
```

## 🐛 Reporting Issues

### Bug Reports
Please include:
- **Steps to reproduce** - Clear, numbered steps
- **Expected behavior** - What should happen
- **Actual behavior** - What actually happens
- **Environment** - Chrome version, OS, website URL
- **Screenshots** - If applicable
- **Console errors** - Any error messages

### Feature Requests
Please include:
- **Use case** - Why is this feature needed?
- **Proposed solution** - How should it work?
- **Alternatives** - Other ways to solve the problem
- **Additional context** - Mockups, examples, etc.

## 🔧 Technical Guidelines

### Accessibility
- All dialogs must have proper titles
- Keyboard navigation should work everywhere
- Focus management is critical for modal interactions
- Test with screen readers when possible

### Performance
- Minimize impact on page performance
- Use React's optimization patterns (useMemo, useCallback)
- Avoid memory leaks in event listeners
- Test on low-powered devices

### Browser Compatibility
- Primary focus on Chrome (Manifest V3)
- Consider cross-browser compatibility for future
- Test edge cases and unusual page layouts
- Handle shadow DOM and iframe edge cases

## 🎨 UI/UX Guidelines

### Design Principles
- **Speed** - Everything should feel instant
- **Simplicity** - Keep interfaces clean and intuitive
- **Consistency** - Follow established patterns
- **Accessibility** - Usable by everyone

### Component Guidelines
- Use existing UI components from `components/ui/`
- Follow Radix UI accessibility patterns
- Maintain consistent spacing and typography
- Support both light and dark modes

## 🚦 Code Review Process

All submissions require review. We look for:
- **Functionality** - Does it work as intended?
- **Code Quality** - Is it well-structured and readable?
- **Performance** - Does it impact extension performance?
- **Accessibility** - Is it usable by everyone?
- **Documentation** - Is it properly documented?

## 📝 Commit Guidelines

Use clear, descriptive commit messages:

```bash
# Good examples
git commit -m "fix: element selector not updating on scroll"
git commit -m "feat: add WebP format support"
git commit -m "docs: update installation instructions"

# Format
type: short description

# Types
feat:     new feature
fix:      bug fix
docs:     documentation changes
style:    code style changes
refactor: code refactoring
test:     adding tests
chore:    maintenance tasks
```

## 💡 Need Help?

- **Issues** - Check existing issues for similar problems
- **Discussions** - Start a discussion for questions
- **Documentation** - Review the README and code comments
- **Code Examples** - Look at existing components for patterns

## 🙏 Recognition

Contributors will be:
- Listed in the README acknowledgments
- Mentioned in release notes for significant contributions
- Given credit in commit messages and PR descriptions

Thank you for contributing to SnapCommand! Your help makes this tool better for everyone. 🎉