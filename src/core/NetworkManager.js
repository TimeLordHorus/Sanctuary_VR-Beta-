/**
 * Network Manager
 * Handles multiplayer networking for LAN and Online play
 */

import { Logger } from '../utils/Logger.js';

export class NetworkManager {
  constructor(core) {
    this.core = core;
    this.mode = null; // 'local', 'lan-host', 'lan-join', 'online'
    this.socket = null;
    this.peerId = null;
    this.peers = new Map();
    this.isHost = false;
    this.roomId = null;
  }

  async init(mode, config = {}) {
    Logger.info(`Initializing network manager in ${mode} mode`);
    this.mode = mode;

    switch (mode) {
      case 'local':
        return this.initLocal();
      case 'lan-host':
        return this.initLANHost(config);
      case 'lan-join':
        return this.initLANJoin(config);
      case 'online-quick':
        return this.initOnlineQuickMatch(config);
      case 'online-create':
        return this.initOnlineCreate(config);
      case 'online-join':
        return this.initOnlineJoin(config);
      default:
        Logger.error(`Unknown network mode: ${mode}`);
    }
  }

  initLocal() {
    Logger.info('Local play mode - no network initialization needed');
    return true;
  }

  async initLANHost(config) {
    Logger.info('Initializing as LAN host');
    this.isHost = true;

    try {
      // Initialize WebRTC peer for LAN
      await this.initPeerConnection();

      // Generate room code
      this.roomId = this.generateRoomCode();

      Logger.info(`LAN session hosted with room code: ${this.roomId}`);
      this.core.emit('networkReady', {
        mode: 'lan-host',
        roomId: this.roomId
      });

      return true;
    } catch (error) {
      Logger.error('Failed to initialize LAN host:', error);
      return false;
    }
  }

  async initLANJoin(config) {
    Logger.info(`Joining LAN session at ${config.ip}`);

    try {
      // Connect to LAN host
      await this.connectToPeer(config.ip);

      Logger.info('Connected to LAN session');
      this.core.emit('networkReady', {
        mode: 'lan-join'
      });

      return true;
    } catch (error) {
      Logger.error('Failed to join LAN session:', error);
      this.core.emit('networkError', {
        message: 'Could not connect to LAN session'
      });
      return false;
    }
  }

  async initOnlineQuickMatch(config) {
    Logger.info('Searching for quick match');

    try {
      // Connect to matchmaking server
      await this.connectToMatchmaking();

      // Request quick match
      this.sendMatchmakingRequest('quick-match');

      return true;
    } catch (error) {
      Logger.error('Quick match failed:', error);
      return false;
    }
  }

  async initOnlineCreate(config) {
    Logger.info('Creating online room:', config.config);
    this.isHost = true;

    try {
      // Connect to game server
      await this.connectToGameServer();

      // Create room
      this.roomId = await this.createOnlineRoom(config.config);

      Logger.info(`Online room created: ${this.roomId}`);
      this.core.emit('networkReady', {
        mode: 'online-create',
        roomId: this.roomId
      });

      return true;
    } catch (error) {
      Logger.error('Failed to create online room:', error);
      return false;
    }
  }

  async initOnlineJoin(config) {
    Logger.info(`Joining online room: ${config.roomId}`);

    try {
      // Connect to game server
      await this.connectToGameServer();

      // Join room
      await this.joinOnlineRoom(config.roomId);

      Logger.info('Joined online room');
      this.core.emit('networkReady', {
        mode: 'online-join'
      });

      return true;
    } catch (error) {
      Logger.error('Failed to join online room:', error);
      return false;
    }
  }

  async initPeerConnection() {
    // Simplified peer connection setup
    // In production, use a library like PeerJS or simple-peer
    Logger.info('Initializing peer connection');

    // Simulate peer connection
    this.peerId = this.generatePeerId();
    return true;
  }

  async connectToPeer(address) {
    Logger.info(`Connecting to peer: ${address}`);

    // Simulate connection
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate successful connection
        const success = Math.random() > 0.2; // 80% success rate

        if (success) {
          this.peers.set(address, {
            id: address,
            connected: true,
            latency: Math.floor(Math.random() * 50) + 10
          });
          resolve(true);
        } else {
          reject(new Error('Connection timeout'));
        }
      }, 1500);
    });
  }

  async connectToMatchmaking() {
    Logger.info('Connecting to matchmaking server');

    // In production, connect to actual matchmaking server
    // For now, simulate connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.socket = { connected: true };
        resolve(true);
      }, 1000);
    });
  }

  async connectToGameServer() {
    Logger.info('Connecting to game server');

    // Simulate server connection
    return new Promise((resolve) => {
      setTimeout(() => {
        this.socket = {
          connected: true,
          url: 'wss://sanctuary-vr.example.com'
        };
        resolve(true);
      }, 1000);
    });
  }

  sendMatchmakingRequest(type) {
    Logger.info(`Sending matchmaking request: ${type}`);

    // Simulate matchmaking
    setTimeout(() => {
      this.roomId = this.generateRoomCode();
      this.core.emit('matchFound', {
        roomId: this.roomId,
        players: Math.floor(Math.random() * 5) + 1
      });
    }, 2000);
  }

  async createOnlineRoom(config) {
    Logger.info('Creating room on server:', config);

    // Simulate room creation
    return new Promise((resolve) => {
      setTimeout(() => {
        const roomId = this.generateRoomCode();
        resolve(roomId);
      }, 1000);
    });
  }

  async joinOnlineRoom(roomId) {
    Logger.info(`Joining room: ${roomId}`);

    // Simulate joining room
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const success = Math.random() > 0.3;
        if (success) {
          this.roomId = roomId;
          resolve(true);
        } else {
          reject(new Error('Room not found or full'));
        }
      }, 1000);
    });
  }

  sendPlayerUpdate(playerData) {
    if (!this.socket?.connected && this.peers.size === 0) return;

    // Broadcast player position/state to all peers
    const update = {
      type: 'player-update',
      peerId: this.peerId,
      data: playerData,
      timestamp: Date.now()
    };

    // Send to all connected peers
    this.peers.forEach((peer) => {
      this.sendToPeer(peer.id, update);
    });
  }

  sendToPeer(peerId, data) {
    Logger.debug(`Sending to peer ${peerId}:`, data);
    // Actual peer communication would happen here
  }

  onPeerMessage(peerId, message) {
    Logger.debug(`Received from peer ${peerId}:`, message);

    switch (message.type) {
      case 'player-update':
        this.handlePlayerUpdate(message);
        break;
      case 'chat':
        this.handleChatMessage(message);
        break;
      default:
        Logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  handlePlayerUpdate(message) {
    this.core.emit('remotePlayerUpdate', {
      peerId: message.peerId,
      data: message.data
    });
  }

  handleChatMessage(message) {
    this.core.emit('chatMessage', {
      peerId: message.peerId,
      text: message.text,
      timestamp: message.timestamp
    });
  }

  generateRoomCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  generatePeerId() {
    return `peer-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  disconnect() {
    Logger.info('Disconnecting from network');

    if (this.socket) {
      this.socket.close?.();
      this.socket = null;
    }

    this.peers.clear();
    this.roomId = null;
    this.isHost = false;
  }

  dispose() {
    this.disconnect();
  }
}
