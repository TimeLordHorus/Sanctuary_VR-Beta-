/**
 * Teleporter Component
 * Handles VR teleportation mechanics
 */

export class Teleporter {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.teleportPoints = [];
    this.currentPoint = null;
    this.enabled = true;
  }

  addTeleportPoint(id, position, label) {
    const point = {
      id,
      position: { ...position },
      label: label || id,
      active: true
    };

    this.teleportPoints.push(point);
    return point;
  }

  teleportTo(targetId) {
    if (!this.enabled) return false;

    const point = this.teleportPoints.find(p => p.id === targetId);
    if (!point || !point.active) {
      console.warn(`Teleport point not found or inactive: ${targetId}`);
      return false;
    }

    // Perform teleportation
    if (this.camera) {
      this.camera.position.set(
        point.position.x,
        point.position.y || 0,
        point.position.z
      );
    }

    this.currentPoint = point;
    console.log(`Teleported to: ${point.label}`);

    return true;
  }

  teleportToPosition(x, y, z) {
    if (!this.enabled || !this.camera) return false;

    this.camera.position.set(x, y, z);
    console.log(`Teleported to position: ${x}, ${y}, ${z}`);

    return true;
  }

  getTeleportPoints() {
    return this.teleportPoints.filter(p => p.active);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  dispose() {
    this.teleportPoints = [];
    this.currentPoint = null;
  }
}
