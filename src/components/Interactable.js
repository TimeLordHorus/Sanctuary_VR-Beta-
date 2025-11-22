/**
 * Interactable Component
 * Base class for interactive VR objects
 */

export class Interactable {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      highlightOnHover: true,
      highlightColor: '#4CAF50',
      originalColor: null,
      onClick: null,
      onHover: null,
      onLeave: null,
      ...options
    };

    this.isHovered = false;
    this.isGrabbed = false;

    this.init();
  }

  init() {
    if (!this.element) return;

    // Store original color
    if (this.element.getAttribute) {
      this.options.originalColor = this.element.getAttribute('color') || '#FFFFFF';
    }

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.element.addEventListener) return;

    // Mouse/Controller enter
    this.element.addEventListener('mouseenter', () => this.onHoverStart());
    this.element.addEventListener('raycaster-intersected', () => this.onHoverStart());

    // Mouse/Controller leave
    this.element.addEventListener('mouseleave', () => this.onHoverEnd());
    this.element.addEventListener('raycaster-intersected-cleared', () => this.onHoverEnd());

    // Click/Trigger
    this.element.addEventListener('click', () => this.onClick());
    this.element.addEventListener('triggerdown', () => this.onClick());

    // Grab events
    this.element.addEventListener('gripdown', () => this.onGrabStart());
    this.element.addEventListener('gripup', () => this.onGrabEnd());
  }

  onHoverStart() {
    if (this.isHovered) return;

    this.isHovered = true;

    // Highlight object
    if (this.options.highlightOnHover && this.element.setAttribute) {
      this.element.setAttribute('color', this.options.highlightColor);
    }

    // Call custom hover handler
    if (this.options.onHover) {
      this.options.onHover(this);
    }

    console.log('Interactable hovered');
  }

  onHoverEnd() {
    if (!this.isHovered) return;

    this.isHovered = false;

    // Restore original color
    if (this.options.highlightOnHover && this.element.setAttribute) {
      this.element.setAttribute('color', this.options.originalColor);
    }

    // Call custom leave handler
    if (this.options.onLeave) {
      this.options.onLeave(this);
    }

    console.log('Interactable hover ended');
  }

  onClick() {
    console.log('Interactable clicked');

    // Call custom click handler
    if (this.options.onClick) {
      this.options.onClick(this);
    }
  }

  onGrabStart() {
    this.isGrabbed = true;
    console.log('Interactable grabbed');
  }

  onGrabEnd() {
    this.isGrabbed = false;
    console.log('Interactable released');
  }

  setEnabled(enabled) {
    this.enabled = enabled;

    if (this.element && this.element.setAttribute) {
      this.element.setAttribute('visible', enabled);
    }
  }

  dispose() {
    // Remove event listeners and cleanup
    this.isHovered = false;
    this.isGrabbed = false;
  }
}
