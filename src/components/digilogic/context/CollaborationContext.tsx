/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local Sovereign Collaboration Context
 * Provides offline multiplayer emulation without remote Firebase RTDB dependency.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { CollaboratorUser, CollaborativeRoom, ConnectionStatus, RecentServerItem } from '../types/collaboration';
import { CircuitComponent, Wire, CustomGateDefinition } from '../types/circuit';
import { useCircuit } from './CircuitContext';
import { useAuth } from './AuthContext';

const RECENT_SERVERS_KEY = 'digilogic_recent_rooms';

const COLLAB_COLORS = [
  '#00f0ff', // Cyber Cyan
  '#CCCCCC', // Electric Violet
  '#F5F5F5', // Emerald Surge
  '#f59e0b', // Solar Amber
  '#ec4899', // Hyper Pink
  '#B4B4B4', // Cobalt Blue
  '#14b8a6', // Teal Flux
  '#e11d48', // Ruby Gate
];

const ARCHITECT_TITLES = [
  'Quantum Architect',
  'Silicon Pioneer',
  'Logic Weaver',
  'Cybernetic Engineer',
  'Flux Designer',
  'Sovereign Hacker',
  'Circuit Synthesizer',
  'Hex Strategist',
];

export function generateTemporaryName(): string {
  const index = Math.floor(Math.random() * ARCHITECT_TITLES.length);
  const suffix = Math.floor(10 + Math.random() * 90);
  return `${ARCHITECT_TITLES[index]} #${suffix}`;
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = 'KT-';
  for (let i = 0; i < 4; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export function getRecentServers(): RecentServerItem[] {
  try {
    const saved = localStorage.getItem(RECENT_SERVERS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveRecentServer(item: RecentServerItem) {
  try {
    const list = getRecentServers().filter((s) => s.roomCode !== item.roomCode);
    list.unshift(item);
    localStorage.setItem(RECENT_SERVERS_KEY, JSON.stringify(list.slice(0, 10)));
  } catch {}
}

export function removeRecentServerFromStorage(code: string) {
  try {
    const list = getRecentServers().filter((s) => s.roomCode !== code);
    localStorage.setItem(RECENT_SERVERS_KEY, JSON.stringify(list));
  } catch {}
}

type CollabMessage =
  | { type: 'JOIN'; user: CollaboratorUser }
  | {
      type: 'JOIN_ACK';
      user: CollaboratorUser;
      room?: CollaborativeRoom;
      circuit?: {
        components: CircuitComponent[];
        wires: Wire[];
        customGates?: CustomGateDefinition[];
        name?: string;
      };
    }
  | { type: 'CURSOR'; userId: string; x: number; y: number }
  | { type: 'SELECTION'; userId: string; componentId?: string | null; wireId?: string | null }
  | {
      type: 'CIRCUIT_STATE';
      userId: string;
      components: CircuitComponent[];
      wires: Wire[];
      customGates?: CustomGateDefinition[];
      name?: string;
    }
  | { type: 'COMPONENT_MOVED'; userId: string; compId: string; x: number; y: number }
  | { type: 'INPUT_TOGGLE'; userId: string; compId: string; nextValue: number | boolean }
  | { type: 'UPDATE_ROOM_NAME'; userId: string; newName: string }
  | { type: 'HEARTBEAT'; userId: string }
  | { type: 'LEAVE'; userId: string };

interface CollaborationContextType {
  isCollaborating: boolean;
  room: CollaborativeRoom | null;
  roomCode: string | null;
  currentUser: CollaboratorUser | null;
  collaborators: CollaboratorUser[];
  activeComponentSelections: Record<string, CollaboratorUser[]>;
  activeWireSelections: Record<string, CollaboratorUser[]>;
  connectionStatus: ConnectionStatus;
  errorMessage: string | null;
  recentServers: RecentServerItem[];

  createRoom: (serverName?: string, hostName?: string) => Promise<{ success: boolean; roomCode?: string; error?: string }>;
  joinRoom: (roomCode: string, userName: string) => Promise<{ success: boolean; error?: string }>;
  leaveRoom: () => Promise<void>;
  updateServerName: (newName: string) => Promise<boolean>;
  deleteRecentServer: (roomCode: string) => void;
  updateMyCursor: (x: number, y: number) => void;
  updateMySelection: (componentId?: string | null, wireId?: string | null) => void;
  broadcastCircuitState: (
    components: CircuitComponent[],
    wires: Wire[],
    customGates?: CustomGateDefinition[],
    name?: string,
    forceImmediate?: boolean
  ) => void;
  broadcastComponentMoved: (compId: string, x: number, y: number) => void;
  broadcastInputToggle: (compId: string, nextValue: number | boolean) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export const CollaborationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    components,
    wires,
    customGates,
    circuitName,
    syncRemoteCircuitData,
    updateComponent,
    toggleSwitch,
  } = useCircuit();
  const { userProfile } = useAuth();

  const [isCollaborating, setIsCollaborating] = useState<boolean>(false);
  const [room, setRoom] = useState<CollaborativeRoom | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CollaboratorUser | null>(null);
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentServers, setRecentServers] = useState<RecentServerItem[]>(() => getRecentServers());

  const channelRef = useRef<BroadcastChannel | null>(null);
  const currentUserRef = useRef<CollaboratorUser | null>(null);
  currentUserRef.current = currentUser;

  const roomRef = useRef<CollaborativeRoom | null>(null);
  roomRef.current = room;

  const componentsRef = useRef(components);
  componentsRef.current = components;
  const wiresRef = useRef(wires);
  wiresRef.current = wires;
  const customGatesRef = useRef(customGates);
  customGatesRef.current = customGates;
  const circuitNameRef = useRef(circuitName);
  circuitNameRef.current = circuitName;

  const lastCursorBroadcastRef = useRef<number>(0);

  // Derive active component selections
  const activeComponentSelections = useMemo(() => {
    const map: Record<string, CollaboratorUser[]> = {};
    for (const user of collaborators) {
      if (user.selectedComponentId) {
        if (!map[user.selectedComponentId]) {
          map[user.selectedComponentId] = [];
        }
        map[user.selectedComponentId].push(user);
      }
    }
    return map;
  }, [collaborators]);

  // Derive active wire selections
  const activeWireSelections = useMemo(() => {
    const map: Record<string, CollaboratorUser[]> = {};
    for (const user of collaborators) {
      if (user.selectedWireId) {
        if (!map[user.selectedWireId]) {
          map[user.selectedWireId] = [];
        }
        map[user.selectedWireId].push(user);
      }
    }
    return map;
  }, [collaborators]);

  // Clean up channel on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current && currentUserRef.current) {
        try {
          channelRef.current.postMessage({
            type: 'LEAVE',
            userId: currentUserRef.current.id,
          });
          channelRef.current.close();
        } catch {}
      }
    };
  }, []);

  // Heartbeat interval to prune stale collaborators (e.g. killed tabs)
  useEffect(() => {
    if (!isCollaborating || !channelRef.current) return;

    const interval = setInterval(() => {
      if (channelRef.current && currentUserRef.current) {
        channelRef.current.postMessage({
          type: 'HEARTBEAT',
          userId: currentUserRef.current.id,
        });
      }

      // Filter out collaborators who haven't communicated in over 30s
      setCollaborators((prev) =>
        prev.filter((c) => {
          if (c.id === currentUserRef.current?.id) return true;
          return Date.now() - c.lastActive < 30000;
        })
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [isCollaborating]);

  // Message dispatcher
  const handleIncomingMessage = useCallback(
    (msg: CollabMessage) => {
      const myId = currentUserRef.current?.id;
      if (!msg || (msg as any).userId === myId) return;

      switch (msg.type) {
        case 'JOIN': {
          if (!msg.user || msg.user.id === myId) return;
          setCollaborators((prev) => {
            const exists = prev.some((c) => c.id === msg.user.id);
            if (exists) {
              return prev.map((c) => (c.id === msg.user.id ? { ...msg.user, lastActive: Date.now() } : c));
            }
            return [...prev, msg.user];
          });

          // If we are in the room, answer the joiner with our user info and circuit state
          if (channelRef.current && currentUserRef.current) {
            channelRef.current.postMessage({
              type: 'JOIN_ACK',
              user: currentUserRef.current,
              room: roomRef.current || undefined,
              circuit: {
                components: componentsRef.current,
                wires: wiresRef.current,
                customGates: customGatesRef.current,
                name: circuitNameRef.current,
              },
            });
          }
          break;
        }

        case 'JOIN_ACK': {
          if (!msg.user || msg.user.id === myId) return;
          setCollaborators((prev) => {
            const exists = prev.some((c) => c.id === msg.user.id);
            if (exists) {
              return prev.map((c) => (c.id === msg.user.id ? { ...msg.user, lastActive: Date.now() } : c));
            }
            return [...prev, msg.user];
          });

          if (msg.room) {
            setRoom((prev) => prev || msg.room || null);
          }

          if (msg.circuit && msg.circuit.components && msg.circuit.components.length > 0) {
            syncRemoteCircuitData(msg.circuit.components, msg.circuit.wires || [], msg.circuit.name);
          }
          break;
        }

        case 'CURSOR': {
          setCollaborators((prev) =>
            prev.map((c) =>
              c.id === msg.userId
                ? { ...c, cursor: { x: msg.x, y: msg.y }, lastActive: Date.now() }
                : c
            )
          );
          break;
        }

        case 'SELECTION': {
          setCollaborators((prev) =>
            prev.map((c) =>
              c.id === msg.userId
                ? {
                    ...c,
                    selectedComponentId: msg.componentId,
                    selectedWireId: msg.wireId,
                    lastActive: Date.now(),
                  }
                : c
            )
          );
          break;
        }

        case 'CIRCUIT_STATE': {
          syncRemoteCircuitData(msg.components, msg.wires, msg.name);
          break;
        }

        case 'COMPONENT_MOVED': {
          updateComponent(msg.compId, { x: msg.x, y: msg.y }, false);
          break;
        }

        case 'INPUT_TOGGLE': {
          toggleSwitch(msg.compId);
          break;
        }

        case 'UPDATE_ROOM_NAME': {
          setRoom((prev) => (prev ? { ...prev, name: msg.newName } : null));
          break;
        }

        case 'HEARTBEAT': {
          setCollaborators((prev) =>
            prev.map((c) => (c.id === msg.userId ? { ...c, lastActive: Date.now() } : c))
          );
          break;
        }

        case 'LEAVE': {
          setCollaborators((prev) => prev.filter((c) => c.id !== msg.userId));
          break;
        }
      }
    },
    [syncRemoteCircuitData, updateComponent, toggleSwitch]
  );

  const initChannel = useCallback(
    (code: string) => {
      if (channelRef.current) {
        try {
          channelRef.current.close();
        } catch {}
      }
      const channelName = `kitt_digilogic_room_${code.toUpperCase().trim()}`;
      const channel = new BroadcastChannel(channelName);
      channel.onmessage = (event) => {
        handleIncomingMessage(event.data);
      };
      channelRef.current = channel;

      const handleUnload = () => {
        if (channelRef.current && currentUserRef.current) {
          channelRef.current.postMessage({
            type: 'LEAVE',
            userId: currentUserRef.current.id,
          });
        }
      };
      window.addEventListener('beforeunload', handleUnload);
      return channel;
    },
    [handleIncomingMessage]
  );

  const createRoom = useCallback(
    async (serverName?: string, hostName?: string) => {
      try {
        setConnectionStatus('connecting');
        const code = generateRoomCode();
        const effectiveName = hostName?.trim() || userProfile?.displayName || generateTemporaryName();
        const effectiveServer = serverName?.trim() || 'Sovereign Logic Studio';

        const colorIndex = Math.floor(Math.random() * COLLAB_COLORS.length);
        const userColor = COLLAB_COLORS[colorIndex];

        const user: CollaboratorUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: effectiveName,
          initial: (effectiveName[0] || 'A').toUpperCase(),
          color: userColor,
          avatarBg: userColor,
          isHost: true,
          joinedAt: Date.now(),
          lastActive: Date.now(),
          cursor: null,
        };

        const newRoom: CollaborativeRoom = {
          roomId: code,
          name: effectiveServer,
          hostId: user.id,
          hostName: user.name,
          createdAt: Date.now(),
          lastUpdatedAt: Date.now(),
          lastModifiedBy: user.name,
          version: 1,
          circuit: {
            components: componentsRef.current,
            wires: wiresRef.current,
            customGates: customGatesRef.current,
            name: circuitNameRef.current,
          },
          users: { [user.id]: user },
        };

        initChannel(code);
        setRoomCode(code);
        setCurrentUser(user);
        setCollaborators([user]);
        setRoom(newRoom);
        setIsCollaborating(true);
        setConnectionStatus('connected');
        setErrorMessage(null);

        const recentItem: RecentServerItem = {
          roomCode: code,
          serverName: effectiveServer,
          isHost: true,
          lastJoinedAt: Date.now(),
        };
        saveRecentServer(recentItem);
        setRecentServers(getRecentServers());

        return { success: true, roomCode: code };
      } catch (err: any) {
        setConnectionStatus('error');
        setErrorMessage(err?.message || 'Failed to initialize collaboration session');
        return { success: false, error: err?.message || 'Initialization error' };
      }
    },
    [userProfile, initChannel]
  );

  const joinRoom = useCallback(
    async (code: string, userName: string) => {
      const cleanCode = code.toUpperCase().trim();
      if (!cleanCode) {
        return { success: false, error: 'Please enter a valid room code.' };
      }

      try {
        setConnectionStatus('connecting');
        const effectiveName = userName?.trim() || userProfile?.displayName || generateTemporaryName();
        const colorIndex = Math.floor(Math.random() * COLLAB_COLORS.length);
        const userColor = COLLAB_COLORS[colorIndex];

        const user: CollaboratorUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: effectiveName,
          initial: (effectiveName[0] || 'P').toUpperCase(),
          color: userColor,
          avatarBg: userColor,
          isHost: false,
          joinedAt: Date.now(),
          lastActive: Date.now(),
          cursor: null,
        };

        const channel = initChannel(cleanCode);
        setRoomCode(cleanCode);
        setCurrentUser(user);
        setCollaborators([user]);
        setIsCollaborating(true);
        setConnectionStatus('connected');
        setErrorMessage(null);

        // Announce presence to peers in room
        channel.postMessage({
          type: 'JOIN',
          user,
        });

        const recentItem: RecentServerItem = {
          roomCode: cleanCode,
          serverName: `Session ${cleanCode}`,
          isHost: false,
          lastJoinedAt: Date.now(),
        };
        saveRecentServer(recentItem);
        setRecentServers(getRecentServers());

        return { success: true };
      } catch (err: any) {
        setConnectionStatus('error');
        setErrorMessage(err?.message || 'Could not join room.');
        return { success: false, error: err?.message };
      }
    },
    [userProfile, initChannel]
  );

  const leaveRoom = useCallback(async () => {
    if (channelRef.current && currentUserRef.current) {
      try {
        channelRef.current.postMessage({
          type: 'LEAVE',
          userId: currentUserRef.current.id,
        });
        channelRef.current.close();
      } catch {}
      channelRef.current = null;
    }
    setIsCollaborating(false);
    setRoom(null);
    setRoomCode(null);
    setCurrentUser(null);
    setCollaborators([]);
    setConnectionStatus('disconnected');
    setErrorMessage(null);
  }, []);

  const updateServerName = useCallback(async (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    setRoom((prev) => (prev ? { ...prev, name: trimmed, lastUpdatedAt: Date.now() } : null));

    if (channelRef.current && currentUserRef.current) {
      channelRef.current.postMessage({
        type: 'UPDATE_ROOM_NAME',
        userId: currentUserRef.current.id,
        newName: trimmed,
      });
    }
    return true;
  }, []);

  const deleteRecentServer = useCallback((code: string) => {
    removeRecentServerFromStorage(code);
    setRecentServers(getRecentServers());
  }, []);

  const updateMyCursor = useCallback((x: number, y: number) => {
    if (!channelRef.current || !currentUserRef.current) return;
    const now = performance.now();
    if (now - lastCursorBroadcastRef.current > 30) {
      lastCursorBroadcastRef.current = now;
      channelRef.current.postMessage({
        type: 'CURSOR',
        userId: currentUserRef.current.id,
        x,
        y,
      });
    }
  }, []);

  const updateMySelection = useCallback((compId?: string | null, wireId?: string | null) => {
    if (!channelRef.current || !currentUserRef.current) return;
    channelRef.current.postMessage({
      type: 'SELECTION',
      userId: currentUserRef.current.id,
      componentId: compId,
      wireId: wireId,
    });
  }, []);

  const broadcastCircuitState = useCallback(
    (
      newComps: CircuitComponent[],
      newWires: Wire[],
      newCustomGates?: CustomGateDefinition[],
      name?: string
    ) => {
      if (!channelRef.current || !currentUserRef.current) return;
      channelRef.current.postMessage({
        type: 'CIRCUIT_STATE',
        userId: currentUserRef.current.id,
        components: newComps,
        wires: newWires,
        customGates: newCustomGates,
        name: name,
      });
    },
    []
  );

  const broadcastComponentMoved = useCallback((compId: string, x: number, y: number) => {
    if (!channelRef.current || !currentUserRef.current) return;
    channelRef.current.postMessage({
      type: 'COMPONENT_MOVED',
      userId: currentUserRef.current.id,
      compId,
      x,
      y,
    });
  }, []);

  const broadcastInputToggle = useCallback((compId: string, nextValue: number | boolean) => {
    if (!channelRef.current || !currentUserRef.current) return;
    channelRef.current.postMessage({
      type: 'INPUT_TOGGLE',
      userId: currentUserRef.current.id,
      compId,
      nextValue,
    });
  }, []);

  return (
    <CollaborationContext.Provider
      value={{
        isCollaborating,
        room,
        roomCode,
        currentUser,
        collaborators,
        activeComponentSelections,
        activeWireSelections,
        connectionStatus,
        errorMessage,
        recentServers,
        createRoom,
        joinRoom,
        leaveRoom,
        updateServerName,
        deleteRecentServer,
        updateMyCursor,
        updateMySelection,
        broadcastCircuitState,
        broadcastComponentMoved,
        broadcastInputToggle,
      }}
    >
      {children}
    </CollaborationContext.Provider>
  );
};

export const useCollaboration = (): CollaborationContextType => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
};
