/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, Wire, CustomGateDefinition } from './circuit';

export interface CollaboratorUser {
  id: string;
  name: string;
  initial: string; // First letter of name (e.g. "V", "E", "S")
  color: string;   // Sovereign user accent color (e.g. "#76B4C2", "#A58D66", "#DFCCA8")
  avatarBg: string;
  isHost: boolean;
  joinedAt: number;
  lastActive: number;
  selectedComponentId?: string | null;
  selectedWireId?: string | null;
  cursor?: {
    x: number;
    y: number;
  } | null;
}

export interface CollaborativeRoomCircuit {
  components: CircuitComponent[];
  wires: Wire[];
  customGates?: CustomGateDefinition[];
  name?: string;
}

export interface CollaborativeRoom {
  roomId: string; // 6-character room code (e.g. "LG-782" or "X7K2P9")
  name: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  lastUpdatedAt: number;
  lastModifiedBy: string;
  version: number;
  circuit: CollaborativeRoomCircuit;
  users?: Record<string, CollaboratorUser>;
}

export interface RecentServerItem {
  roomCode: string;
  serverName: string;
  isHost: boolean;
  lastJoinedAt: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
