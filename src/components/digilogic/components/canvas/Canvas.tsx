/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { useCollaboration } from '../../context/CollaborationContext';
import { CircuitComponent, Port, Wire } from '../../types/circuit';
import { ComponentRenderer } from './ComponentRenderer';
import { WireRenderer } from './WireRenderer';
import {
  computeAllWireJumpers,
  getClosestPointOnWire,
} from '../../engine/wireRouting';
import { THEME_PRESETS } from '../../theme/themes';
import {
  Grid,
  Info,
  Maximize2,
  Menu,
  Plus,
  Redo2,
  Sliders,
  Sparkles,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

export const Canvas: React.FC = () => {
  const {
    theme,
    colorMode,
    components,
    wires,
    customGates,
    circuitName,
    selection,
    camera,
    setCamera,
    simulationState,
    activeTool,
    wireDraft,
    wireRoutingMode,
    signalAnimation,
    snapToGrid,
    setSnapToGrid,
    gridSize,
    selectComponent,
    selectWire,
    selectAllWires,
    deleteSelectedWires,
    clearSelection,
    setBoxSelection,
    updateComponent,
    startWireDraft,
    updateWireDraft,
    completeWireDraft,
    cancelWireDraft,
    removeWire,
    deleteSelection,
    duplicateSelection,
    rotateSelection,
    flipSelection,
    toggleSwitch,
    pressButton,
    triggerPulse,
    undo,
    redo,
    canUndo,
    canRedo,
    recordHistorySnapshot,
    copy,
    paste,
    setComponentInputCount,
    fitToScreen,
    importJson,
    addComponent,
    sidebarOpen,
    toggleSidebar,
    inspectorOpen,
    setInspectorOpen,
    toggleInspector,
    setActiveModal,
  } = useCircuit();

  const {
    isCollaborating,
    collaborators,
    updateMyCursor,
    broadcastCircuitState,
    broadcastComponentMoved,
    activeComponentSelections,
    activeWireSelections,
  } = useCollaboration();

  const activeTheme = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;
  const isLight = colorMode === 'light';

  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction State (Mouse & Touch)
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const panOriginRef = useRef<{ x: number; y: number; didMove: boolean }>({ x: 0, y: 0, didMove: false });
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragInitialPositions, setDragInitialPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const preDragSnapshotRef = useRef<{ components: CircuitComponent[]; wires: Wire[] } | null>(null);

  // Multi-Touch & Pinch-to-Zoom State for Tablets
  const touchStateRef = useRef<{
    initialDistance: number;
    initialCenter: { x: number; y: number };
    initialCamera: { x: number; y: number; zoom: number };
    lastTouchPos: { x: number; y: number };
    startPos: { x: number; y: number };
    hasMoved: boolean;
    isPinching: boolean;
    wireDraftStartedThisTouch: boolean;
  }>({
    initialDistance: 0,
    initialCenter: { x: 0, y: 0 },
    initialCamera: { x: 0, y: 0, zoom: 1 },
    lastTouchPos: { x: 0, y: 0 },
    startPos: { x: 0, y: 0 },
    hasMoved: false,
    isPinching: false,
    wireDraftStartedThisTouch: false,
  });

  // Box Marquee Selection
  const [isBoxSelecting, setIsBoxSelecting] = useState(false);
  const [boxStart, setBoxStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Context menu for variable inputs
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    componentId: string;
  } | null>(null);

  // Memoized Jumpers for Orthogonal Wire Crossings (renders textbook bridges at wire intersections)
  const wireJumpers = useMemo(() => {
    if (wireRoutingMode !== 'orthogonal') return {};
    return computeAllWireJumpers(wires, components);
  }, [wires, components, wireRoutingMode]);

  // Coordinate conversion helpers
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (screenX - rect.left - camera.x) / camera.zoom;
      const y = (screenY - rect.top - camera.y) / camera.zoom;
      return { x, y };
    },
    [camera]
  );

  // 1. Mouse Wheel Zoom (centered around pointer)
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.min(2.5, Math.max(0.3, camera.zoom * zoomFactor));

    const newX = mouseX - (mouseX - camera.x) * (newZoom / camera.zoom);
    const newY = mouseY - (mouseY - camera.y) * (newZoom / camera.zoom);

    setCamera({ x: newX, y: newY, zoom: newZoom });
  };

  // 2. Global Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copy();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        paste();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelection();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setBoxSelection(
          components.map((c) => c.id),
          wires.map((w) => w.id)
        );
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelection();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        rotateSelection();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        flipSelection();
      } else if (e.key === 'Escape') {
        cancelWireDraft();
        clearSelection();
        setContextMenu(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo,
    redo,
    copy,
    paste,
    duplicateSelection,
    deleteSelection,
    rotateSelection,
    flipSelection,
    cancelWireDraft,
    clearSelection,
    components,
    wires,
    setBoxSelection,
  ]);

  // 3. Mouse Interaction Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (contextMenu) setContextMenu(null);

    // Right Click -> Cancel/unlock wire drafting immediately
    if (e.button === 2) {
      if (wireDraft) {
        e.preventDefault();
        e.stopPropagation();
        cancelWireDraft();
        return;
      }
    }

    // Shift + Left Click on canvas background: start Box Marquee Selection
    if (e.button === 0 && e.shiftKey) {
      if (wireDraft) {
        cancelWireDraft();
        return;
      }
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setIsBoxSelecting(true);
      setBoxStart(canvasPos);
      setBoxCurrent(canvasPos);
      return;
    }

    // Left Click on canvas background (e.button === 0) or Middle Click (e.button === 1) or Pan tool:
    // Drag / move the dot screen by holding the mouse button
    if (e.button === 1 || activeTool === 'pan' || (e.button === 0 && !e.shiftKey)) {
      if (wireDraft) {
        cancelWireDraft();
        return;
      }
      setIsPanning(true);
      panOriginRef.current = { x: e.clientX, y: e.clientY, didMove: false };
      setPanStart({ x: e.clientX - camera.x, y: e.clientY - camera.y });
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dist = Math.hypot(e.clientX - panOriginRef.current.x, e.clientY - panOriginRef.current.y);
      if (dist > 3) {
        panOriginRef.current.didMove = true;
      }
      setCamera((prev) => ({
        ...prev,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      }));
      return;
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    // Broadcast live cursor to other collaborators in real-time
    if (isCollaborating) {
      updateMyCursor(canvasPos.x, canvasPos.y);
    }

    if (wireDraft) {
      updateWireDraft(canvasPos.x, canvasPos.y);
      return;
    }

    if (isBoxSelecting) {
      setBoxCurrent(canvasPos);
      return;
    }

    if (draggingCompId) {
      const deltaX = canvasPos.x - dragOffset.x;
      const deltaY = canvasPos.y - dragOffset.y;

      dragInitialPositions.forEach((initPos, id) => {
        let newX = initPos.x + deltaX;
        let newY = initPos.y + deltaY;

        if (snapToGrid) {
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }

        updateComponent(id, { x: newX, y: newY });
        if (isCollaborating) {
          broadcastComponentMoved(id, newX, newY);
        }
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      // If the user clicked the canvas background without moving/dragging, deselect
      if (!panOriginRef.current.didMove) {
        clearSelection();
      }
    }

    if (wireDraft) {
      // Check if user was dragging wire (distance > 8px from startPos)
      const dx = wireDraft.currentX - wireDraft.startPos.x;
      const dy = wireDraft.currentY - wireDraft.startPos.y;
      if (Math.hypot(dx, dy) > 8) {
        // Find nearest port on another component within 30px
        let targetConnection: { compId: string; portId: string } | null = null;
        let minDistance = 30;

        components.forEach((comp) => {
          if (comp.id === wireDraft.fromCompId) return;
          comp.ports.forEach((p) => {
            // Strictly target INPUT ports only for one-way connection
            if (p.type !== 'input') return;
            const portWorldX = comp.x + p.relativePosition.x;
            const portWorldY = comp.y + p.relativePosition.y;
            const dist = Math.hypot(wireDraft.currentX - portWorldX, wireDraft.currentY - portWorldY);
            if (dist < minDistance) {
              minDistance = dist;
              targetConnection = { compId: comp.id, portId: p.id };
            }
          });
        });

        if (targetConnection) {
          completeWireDraft(targetConnection.compId, targetConnection.portId);
        }
      }
    }

    if (draggingCompId) {
      let hasMoved = false;
      dragInitialPositions.forEach((initPos, id) => {
        const curComp = components.find((c) => c.id === id);
        if (curComp && (curComp.x !== initPos.x || curComp.y !== initPos.y)) {
          hasMoved = true;
        }
      });

      if (hasMoved && preDragSnapshotRef.current) {
        recordHistorySnapshot(
          preDragSnapshotRef.current.components,
          preDragSnapshotRef.current.wires
        );
        if (isCollaborating) {
          broadcastCircuitState(components, wires, customGates, circuitName);
        }
      }

      setDraggingCompId(null);
      setDragInitialPositions(new Map());
      preDragSnapshotRef.current = null;
    }

    if (isBoxSelecting) {
      setIsBoxSelecting(false);
      const minX = Math.min(boxStart.x, boxCurrent.x);
      const maxX = Math.max(boxStart.x, boxCurrent.x);
      const minY = Math.min(boxStart.y, boxCurrent.y);
      const maxY = Math.max(boxStart.y, boxCurrent.y);

      if (maxX - minX > 5 || maxY - minY > 5) {
        const selectedCompIds = components
          .filter((c) => c.x + 40 >= minX && c.x <= maxX && c.y + 40 >= minY && c.y <= maxY)
          .map((c) => c.id);

        const selectedWireIds = wires
          .filter((w) => selectedCompIds.includes(w.fromComponentId) && selectedCompIds.includes(w.toComponentId))
          .map((w) => w.id);

        setBoxSelection(selectedCompIds, selectedWireIds);
      }
    }
  };

  // Component Drag Start (Mouse)
  const handleComponentMouseDown = (e: React.MouseEvent, comp: CircuitComponent) => {
    e.stopPropagation();
    if (comp.locked) return;

    preDragSnapshotRef.current = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    };

    const isAlreadySelected = selection.componentIds.includes(comp.id);
    if (!isAlreadySelected) {
      selectComponent(comp.id, e.shiftKey);
    }

    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    setDraggingCompId(comp.id);
    setDragOffset(canvasPos);

    const activeSelectedIds = isAlreadySelected
      ? selection.componentIds
      : e.shiftKey
      ? [...selection.componentIds, comp.id]
      : [comp.id];

    const initMap = new Map<string, { x: number; y: number }>();
    activeSelectedIds.forEach((id) => {
      const c = components.find((item) => item.id === id);
      if (c) initMap.set(id, { x: c.x, y: c.y });
    });
    setDragInitialPositions(initMap);
  };

  // Port Wire Connection (Mouse Click & Drag) - Strictly One-Way: Output -> Input
  const handlePortMouseDown = (e: React.MouseEvent, comp: CircuitComponent, port: Port) => {
    e.stopPropagation();

    if (wireDraft) {
      // Releasing / clicking on an INPUT port completes the wire draft
      if (port.type === 'input' && wireDraft.fromCompId !== comp.id) {
        completeWireDraft(comp.id, port.id);
      } else {
        cancelWireDraft();
      }
      return;
    }

    // STRICT ONE-WAY: Wiring can ONLY initiate from OUTPUT ports!
    if (port.type === 'output') {
      const startX = comp.x + port.relativePosition.x;
      const startY = comp.y + port.relativePosition.y;
      startWireDraft(comp.id, port.id, { x: startX, y: startY });
    }
  };

  const handlePortMouseUp = (e: React.MouseEvent, comp: CircuitComponent, port: Port) => {
    e.stopPropagation();
    // Complete wire draft strictly on INPUT ports
    if (wireDraft && port.type === 'input' && wireDraft.fromCompId !== comp.id) {
      completeWireDraft(comp.id, port.id);
    }
  };

  // =========================================================================
  // 4. TOUCH-SPECIFIC INTERACTION LAYER (Tablets, iPad, Mobile)
  // =========================================================================

  const handleTouchStart = (e: React.TouchEvent) => {
    if (contextMenu) setContextMenu(null);

    // Two-Finger Gesture: Pinch-to-Zoom and Multi-Touch Pan
    if (e.touches.length === 2) {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const center = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };

      touchStateRef.current = {
        initialDistance: dist,
        initialCenter: center,
        initialCamera: { ...camera },
        lastTouchPos: center,
        startPos: center,
        hasMoved: false,
        isPinching: true,
        wireDraftStartedThisTouch: false,
      };

      // Cancel any ongoing 1-finger component drag
      if (draggingCompId) {
        setDraggingCompId(null);
      }
      return;
    }

    // One-Finger Background Touch: Start Canvas Pan
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStateRef.current.lastTouchPos = { x: touch.clientX, y: touch.clientY };
      touchStateRef.current.startPos = { x: touch.clientX, y: touch.clientY };
      touchStateRef.current.hasMoved = false;
      touchStateRef.current.wireDraftStartedThisTouch = false;
      touchStateRef.current.isPinching = false;

      // Start background pan if not touching a component/port
      if (!draggingCompId && !wireDraft) {
        setIsPanning(true);
        setPanStart({ x: touch.clientX - camera.x, y: touch.clientY - camera.y });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 1. Two-Finger Pinch-to-Zoom + Pan
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      e.preventDefault();
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      const currentCenter = {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };

      const { initialDistance, initialCenter, initialCamera } = touchStateRef.current;
      if (initialDistance > 0 && containerRef.current) {
        const scaleFactor = currentDist / initialDistance;
        const newZoom = Math.min(2.5, Math.max(0.3, initialCamera.zoom * scaleFactor));

        const rect = containerRef.current.getBoundingClientRect();
        const midX = initialCenter.x - rect.left;
        const midY = initialCenter.y - rect.top;

        // Position in world canvas space at initial pinch center
        const worldX = (midX - initialCamera.x) / initialCamera.zoom;
        const worldY = (midY - initialCamera.y) / initialCamera.zoom;

        // Apply new zoom and pan delta
        const panDeltaX = currentCenter.x - initialCenter.x;
        const panDeltaY = currentCenter.y - initialCenter.y;

        const newX = midX - worldX * newZoom + panDeltaX;
        const newY = midY - worldY * newZoom + panDeltaY;

        setCamera({ x: newX, y: newY, zoom: newZoom });
      }
      return;
    }

    // 2. One-Finger Touch Interactions
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const dist = Math.hypot(
        touch.clientX - touchStateRef.current.startPos.x,
        touch.clientY - touchStateRef.current.startPos.y
      );
      if (dist > 8) {
        touchStateRef.current.hasMoved = true;
      }
      touchStateRef.current.lastTouchPos = { x: touch.clientX, y: touch.clientY };
      const canvasPos = screenToCanvas(touch.clientX, touch.clientY);

      // A. Wire Drafting
      if (wireDraft) {
        e.preventDefault();
        updateWireDraft(canvasPos.x, canvasPos.y);
        return;
      }

      // B. Component Touch Dragging
      if (draggingCompId) {
        e.preventDefault();
        const deltaX = canvasPos.x - dragOffset.x;
        const deltaY = canvasPos.y - dragOffset.y;

        dragInitialPositions.forEach((initPos, id) => {
          let newX = initPos.x + deltaX;
          let newY = initPos.y + deltaY;

          if (snapToGrid) {
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
          }

          updateComponent(id, { x: newX, y: newY });
        });
        return;
      }

      // C. Background Canvas Panning
      if (isPanning) {
        setCamera((prev) => ({
          ...prev,
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        }));
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If pinch ends
    if (touchStateRef.current.isPinching && e.touches.length < 2) {
      touchStateRef.current.isPinching = false;
    }

    if (isPanning) {
      setIsPanning(false);
    }

    // Wire Draft Completion via Touch Release (Detect input port under finger)
    if (wireDraft) {
      if (touchStateRef.current.hasMoved) {
        const lastTouch = touchStateRef.current.lastTouchPos;
        const canvasReleasePos = screenToCanvas(lastTouch.x, lastTouch.y);

        // Find nearest port within generous touch tolerance threshold (45px)
        let targetConnection: { compId: string; portId: string } | null = null;
        let minDistance = 45;

        components.forEach((comp) => {
          if (comp.id === wireDraft.fromCompId) return; // Prevent self-loop
          comp.ports.forEach((port) => {
            // Strictly target INPUT ports only for one-way connection
            if (port.type !== 'input') return;
            const portWorldX = comp.x + port.relativePosition.x;
            const portWorldY = comp.y + port.relativePosition.y;
            const dist = Math.hypot(canvasReleasePos.x - portWorldX, canvasReleasePos.y - portWorldY);
            if (dist < minDistance) {
              minDistance = dist;
              targetConnection = { compId: comp.id, portId: port.id };
            }
          });
        });

        if (targetConnection) {
          completeWireDraft(targetConnection.compId, targetConnection.portId);
        } else {
          cancelWireDraft();
        }
      } else {
        // Tapped without moving. If this touch just started the draft, don't cancel it!
        // This enables 2-tap wiring (tap output, then tap input).
        if (touchStateRef.current.wireDraftStartedThisTouch) {
          touchStateRef.current.wireDraftStartedThisTouch = false;
        } else {
          cancelWireDraft();
        }
      }
    }

    // Component Drag Finish via Touch
    if (draggingCompId) {
      let hasMoved = false;
      dragInitialPositions.forEach((initPos, id) => {
        const curComp = components.find((c) => c.id === id);
        if (curComp && (curComp.x !== initPos.x || curComp.y !== initPos.y)) {
          hasMoved = true;
        }
      });

      if (hasMoved && preDragSnapshotRef.current) {
        recordHistorySnapshot(
          preDragSnapshotRef.current.components,
          preDragSnapshotRef.current.wires
        );
        if (isCollaborating) {
          broadcastCircuitState(components, wires, customGates, circuitName);
        }
      }

      setDraggingCompId(null);
      setDragInitialPositions(new Map());
      preDragSnapshotRef.current = null;
    }
  };

  // Component Drag Start via Touch
  const handleComponentTouchStart = (e: React.TouchEvent, comp: CircuitComponent) => {
    e.stopPropagation();
    if (comp.locked || e.touches.length > 1) return;

    preDragSnapshotRef.current = {
      components: JSON.parse(JSON.stringify(components)),
      wires: JSON.parse(JSON.stringify(wires)),
    };

    const isAlreadySelected = selection.componentIds.includes(comp.id);
    if (!isAlreadySelected) {
      selectComponent(comp.id, false);
    }

    const touch = e.touches[0];
    const canvasPos = screenToCanvas(touch.clientX, touch.clientY);
    
    touchStateRef.current.lastTouchPos = { x: touch.clientX, y: touch.clientY };
    touchStateRef.current.startPos = { x: touch.clientX, y: touch.clientY };
    touchStateRef.current.hasMoved = false;

    setDraggingCompId(comp.id);
    setDragOffset(canvasPos);

    const activeSelectedIds = isAlreadySelected ? selection.componentIds : [comp.id];
    const initMap = new Map<string, { x: number; y: number }>();
    activeSelectedIds.forEach((id) => {
      const c = components.find((item) => item.id === id);
      if (c) initMap.set(id, { x: c.x, y: c.y });
    });
    setDragInitialPositions(initMap);
  };

  // Port Wire Draft Start via Touch
  const handlePortTouchStart = (e: React.TouchEvent, comp: CircuitComponent, port: Port) => {
    e.stopPropagation();
    if (e.touches.length > 1) return;

    const touch = e.touches[0];
    touchStateRef.current.lastTouchPos = { x: touch.clientX, y: touch.clientY };
    touchStateRef.current.startPos = { x: touch.clientX, y: touch.clientY };
    touchStateRef.current.hasMoved = false;

    if (wireDraft) {
      if (port.type === 'input') {
        completeWireDraft(comp.id, port.id);
      } else {
        cancelWireDraft();
      }
      return;
    }

    if (port.type === 'output') {
      const startX = comp.x + port.relativePosition.x;
      const startY = comp.y + port.relativePosition.y;
      startWireDraft(comp.id, port.id, { x: startX, y: startY });
      touchStateRef.current.wireDraftStartedThisTouch = true;
    }
  };

  // Context Menu Handler
  const handleContextMenu = (e: React.MouseEvent, compId?: string) => {
    e.preventDefault();
    if (wireDraft) {
      cancelWireDraft();
      return;
    }
    if (compId) {
      setContextMenu({ x: e.clientX, y: e.clientY, componentId: compId });
    }
  };

  // Quick Zoom Helper
  const handleZoom = (direction: 'in' | 'out' | 'reset') => {
    if (direction === 'reset') {
      fitToScreen();
      return;
    }
    const factor = direction === 'in' ? 1.25 : 0.8;
    const newZoom = Math.min(2.5, Math.max(0.3, camera.zoom * factor));
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const newX = centerX - (centerX - camera.x) * (newZoom / camera.zoom);
      const newY = centerY - (centerY - camera.y) * (newZoom / camera.zoom);
      setCamera({ x: newX, y: newY, zoom: newZoom });
    }
  };

  // Drag and Drop (File Import or Component Drop from Library)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();

    // 1. Check if a component was dragged from Sidebar
    const compDataStr = e.dataTransfer.getData('digilogic/component');
    if (compDataStr) {
      try {
        const item = JSON.parse(compDataStr);
        const canvasPos = screenToCanvas(e.clientX, e.clientY);
        let dropX = canvasPos.x - 35;
        let dropY = canvasPos.y - 25;
        if (snapToGrid) {
          dropX = Math.round(dropX / gridSize) * gridSize;
          dropY = Math.round(dropY / gridSize) * gridSize;
        }
        addComponent(item.type, dropX, dropY, {
          inputCount: item.inputCount,
          customGateId: item.customGateId,
          name: item.name,
        });
        return;
      } catch (err) {
        console.error('Failed to parse dropped component', err);
      }
    }

    // 2. Check for circuit JSON files
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.json') || file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            importJson(text);
          }
        };
        reader.readAsText(file);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="circuit-canvas-container"
      style={{ backgroundColor: activeTheme.canvasBg }}
      className={`relative w-full h-full overflow-hidden select-none touch-none transition-colors duration-300 ${
        isPanning ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isPanning) setIsPanning(false);
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => handleContextMenu(e)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={handleDrop}
    >
      {/* Background SVG Grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <pattern
            id="grid-dots"
            width={gridSize * camera.zoom}
            height={gridSize * camera.zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${camera.x % (gridSize * camera.zoom)}, ${
              camera.y % (gridSize * camera.zoom)
            })`}
          >
            <circle cx={1.5} cy={1.5} r={1.2} fill={activeTheme.gridDotColor} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-dots)" />
      </svg>

      {/* Main World Space SVG */}
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <g transform={`translate(${camera.x}, ${camera.y}) scale(${camera.zoom})`}>
          {/* 1. Render All Connected Circuit Wires */}
          {Array.isArray(wires) && wires.filter(Boolean).map((wire) => {
            if (!wire || !wire.id) return null;
            const fromComp = Array.isArray(components) ? components.find((c) => c && c.id === wire.fromComponentId) : undefined;
            const toComp = Array.isArray(components) ? components.find((c) => c && c.id === wire.toComponentId) : undefined;
            if (!fromComp || !toComp) return null;

            const wireVal = simulationState?.wireValues?.[wire.id] ?? 0;
            const isSelected = Array.isArray(selection?.wireIds) && selection.wireIds.includes(wire.id);

            const hasBranches = wires.filter(
              (w) => w && w.fromComponentId === wire.fromComponentId && w.fromPortId === wire.fromPortId
            ).length > 1;

            return (
              <WireRenderer
                key={wire.id}
                wire={wire}
                fromComponent={fromComp}
                toComponent={toComp}
                state={wireVal}
                isSelected={isSelected}
                routingMode={wireRoutingMode}
                signalAnimation={signalAnimation}
                theme={theme}
                colorMode={colorMode}
                selectingUsers={activeWireSelections[wire.id] || []}
                isDraftingWire={Boolean(wireDraft)}
                hasBranches={hasBranches}
                wireJumpers={wireJumpers[wire.id]}
                allWires={wires}
                allComponents={components}
                onSelect={(e) => {
                  e.stopPropagation();
                  selectWire(wire.id, e.shiftKey);
                }}
                onDelete={() => removeWire(wire.id)}
                onBranchWire={(pos) => {
                  const branchPos = getClosestPointOnWire(wire, components, wires, pos, gridSize, snapToGrid);
                  startWireDraft(wire.fromComponentId, wire.fromPortId, branchPos, {
                    branchStartPos: branchPos,
                    branchFromWireId: wire.id,
                  });
                }}
                onStartWireBranch={(e, pos) => {
                  e.stopPropagation();
                  let rawPos = pos;
                  if ('clientX' in e && (e as React.MouseEvent).clientX !== undefined) {
                    rawPos = screenToCanvas((e as React.MouseEvent).clientX, (e as React.MouseEvent).clientY);
                  } else if ('touches' in e && (e as React.TouchEvent).touches && (e as React.TouchEvent).touches.length > 0) {
                    rawPos = screenToCanvas(
                      (e as React.TouchEvent).touches[0].clientX,
                      (e as React.TouchEvent).touches[0].clientY
                    );
                  }
                  const branchPos = getClosestPointOnWire(wire, components, wires, rawPos, gridSize, snapToGrid);
                  startWireDraft(wire.fromComponentId, wire.fromPortId, branchPos, {
                    branchStartPos: branchPos,
                    branchFromWireId: wire.id,
                  });
                }}
              />
            );
          })}

          {/* 2. Active Wire Drafting Line & Tap Junction */}
          {wireDraft && wireDraft.startPos && (
            <g className="pointer-events-none">
              <path
                d={
                  wireRoutingMode === 'straight'
                    ? `M ${wireDraft.startPos.x} ${wireDraft.startPos.y} L ${wireDraft.currentX} ${wireDraft.currentY}`
                    : `M ${wireDraft.startPos.x} ${wireDraft.startPos.y} L ${(wireDraft.startPos.x + wireDraft.currentX) / 2} ${wireDraft.startPos.y} L ${(wireDraft.startPos.x + wireDraft.currentX) / 2} ${wireDraft.currentY} L ${wireDraft.currentX} ${wireDraft.currentY}`
                }
                fill="none"
                stroke={activeTheme.primaryColor || '#A58D66'}
                strokeWidth={3}
                strokeDasharray="4, 4"
                className="pointer-events-none"
              />
              {/* Active Slanting Line Marker at Branch Origin */}
              {wireDraft.branchStartPos && (
                <line
                  x1={wireDraft.branchStartPos.x - 4.5}
                  y1={wireDraft.branchStartPos.y + 4.5}
                  x2={wireDraft.branchStartPos.x + 4.5}
                  y2={wireDraft.branchStartPos.y - 4.5}
                  stroke={activeTheme.primaryColor || '#A58D66'}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              )}
            </g>
          )}

          {/* 3. Render All Circuit Components */}
          {Array.isArray(components) && components.filter(Boolean).map((comp) => {
            if (!comp || !comp.id) return null;
            const isSelected = Array.isArray(selection?.componentIds) && selection.componentIds.includes(comp.id);
            const portVals = simulationState?.portValues?.[comp.id] || {};

            return (
              <g key={comp.id} onContextMenu={(e) => handleContextMenu(e, comp.id)}>
                <ComponentRenderer
                  component={comp}
                  portValues={portVals}
                  isSelected={isSelected}
                  theme={theme}
                  colorMode={colorMode}
                  wireDraftFromCompId={wireDraft?.fromCompId ?? null}
                  selectingUsers={activeComponentSelections[comp.id] || []}
                  onMouseDown={(e) => handleComponentMouseDown(e, comp)}
                  onTouchStart={(e) => handleComponentTouchStart(e, comp)}
                  onPortMouseDown={(e, port) => handlePortMouseDown(e, comp, port)}
                  onPortMouseUp={(e, port) => handlePortMouseUp(e, comp, port)}
                  onPortTouchStart={(e, port) => handlePortTouchStart(e, comp, port)}
                  onToggleSwitch={() => toggleSwitch(comp.id)}
                  onPressButton={(pressed) => pressButton(comp.id, pressed)}
                  onTriggerPulse={() => triggerPulse(comp.id)}
                />
              </g>
            );
          })}

          {/* 4. Box Marquee Selection Rectangle */}
          {isBoxSelecting && (
            <rect
              x={Math.min(boxStart.x, boxCurrent.x)}
              y={Math.min(boxStart.y, boxCurrent.y)}
              width={Math.abs(boxCurrent.x - boxStart.x)}
              height={Math.abs(boxCurrent.y - boxStart.y)}
              fill="rgba(165, 141, 102, 0.15)"
              stroke={activeTheme.primaryColor || '#A58D66'}
              strokeWidth={1.5}
              strokeDasharray="4, 4"
              className="pointer-events-none"
            />
          )}

          {/* 5. Live Remote Collaborator Cursors & Labels */}
          {isCollaborating &&
            collaborators.map((user) => {
              if (!user.cursor) return null;
              return (
                <g
                  key={user.id}
                  transform={`translate(${user.cursor.x}, ${user.cursor.y})`}
                  className="pointer-events-none select-none transition-transform duration-75 ease-out"
                >
                  {/* Modern Sleek Pointer Arrow */}
                  <path
                    d="M 0 0 L 0 17 L 4.5 13 L 8.5 20.5 L 11.5 19 L 7.5 11.5 L 13.5 11.5 Z"
                    fill={user.color}
                    stroke="#090d16"
                    strokeWidth={1.6}
                    className="shadow-xl"
                  />
                  {/* Collaborator Badge Tag */}
                  <g transform="translate(14, 12)">
                    <rect
                      x={0}
                      y={-10}
                      width={Math.max(45, user.name.length * 6.8 + 24)}
                      height={20}
                      rx={5}
                      fill={isLight ? '#ffffff' : '#090d16'}
                      stroke={user.color}
                      strokeWidth={1.5}
                      className="shadow-lg"
                    />
                    {/* User Initial Circle Badge */}
                    <circle cx={10} cy={0} r={6.5} fill={user.color} />
                    <text
                      x={10}
                      y={0}
                      dominantBaseline="central"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={8}
                      fontWeight="900"
                      fontFamily="sans-serif"
                    >
                      {user.initial || user.name.charAt(0).toUpperCase()}
                    </text>
                    {/* Full Name */}
                    <text
                      x={21}
                      y={0}
                      dominantBaseline="central"
                      fill={isLight ? '#080f14' : '#E5E1DD'}
                      fontSize={9.5}
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {user.name}
                    </text>
                  </g>
                </g>
              );
            })}
        </g>
      </svg>

      {/* Touch-Friendly Floating Canvas Ergonomics Toolbar (Bottom Center / Left on Tablets & Desktop, Hidden on mobile phones) */}
      <div
        className={`hidden md:flex absolute bottom-4 left-4 z-20 items-center gap-1.5 backdrop-blur-md border p-1.5 rounded-xl shadow-2xl transition-colors ${
          isLight
            ? 'bg-white/95 border-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
            : 'bg-[#0d171f]/95 border-[#A58D66]/25'
        }`}
      >
        {/* Toggle Library Drawer Button on Mobile/Tablet */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#A58D66]/15 hover:bg-[#A58D66]/25 text-[#DFCCA8] border border-[#A58D66]/40 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Open Component Library"
          >
            <Plus className="w-4 h-4 text-[#A58D66]" />
            <span className="hidden sm:inline">Add Gate</span>
          </button>
        )}

        <div
          className={`flex items-center rounded-lg p-0.5 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <button
            onClick={() => handleZoom('in')}
            className={`p-2 rounded-md transition-colors ${
              isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]'
            }`}
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span
            className={`text-[11px] font-mono px-1.5 font-bold min-w-10 text-center ${
              isLight ? 'text-slate-700' : 'text-[#E5E1DD]/80'
            }`}
          >
            {Math.round(camera.zoom * 100)}%
          </span>
          <button
            onClick={() => handleZoom('out')}
            className={`p-2 rounded-md transition-colors ${
              isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]'
            }`}
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('reset')}
            className={`p-2 rounded-md transition-colors ${
              isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]'
            }`}
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Snap to Grid Toggle */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-2 rounded-lg border transition-colors ${
            snapToGrid
              ? 'bg-[#A58D66]/20 border-[#A58D66]/50 text-[#DFCCA8]'
              : isLight
              ? 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]/70 hover:text-[#E5E1DD]'
          }`}
          title="Toggle Grid Snapping"
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Undo / Redo Touch Buttons */}
        <div
          className={`flex items-center rounded-lg p-0.5 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-2 disabled:opacity-30 rounded-md transition-colors ${
              isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]'
            }`}
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-2 disabled:opacity-30 rounded-md transition-colors ${
              isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]'
            }`}
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Toggle Inspector Drawer Button on Mobile/Tablet */}
        {!inspectorOpen && (
          <button
            onClick={toggleInspector}
            className={`p-2 border rounded-lg transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
                : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/25 text-[#DFCCA8] hover:text-[#E5E1DD]'
            }`}
            title="Open Inspector Properties"
          >
            <Sliders className="w-4 h-4" />
          </button>
        )}

        {/* Minimal Bottom-Right About Button: Symbol 'i' and 'About' */}
        <button
          onClick={() => setActiveModal('about')}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors ${
            isLight
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
              : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/25 text-[#DFCCA8] hover:text-[#E5E1DD]'
          }`}
          title="About DigiLogic Lab"
        >
          <Info className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-[#A58D66]'}`} />
          <span>About</span>
        </button>
      </div>

      {/* Context Menu for Variable Inputs */}
      {contextMenu && (
        <div
          className={`fixed z-50 rounded-lg shadow-xl p-1 text-sm border ${
            isLight
              ? 'bg-white border-slate-200 text-slate-800 shadow-[0_10px_25px_rgba(0,0,0,0.15)]'
              : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
          }`}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`px-3 py-1.5 text-xs font-semibold border-b ${
              isLight ? 'text-slate-500 border-slate-200' : 'text-[#DFCCA8] border-[#A58D66]/20'
            }`}
          >
            Configure Gate
          </div>
          <div className="py-1">
            {[2, 3, 4, 8].map((num) => (
              <button
                key={num}
                onClick={() => {
                  setComponentInputCount(contextMenu.componentId, num);
                  setContextMenu(null);
                }}
                className={`w-full text-left px-3 py-1.5 rounded transition-colors flex items-center justify-between ${
                  isLight
                    ? 'hover:bg-slate-100 hover:text-slate-900 text-slate-700'
                    : 'hover:bg-[#A58D66]/20 hover:text-[#DFCCA8] text-[#E5E1DD]'
                }`}
              >
                <span>{num} Inputs</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
