# Contributing to Sanctuary VR

Thank you for your interest in contributing to Sanctuary VR! This document provides guidelines and instructions for contributing.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or videos if applicable
- Your environment (OS, browser, VR headset, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear and descriptive title
- Detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any alternatives you've considered

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

#### Pull Request Guidelines

- Follow the existing code style
- Update documentation as needed
- Add tests for new features
- Ensure all tests pass
- Keep PRs focused on a single feature or fix
- Write clear commit messages

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/sanctuary-vr-beta.git
cd sanctuary-vr-beta

# Install dependencies
npm install

# Start development server
npm run dev:web

# Run tests
npm test

# Run linter
npm run lint
```

## Code Style

- Use ESLint and Prettier configurations provided
- Write meaningful variable and function names
- Add comments for complex logic
- Follow the existing project structure

### JavaScript Style

```javascript
// Good
function teleportPlayer(position) {
  if (!position) return false;

  // Teleport logic here
  return true;
}

// Bad
function tp(p) {
  // No validation
  // Teleport
}
```

## Testing

- Write unit tests for new features
- Ensure VR functionality works across different devices
- Test on multiple browsers (Chrome, Firefox, Edge)
- Test in both VR and desktop modes

## Documentation

- Update README.md if needed
- Add documentation to knowledge-base/ for significant features
- Include JSDoc comments for functions and classes
- Update API documentation for public APIs

## Platform-Specific Contributions

### Web (A-Frame/Three.js)
- Test on WebXR-compatible browsers
- Ensure mobile VR compatibility
- Optimize for performance

### Unity
- Follow Unity C# coding conventions
- Test on target VR platforms
- Ensure compatibility with Unity 2021.3 LTS+

### Godot
- Follow GDScript style guide
- Test on Godot 4.2+
- Ensure OpenXR compatibility

## Commit Message Format

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Example:
```
feat(teleporter): add smooth teleportation option

Added configuration option for smooth vs instant teleportation
to improve user comfort preferences.

Closes #123
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue for questions or discussions about contributing.

Thank you for contributing to Sanctuary VR!
