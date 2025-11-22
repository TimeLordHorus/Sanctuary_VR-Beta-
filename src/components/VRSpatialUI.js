/**
 * VR Spatial UI Component
 * Creates 3D spatial user interface for VR environments
 */

export class VRSpatialUI {
  constructor(scene) {
    this.scene = scene;
    this.menuEntity = null;
    this.menuItems = [];
    this.isVisible = false;
  }

  init() {
    this.menuEntity = document.getElementById('vr-spatial-menu');
    if (!this.menuEntity) {
      console.error('VR spatial menu entity not found');
      return;
    }

    // Listen for VR mode changes
    this.scene.addEventListener('enter-vr', () => this.onEnterVR());
    this.scene.addEventListener('exit-vr', () => this.onExitVR());
  }

  onEnterVR() {
    console.log('Entered VR - showing spatial menu');
    // In VR mode, we might want to show the spatial UI
    // For now, we'll keep it hidden until user requests it
  }

  onExitVR() {
    console.log('Exited VR - hiding spatial menu');
    this.hide();
  }

  show() {
    if (!this.menuEntity) return;

    this.menuEntity.setAttribute('visible', true);
    this.isVisible = true;

    // Position menu in front of camera
    const camera = document.getElementById('camera');
    if (camera) {
      const cameraPos = camera.getAttribute('position');
      const cameraRot = camera.getAttribute('rotation');

      // Position menu 2 meters in front of camera
      const menuPos = {
        x: cameraPos.x - Math.sin((cameraRot.y * Math.PI) / 180) * 2,
        y: cameraPos.y,
        z: cameraPos.z - Math.cos((cameraRot.y * Math.PI) / 180) * 2
      };

      this.menuEntity.setAttribute('position', menuPos);
      this.menuEntity.setAttribute('rotation', `0 ${cameraRot.y} 0`);
    }
  }

  hide() {
    if (!this.menuEntity) return;

    this.menuEntity.setAttribute('visible', false);
    this.isVisible = false;
  }

  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  createMenuOptions(options) {
    const optionsContainer = document.getElementById('vr-menu-options');
    if (!optionsContainer) return;

    // Clear existing options
    while (optionsContainer.firstChild) {
      optionsContainer.removeChild(optionsContainer.firstChild);
    }

    // Create menu options vertically stacked
    options.forEach((option, index) => {
      const yPos = 0.3 - index * 0.3;

      // Create button background
      const button = document.createElement('a-plane');
      button.setAttribute('width', '2.5');
      button.setAttribute('height', '0.25');
      button.setAttribute('position', `0 ${yPos} 0`);
      button.setAttribute('color', option.color || '#6366f1');
      button.setAttribute('opacity', '0.8');
      button.setAttribute('shader', 'flat');
      button.classList.add('interactable');

      // Create button text
      const text = document.createElement('a-text');
      text.setAttribute('value', option.label);
      text.setAttribute('align', 'center');
      text.setAttribute('position', `0 ${yPos} 0.01`);
      text.setAttribute('width', '2.2');
      text.setAttribute('color', '#ffffff');

      // Add hover effect
      button.addEventListener('mouseenter', () => {
        button.setAttribute('opacity', '1.0');
        button.setAttribute('scale', '1.05 1.05 1');
      });

      button.addEventListener('mouseleave', () => {
        button.setAttribute('opacity', '0.8');
        button.setAttribute('scale', '1 1 1');
      });

      // Add click handler
      button.addEventListener('click', () => {
        if (option.onClick) {
          option.onClick();
        }
      });

      optionsContainer.appendChild(button);
      optionsContainer.appendChild(text);

      this.menuItems.push({ button, text, option });
    });
  }

  updateMenuContent(title, options) {
    // Update title
    const titleEl = this.menuEntity?.querySelector('a-text');
    if (titleEl) {
      titleEl.setAttribute('value', title.toUpperCase());
    }

    // Update options
    this.createMenuOptions(options);
  }

  dispose() {
    this.hide();
    this.menuItems = [];
  }
}

// A-Frame component for VR UI controller
if (typeof AFRAME !== 'undefined') {
  AFRAME.registerComponent('vr-ui-controller', {
    init: function () {
      this.spatialUI = new VRSpatialUI(this.el.sceneEl);
      this.spatialUI.init();

      // Listen for menu button press
      this.el.addEventListener('menudown', () => {
        this.spatialUI.toggle();
      });

      // Listen for button press (Quest A button, Index A button, etc.)
      this.el.addEventListener('abuttondown', () => {
        this.spatialUI.toggle();
      });
    }
  });
}
