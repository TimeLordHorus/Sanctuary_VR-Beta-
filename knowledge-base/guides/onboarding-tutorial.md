# Onboarding Tutorial System Guide

The Sanctuary VR onboarding system provides an interactive, guided tutorial that introduces users to the HUD, voice creation features, and the full capabilities of the platform.

## Overview

The onboarding tutorial features:
- **18 Interactive Steps**: Comprehensive walkthrough of all features
- **Visual Highlighting**: Spotlights and animations guide attention
- **Voice Creation Demo**: Live demonstration of voice commands
- **Creation Showcase**: Visual presentation of capabilities
- **Skip/Replay Options**: User control over tutorial flow
- **Progress Tracking**: LocalStorage remembers completion status

## Tutorial Flow

### Phase 1: Introduction (Steps 1-2)
1. **Welcome Screen**: Greeting and overview
2. **HUD Overview**: Introduction to main interface

### Phase 2: Game Modes (Steps 3-5)
3. **Local Play**: Solo exploration mode
4. **LAN Party**: Local network multiplayer
5. **Online Multiplayer**: Global sanctuary community

### Phase 3: Voice Creation (Steps 6-14)
6. **Voice Creation Intro**: Overview of voice system
7. **Voice Commands**: How to activate voice mode
8. **Creation Examples**: What you can create
9. **Environments**: Creating landscapes and spaces
10. **Objects**: Adding furniture and decorations
11. **Lighting**: Controlling atmosphere
12. **Audio**: Adding sounds and music
13. **Interactions**: Creating interactive elements
14. **AI-Powered**: Natural language understanding

### Phase 4: Controls & Conclusion (Steps 15-18)
15. **Example Commands**: Practical voice command examples
16. **VR Controls**: Controller button mappings
17. **Desktop Controls**: Keyboard and mouse controls
18. **Ready**: Completion and next steps

## Onboarding Manager API

### Initialization

```javascript
import { OnboardingManager } from './core/OnboardingManager.js';

const onboarding = new OnboardingManager(core, hudManager);
onboarding.init();
```

### Methods

#### `start()`
Begins the onboarding tutorial from step 1.

```javascript
onboarding.start();
```

#### `nextStep()`
Advances to the next tutorial step.

```javascript
onboarding.nextStep();
```

#### `previousStep()`
Goes back to the previous step.

```javascript
onboarding.previousStep();
```

#### `skip()`
Skips the tutorial (marks as incomplete in localStorage).

```javascript
onboarding.skip();
```

#### `complete()`
Completes the tutorial and saves status.

```javascript
onboarding.complete();
```

#### `restart()`
Restarts the tutorial from the beginning.

```javascript
onboarding.restart();
```

### Properties

```javascript
{
  currentStep: number,           // Current step index (0-17)
  totalSteps: number,           // Total number of steps (18)
  isActive: boolean,            // Whether tutorial is running
  hasCompletedBefore: boolean,  // From localStorage
  skipRequested: boolean        // If user skipped
}
```

## Tutorial Steps Configuration

Each step has the following structure:

```javascript
{
  id: 'unique-id',           // Step identifier
  title: 'Step Title',       // Displayed in tooltip header
  content: 'Description',    // HTML content (supports <strong>, <em>)
  highlight: 'css-selector', // Element to spotlight (null for none)
  position: 'center',        // Tooltip position (center, top, bottom, left, right)
  action: function           // Optional async function to execute
}
```

### Example Step Definition

```javascript
{
  id: 'local-play',
  title: 'Local Play Mode 🏛️',
  content: 'Solo exploration mode. Perfect for meditation and relaxation.',
  highlight: '[data-option-id="local"]',
  position: 'bottom',
  action: null
}
```

## Visual Components

### Spotlight Highlight
Darkens screen except for highlighted element with glowing border.

```css
.onboarding-spotlight {
  border: 3px solid #6366f1;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
}
```

### Tooltip
Floating panel that shows step information.

**Sections:**
- **Header**: Title + progress counter
- **Content**: Step description
- **Footer**: Navigation buttons

### Voice Demo Panel
Animated demonstration of voice input system.

**Features:**
- Microphone icon with bounce animation
- Waveform visualization (5 bars)
- Example command text
- Success response feedback

### Creation Showcase
Grid display of creation capabilities.

**Categories:**
1. Environments (🌄)
2. Objects (🗿)
3. Lighting (💡)
4. Audio (🔊)
5. Interactions (🎯)
6. Effects (✨)

## Keyboard Controls

During onboarding:
- **→ (Right Arrow)** or **Enter**: Next step
- **← (Left Arrow)**: Previous step
- **Escape**: Skip tutorial

## LocalStorage Integration

### Keys Used
```javascript
'sanctuary_onboarding_completed'  // 'true' or 'false'
'sanctuary_onboarding_date'       // ISO timestamp
```

### Check Completion Status

```javascript
const completed = localStorage.getItem('sanctuary_onboarding_completed') === 'true';
```

### Clear Completion Status

```javascript
localStorage.removeItem('sanctuary_onboarding_completed');
localStorage.removeItem('sanctuary_onboarding_date');
```

## Events

### `hudReady`
Emitted when HUD is initialized, triggers onboarding for new users.

```javascript
core.on('hudReady', () => {
  // Onboarding manager listens for this
});
```

### `onboardingComplete`
Emitted when tutorial finishes.

