# Boot Screen System Guide

The Sanctuary VR boot screen provides a secure, interactive loading experience with human verification and anti-intrusion protection.

## Overview

The boot screen system features:
- **Animated System Initialization**: Beautiful mandala animation with console logs
- **Password Protection**: Anti-hacker passphrase verification with lockout mechanism
- **Interactive Mini-Game**: Human verification through a sanctuary stone pattern game
- **Security Features**: Session tokens, attempt limits, and anti-bot protection
- **Beautiful Animations**: Smooth transitions and particle effects throughout

## Boot Sequence Phases

### Phase 1: System Initialization
```
[SYSTEM] Initializing Sanctuary Core...
[VR] Loading WebXR modules...
[NETWORK] Establishing secure connections...
[SECURITY] Activating protection protocols...
[OK] All systems operational
```

**Features:**
- Animated mandala logo (3 rotating rings + pulsing center)
- Console-style system messages
- Progress bar animation
- Rotating sanctuary symbol

### Phase 2: Password Protection
**Default Password:** `sanctuary`

**Security Features:**
- Maximum 3 attempts
- 30-second lockout after failed attempts
- Session token generation
- Password visibility toggle
- Shake animation on incorrect entry

**Lockout Screen:**
- Countdown timer (30 seconds)
- Anti-intrusion warning
- Session ID display
- Automatic retry after timeout

### Phase 3: Human Verification Mini-Game
**Stone Pattern Game:**
1. Watch as 5 stones light up in random order
2. Repeat the pattern by clicking stones in the same order
3. Correct pattern = verification success
4. Incorrect pattern = retry

**Visual Feedback:**
- Stone highlighting with glow effects
- Audio tones (different frequency per stone)
- Pattern display progress
- Success particle celebration

### Phase 4: Final Loading
- Spinning mandala animation
- Sequential loading messages
- Smooth progress bar
- Fade to main HUD

## API Reference

### BootScreen Class

```javascript
import { BootScreen } from './core/BootScreen.js';

const bootScreen = new BootScreen();
await bootScreen.init();
```

### Methods

#### `init()`
Initializes and starts the boot sequence.

```javascript
await bootScreen.init();
```

#### `showSystemInit()`
Displays the system initialization phase with console logs and progress bar.

#### `showPasswordScreen()`
Shows the password protection interface.

#### `verifyPassword()`
Validates the entered password and handles attempts/lockout.

```javascript
// Called automatically when user submits password
```

#### `showMiniGame()`
Displays the interactive stone pattern game for human verification.

#### `generatePattern(length)`
Creates a random pattern of stone indices.

```javascript
const pattern = bootScreen.generatePattern(5); // [0, 2, 4, 1, 3]
```

#### `playTone(frequency, duration)`
Plays an audio tone for feedback.

```javascript
bootScreen.playTone(440, 100); // Play 440Hz for 100ms
```

#### `skipBoot()`
Development function to bypass boot sequence.

```javascript
bootScreen.skipBoot(); // Skip to main app
```

### Properties

```javascript
{
  currentPhase: 'init' | 'password' | 'minigame' | 'loading' | 'complete',
  verified: boolean,
  passwordAttempts: number,
  maxAttempts: 3,
  lockoutTime: 30000, // milliseconds
  sessionToken: string,
  bootStartTime: number,
  gameCompleted: boolean,
  targetPattern: number[],
  currentPattern: number[]
}
```

## Events

### `bootComplete`
Emitted when boot sequence finishes successfully.

```javascript
sanctuaryInstance.core.on('bootComplete', (data) => {
  console.log('Boot time:', data.bootTime);
  console.log('Verified:', data.verified);
  console.log('Session:', data.sessionToken);
});
```

## Customization

### Changing the Default Password

Edit `src/core/BootScreen.js`:

```javascript
async verifyPassword() {
  // ...
  const correctPassword = 'your-custom-password'; // Change this
  // ...
}
```

### Adjusting Security Settings

```javascript
constructor() {
  this.maxAttempts = 5; // Change max attempts
  this.lockoutTime = 60000; // Change lockout to 60 seconds
  // ...
}
```

### Customizing Mini-Game Difficulty

```javascript
// Change pattern length (default: 5)
this.targetPattern = this.generatePattern(7); // Harder

// Change stone count
// Modify HTML in showMiniGame() method
```

### Custom Loading Messages

```javascript
const messages = [
  'Your custom message 1...',
  'Your custom message 2...',
  'Your custom message 3...',
  // ...
];
```

## Styling