```javascript
core.on('onboardingComplete', (data) => {
  console.log('Completed:', data.completed);
  console.log('Steps viewed:', data.stepsViewed);
});
```

## Customization

### Adding New Steps

```javascript
this.steps.push({
  id: 'custom-feature',
  title: 'New Feature! ⭐',
  content: 'Check out our new feature...',
  highlight: '#feature-element',
  position: 'bottom',
  action: () => this.showCustomDemo()
});
```

### Custom Actions

Steps can execute custom functions:

```javascript
{
  id: 'demo-step',
  action: async function() {
    await this.showVoiceCreationDemo();
    await this.sleep(2000);
    // Custom logic here
  }
}
```

### Styling Customization

Override CSS variables:

```css
:root {
  --onboarding-primary: #6366f1;
  --onboarding-text: #f8fafc;
  --onboarding-bg: rgba(15, 23, 42, 0.95);
}
```

## Voice Creation Features

### Activation Methods

1. **Keyboard**: Press and hold **V key**
2. **Voice**: Say **"Hey Sanctuary"**
3. **VR Controller**: Press **Menu button**

### Example Commands

**Environments:**
```
"Create a peaceful zen garden with flowing water"
"Make it a starry night sky"
"Change to a tropical beach"
```

**Objects:**
```
"Add meditation cushions in a circle"
"Place a waterfall on the left"
"Create a floating crystal"
```

**Lighting:**
```
"Make it sunset with warm golden light"
"Add blue ambient glow"
"Turn on nighttime lighting"
```

**Audio:**
```
"Play gentle rain sounds"
"Start meditation music"
"Add birds chirping"
```

**Interactions:**
```
"Make the crystal glow when touched"
"Add a button that changes the sky"
"Create a teleport portal to the garden"
```

## Creation Capabilities

### What You Can Create

1. **Environments**
   - Gardens (zen, tropical, flower)
   - Temples (Japanese, Greek, modern)
   - Cosmic spaces (nebula, stars, planets)
   - Natural landscapes (mountains, beaches, forests)

2. **Objects**
   - Furniture (cushions, benches, tables)
   - Art (sculptures, paintings, installations)
   - Decorations (flowers, crystals, lanterns)
   - Functional items (doors, portals, switches)

3. **Lighting**
   - Time of day (sunrise, noon, sunset, night)
   - Atmosphere (foggy, clear, mystical)
   - Effects (glows, spotlights, ambient)
   - Color schemes (warm, cool, vibrant)

4. **Audio**
   - Nature sounds (rain, ocean, birds, wind)
   - Music (meditation, ambient, classical)
   - Effects (bells, chimes, water)
   - Custom audio files

5. **Interactions**
   - Buttons and switches
   - Teleportation triggers
   - Object animations
   - State changes (color, position, visibility)

6. **Visual Effects**
   - Particle systems (sparkles, stars, embers)
   - Portals and gateways
   - Magic effects (auras, trails)
   - Weather (rain, snow, fog)

## AI-Powered Understanding

The voice system uses natural language processing:

**Natural Commands:**
```
✓ "I want a calming forest environment"
✓ "Can you add some chairs?"
✓ "Let's make it darker"
✓ "Remove everything"
```

**Specific Commands:**
```
✓ "Create 5 meditation cushions in a pentagon"
✓ "Add a waterfall 3 meters tall on the north wall"
✓ "Set ambient light to 50% intensity, blue tint"
```

## Best Practices

### For Tutorial Designers

1. **Keep Steps Concise**: 2-3 sentences per step
2. **Use Visual Aids**: Highlight relevant UI elements
3. **Show, Don't Just Tell**: Use demos and showcases
4. **Provide Examples**: Concrete commands are better than abstract
5. **Allow Skipping**: Respect user time and experience

### For Users

1. **Take Your Time**: Each step has valuable information
2. **Try Commands**: Experiment with voice creation
3. **Use Keyboard Shortcuts**: Arrow keys for quick navigation
4. **Replay if Needed**: Tutorial can be restarted anytime

### For Developers

1. **Test All Steps**: Verify each tutorial step works
2. **Handle Missing Elements**: Gracefully handle if highlight element doesn't exist
3. **Responsive Design**: Ensure mobile/tablet compatibility
4. **Accessibility**: Support keyboard navigation and screen readers

## Troubleshooting

### Onboarding Not Starting
```javascript
// Check if marked as completed
console.log(localStorage.getItem('sanctuary_onboarding_completed'));

// Force restart
onboardingManager.restart();
```

### Highlight Not Working
```javascript
// Verify element exists
const element = document.querySelector('[data-option-id="local"]');
console.log('Element found:', element);

// Check if element is visible
console.log('Visible:', element.offsetParent !== null);
```

### Steps Out of Order
```javascript
// Reset to specific step
onboardingManager.currentStep = 5;
onboardingManager.showStep(5);
```

### Voice Demo Not Showing
```javascript
// Check if demo panel exists
const demo = document.getElementById('voice-demo');
console.log('Demo panel:', demo);

// Manually trigger demo
onboardingManager.showVoiceCreationDemo();
```

## Resources

- [OnboardingManager.js Source](../src/core/OnboardingManager.js)
- [Onboarding CSS Source](../src/styles/onboarding.css)
- [Voice Commands Guide](./voice-commands.md)
- [Creation System Documentation](./creation-system.md)

## Next Steps

- [Voice Creation System](./voice-commands.md)
- [HUD System Guide](./hud-system.md)
- [VR Controls](./vr-input.md)