The boot screen uses `src/styles/boot.css` for all visual styling.

### Key CSS Classes

```css
.boot-phase           /* Main phase container */
.boot-logo            /* Logo and mandala */
.mandala-ring         /* Rotating rings */
.boot-console         /* Console log area */
.security-frame       /* Password screen */
.stone-garden         /* Mini-game stones */
.loading-mandala      /* Final loading spinner */
```

### Custom Colors

```css
:root {
  --boot-primary: #6366f1;
  --boot-secondary: #8b5cf6;
  --boot-success: #10b981;
  --boot-error: #ef4444;
}
```

## Development Mode

### Skip Boot Sequence
Press **Ctrl + Shift + Escape** during boot to skip to main app.

```javascript
// This is automatically enabled in development
// Remove in production if desired
```

### Disable Boot Screen
Comment out boot initialization in `src/index.js`:

```javascript
// await this.bootScreen.init();
// await this.waitForBoot();
```

## Security Best Practices

### Password Storage
**Current Implementation:** Plain text comparison (suitable for demo)

**Production Recommendations:**
```javascript
// Use hashing
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash('sanctuary', 10);

// Verify
const match = await bcrypt.compare(userInput, hashedPassword);
```

### Session Tokens
```javascript
// Current: Simple timestamp + random
// Production: Use JWT or similar

import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: 'user123', verified: true },
  'your-secret-key',
  { expiresIn: '1h' }
);
```

### Rate Limiting
Consider implementing server-side rate limiting for production:

```javascript
// Track attempts by IP address
// Implement progressive delays
// Use CAPTCHA services for additional security
```

## Troubleshooting

### Boot Screen Not Appearing
```javascript
// Check if container exists
const bootContainer = document.getElementById('boot-screen');
console.log('Boot container:', bootContainer);

// Verify CSS is loaded
console.log('Boot CSS loaded:',
  document.querySelector('link[href*="boot.css"]'));
```

### Password Not Working
```javascript
// Check password value
console.log('Password:', passwordInput.value);

// Verify attempts counter
console.log('Attempts:', bootScreen.passwordAttempts);
```

### Mini-Game Not Responding
```javascript
// Check pattern generation
console.log('Target pattern:', bootScreen.targetPattern);

// Verify stone listeners
const stones = document.querySelectorAll('.stone');
console.log('Stones found:', stones.length);
```

### Audio Not Playing
```javascript
// Check AudioContext support
console.log('AudioContext:',
  window.AudioContext || window.webkitAudioContext);

// Verify user interaction (required for audio)
// Audio must be triggered by user action
```

## Performance

### Optimization Tips

1. **Reduce Particles:**
```javascript
// In createSecurityParticles()
for (let i = 0; i < 10; i++) { // Reduced from 20
  // ...
}
```

2. **Disable Animations:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

3. **Skip Delays:**
```javascript
// Reduce sleep times in development
await this.sleep(100); // Instead of 1000
```

## Accessibility

### Keyboard Navigation
- **Tab**: Navigate through input fields
- **Enter**: Submit password/restart game
- **Escape**: (Dev) Skip boot when combined with Ctrl+Shift

### Screen Reader Support
Add ARIA labels:

```javascript
passwordInput.setAttribute('aria-label', 'Sanctuary passphrase');
passwordInput.setAttribute('aria-required', 'true');
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .boot-phase {
    border: 2px solid white;
  }
  .mandala-ring {
    border-width: 3px;
  }
}
```

## Examples

### Complete Boot Flow

```javascript
// 1. User opens application
// 2. Boot screen initializes
// 3. System init animation plays (~3 seconds)
// 4. Password screen appears
// 5. User enters "sanctuary"
// 6. Mini-game appears
// 7. User completes pattern
// 8. Final loading screen (~4 seconds)
// 9. Main HUD appears
// Total: ~15-30 seconds depending on user speed
```

### Custom Boot Sequence

```javascript
class CustomBootScreen extends BootScreen {
  async startBootSequence() {
    await this.showSystemInit();
    await this.showCustomPhase();
    await this.showMiniGame();
    await this.showFinalLoading();
  }

  async showCustomPhase() {
    // Your custom boot phase
  }
}
```

## Resources

- [BootScreen.js Source](../src/core/BootScreen.js)
- [Boot CSS Source](../src/styles/boot.css)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Best Practices for Loading Screens](https://uxdesign.cc/)

## Next Steps

- [HUD System Guide](./hud-system.md)
- [Security Best Practices](../architecture/security.md)
- [VR Input Handling](./vr-input.md)
