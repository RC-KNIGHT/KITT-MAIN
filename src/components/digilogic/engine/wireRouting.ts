/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, Port, Wire, WirePoint } from '../types/circuit';

export interface WireSegment {
  id: string;
  wireId: string;
  segIndex: number;
  type: 'H' | 'V';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fixedCoord: number; // y for H, x for V
  minCoord: number;
  maxCoord: number;
}

export interface WireJumperCrossings {
  [wireId: string]: {
    [segIndex: number]: number[]; // Crossing coordinates along that segment
  };
}

/**
 * Calculates absolute canvas coordinates of a component's port.
 */
export function getPortCanvasPos(
  comp: CircuitComponent,
  port?: Port | { relativePosition?: { x: number; y: number }; type?: string }
): { x: number; y: number } {
  if (!comp) return { x: 0, y: 0 };
  const rx = port?.relativePosition?.x ?? (port?.type === 'output' ? 90 : 0);
  const ry = port?.relativePosition?.y ?? 25;
  const cx = comp.x + (comp.flipped ? -rx : rx);
  const cy = comp.y + ry;
  return { x: isNaN(cx) ? 0 : cx, y: isNaN(cy) ? 0 : cy };
}

/**
 * Resolves the true start position of a wire, accounting for branch points
 * and dynamically keeping branches attached to parent trunk wires.
 */
export function getEffectiveWireStartPos(
  wire: Wire,
  components: CircuitComponent[],
  allWires: Wire[] = []
): { x: number; y: number } {
  const fromComp = components.find((c) => c.id === wire.fromComponentId);
  const fromPort = fromComp?.ports.find((p) => p.id === wire.fromPortId);
  const rootPortPos = fromComp ? getPortCanvasPos(fromComp, fromPort) : { x: 0, y: 0 };

  if (!wire.branchStartPos) {
    return rootPortPos;
  }

  // If this wire branched from another wire, project its start point onto the parent wire
  if (wire.branchFromWireId) {
    const parentWire = allWires.find((w) => w.id === wire.branchFromWireId);
    if (parentWire && parentWire.id !== wire.id) {
      const parentStart = getEffectiveWireStartPos(parentWire, components, allWires);
      const parentToComp = components.find((c) => c.id === parentWire.toComponentId);
      const parentToPort = parentToComp?.ports.find((p) => p.id === parentWire.toPortId);
      const parentEnd = parentToComp ? getPortCanvasPos(parentToComp, parentToPort) : parentStart;

      const parentSegments = getOrthogonalSegments(parentWire.id, parentStart, parentEnd);
      if (parentSegments.length > 0) {
        return projectPointOntoSegments(wire.branchStartPos, parentSegments);
      }
    }
  }

  return wire.branchStartPos;
}

/**
 * Computes orthogonal line segments for a wire between start and end.
 */
export function getOrthogonalSegments(
  wireId: string,
  start: { x: number; y: number },
  end: { x: number; y: number }
): WireSegment[] {
  const segments: WireSegment[] = [];

  if (end.x > start.x + 20) {
    // Standard Manhattan routing: 3 segments (H -> V -> H)
    const midX = Math.round((start.x + end.x) / 2);

    // Seg 0: Horizontal from start.x to midX at start.y
    segments.push({
      id: `${wireId}_0`,
      wireId,
      segIndex: 0,
      type: 'H',
      x1: start.x,
      y1: start.y,
      x2: midX,
      y2: start.y,
      fixedCoord: start.y,
      minCoord: Math.min(start.x, midX),
      maxCoord: Math.max(start.x, midX),
    });

    // Seg 1: Vertical from start.y to end.y at midX
    segments.push({
      id: `${wireId}_1`,
      wireId,
      segIndex: 1,
      type: 'V',
      x1: midX,
      y1: start.y,
      x2: midX,
      y2: end.y,
      fixedCoord: midX,
      minCoord: Math.min(start.y, end.y),
      maxCoord: Math.max(start.y, end.y),
    });

    // Seg 2: Horizontal from midX to end.x at end.y
    segments.push({
      id: `${wireId}_2`,
      wireId,
      segIndex: 2,
      type: 'H',
      x1: midX,
      y1: end.y,
      x2: end.x,
      y2: end.y,
      fixedCoord: end.y,
      minCoord: Math.min(midX, end.x),
      maxCoord: Math.max(midX, end.x),
    });
  } else {
    // Loopback Manhattan routing: 5 segments
    const offsetY = start.y < end.y ? 40 : -40;
    const p1 = { x: start.x + 25, y: start.y };
    const p2 = { x: start.x + 25, y: start.y + offsetY };
    const p3 = { x: end.x - 25, y: start.y + offsetY };
    const p4 = { x: end.x - 25, y: end.y };
    const p5 = { x: end.x, y: end.y };

    segments.push({
      id: `${wireId}_0`,
      wireId,
      segIndex: 0,
      type: 'H',
      x1: start.x,
      y1: start.y,
      x2: p1.x,
      y2: p1.y,
      fixedCoord: start.y,
      minCoord: Math.min(start.x, p1.x),
      maxCoord: Math.max(start.x, p1.x),
    });

    segments.push({
      id: `${wireId}_1`,
      wireId,
      segIndex: 1,
      type: 'V',
      x1: p1.x,
      y1: p1.y,
      x2: p2.x,
      y2: p2.y,
      fixedCoord: p1.x,
      minCoord: Math.min(p1.y, p2.y),
      maxCoord: Math.max(p1.y, p2.y),
    });

    segments.push({
      id: `${wireId}_2`,
      wireId,
      segIndex: 2,
      type: 'H',
      x1: p2.x,
      y1: p2.y,
      x2: p3.x,
      y2: p3.y,
      fixedCoord: p2.y,
      minCoord: Math.min(p2.x, p3.x),
      maxCoord: Math.max(p2.x, p3.x),
    });

    segments.push({
      id: `${wireId}_3`,
      wireId,
      segIndex: 3,
      type: 'V',
      x1: p3.x,
      y1: p3.y,
      x2: p4.x,
      y2: p4.y,
      fixedCoord: p3.x,
      minCoord: Math.min(p3.y, p4.y),
      maxCoord: Math.max(p3.y, p4.y),
    });

    segments.push({
      id: `${wireId}_4`,
      wireId,
      segIndex: 4,
      type: 'H',
      x1: p4.x,
      y1: p4.y,
      x2: p5.x,
      y2: p5.y,
      fixedCoord: p4.y,
      minCoord: Math.min(p4.x, p5.x),
      maxCoord: Math.max(p4.x, p5.x),
    });
  }

  return segments;
}

/**
 * Projects a point onto the nearest segment in a list of orthogonal segments.
 */
export function projectPointOntoSegments(
  point: { x: number; y: number },
  segments: WireSegment[]
): { x: number; y: number } {
  if (segments.length === 0) return point;

  let bestPoint = point;
  let minDistance = Infinity;

  for (const seg of segments) {
    let px = point.x;
    let py = point.y;

    if (seg.type === 'H') {
      py = seg.fixedCoord;
      px = Math.max(seg.minCoord, Math.min(seg.maxCoord, point.x));
    } else {
      px = seg.fixedCoord;
      py = Math.max(seg.minCoord, Math.min(seg.maxCoord, point.y));
    }

    const dist = Math.hypot(point.x - px, point.y - py);
    if (dist < minDistance) {
      minDistance = dist;
      bestPoint = { x: px, y: py };
    }
  }

  return bestPoint;
}

/**
 * Finds all orthogonal crossings between all active wires in the circuit
 * and returns jumper arc locations (excluding connected junctions/solder points).
 */
export function computeAllWireJumpers(
  wires: Wire[],
  components: CircuitComponent[]
): WireJumperCrossings {
  const jumpers: WireJumperCrossings = {};
  if (!wires || wires.length < 2) return jumpers;

  // 1. Gather all segments and junction locations
  const allSegments: WireSegment[] = [];
  const junctionPoints: { x: number; y: number }[] = [];

  for (const wire of wires) {
    if (!wire) continue;
    const start = getEffectiveWireStartPos(wire, components, wires);
    const toComp = components.find((c) => c.id === wire.toComponentId);
    const toPort = toComp?.ports.find((p) => p.id === wire.toPortId);
    if (!toComp || !toPort) continue;
    const end = getPortCanvasPos(toComp, toPort);

    // Record branch junction solder point if any
    if (wire.branchStartPos) {
      junctionPoints.push(start);
    }

    const wireSegs = getOrthogonalSegments(wire.id, start, end);
    allSegments.push(...wireSegs);
  }

  const hSegments = allSegments.filter((s) => s.type === 'H');
  const vSegments = allSegments.filter((s) => s.type === 'V');

  // 2. Check each Horizontal segment against each Vertical segment
  for (const h of hSegments) {
    for (const v of vSegments) {
      if (h.wireId === v.wireId) continue; // Same wire doesn't jump over itself

      const crossX = v.fixedCoord;
      const crossY = h.fixedCoord;

      // Crossing must be strictly within both segment bounds (with margin to avoid corners/ports)
      const JUMPER_MARGIN = 8;
      const isInsideH = crossX > h.minCoord + JUMPER_MARGIN && crossX < h.maxCoord - JUMPER_MARGIN;
      const isInsideV = crossY > v.minCoord + JUMPER_MARGIN && crossY < v.maxCoord - JUMPER_MARGIN;

      if (isInsideH && isInsideV) {
        // Ensure this is not a shared electrical connection / branch junction dot
        const isJunction = junctionPoints.some(
          (j) => Math.hypot(j.x - crossX, j.y - crossY) < 6
        );

        if (!isJunction) {
          // Standard schematic jumper: Horizontal wire jumps over Vertical wire
          if (!jumpers[h.wireId]) {
            jumpers[h.wireId] = {};
          }
          if (!jumpers[h.wireId][h.segIndex]) {
            jumpers[h.wireId][h.segIndex] = [];
          }
          jumpers[h.wireId][h.segIndex].push(crossX);
        }
      }
    }
  }

  return jumpers;
}

/**
 * Generates an SVG path `d` string with textbook semicircular jumpers for orthogonal wires.
 */
export function generateOrthogonalPathWithJumpers(
  wireId: string,
  start: { x: number; y: number },
  end: { x: number; y: number },
  wireJumpers?: { [segIndex: number]: number[] }
): string {
  const segments = getOrthogonalSegments(wireId, start, end);
  if (segments.length === 0) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  const JUMPER_RADIUS = 7;
  let d = `M ${start.x} ${start.y}`;

  for (const seg of segments) {
    if (seg.type === 'V') {
      // Vertical line: straight to end of segment
      d += ` L ${seg.x2} ${seg.y2}`;
    } else {
      // Horizontal line: check for jumpers on this segment
      const crossings = wireJumpers?.[seg.segIndex];

      if (!crossings || crossings.length === 0) {
        d += ` L ${seg.x2} ${seg.y2}`;
      } else {
        const isLeftToRight = seg.x1 < seg.x2;
        // Filter crossings within safe bounds of this segment
        const validCrossings = crossings.filter(
          (xc) => xc > seg.minCoord + JUMPER_RADIUS && xc < seg.maxCoord - JUMPER_RADIUS
        );

        if (validCrossings.length === 0) {
          d += ` L ${seg.x2} ${seg.y2}`;
        } else {
          // Sort crossings in traversal order
          const sorted = [...validCrossings].sort((a, b) =>
            isLeftToRight ? a - b : b - a
          );

          if (isLeftToRight) {
            for (const xc of sorted) {
              const beforeArc = xc - JUMPER_RADIUS;
              const afterArc = xc + JUMPER_RADIUS;
              d += ` L ${beforeArc} ${seg.y1}`;
              // Semicircular arch jumping UPWARDS (sweep-flag 1 in SVG)
              d += ` A ${JUMPER_RADIUS} ${JUMPER_RADIUS} 0 0 1 ${afterArc} ${seg.y1}`;
            }
            d += ` L ${seg.x2} ${seg.y2}`;
          } else {
            for (const xc of sorted) {
              const beforeArc = xc + JUMPER_RADIUS;
              const afterArc = xc - JUMPER_RADIUS;
              d += ` L ${beforeArc} ${seg.y1}`;
              // Semicircular arch jumping UPWARDS from right to left (sweep-flag 0 in SVG)
              d += ` A ${JUMPER_RADIUS} ${JUMPER_RADIUS} 0 0 0 ${afterArc} ${seg.y1}`;
            }
            d += ` L ${seg.x2} ${seg.y2}`;
          }
        }
      }
    }
  }

  return d;
}

export interface BranchTeeGeometry {
  barX1: number;
  barY1: number;
  barX2: number;
  barY2: number;
  stemX1: number;
  stemY1: number;
  stemX2: number;
  stemY2: number;
  centerX: number;
  centerY: number;
}

/**
 * Computes exact coordinates for a schematic flipped-T / Tee junction tap marker.
 */
export function getBranchTeeGeometry(
  branchPos: { x: number; y: number },
  targetPos: { x: number; y: number },
  parentWireId?: string,
  allWires: Wire[] = [],
  components: CircuitComponent[] = []
): BranchTeeGeometry {
  const BAR_HALF_LEN = 7;
  const STEM_LEN = 6;
  const cx = branchPos.x;
  const cy = branchPos.y;

  let isParentHorizontal = true; // default assume parent wire is horizontal

  if (parentWireId) {
    const parentWire = allWires.find((w) => w.id === parentWireId);
    if (parentWire) {
      const parentStart = getEffectiveWireStartPos(parentWire, components, allWires);
      const parentToComp = components.find((c) => c.id === parentWire.toComponentId);
      const parentToPort = parentToComp?.ports.find((p) => p.id === parentWire.toPortId);
      const parentEnd = parentToComp ? getPortCanvasPos(parentToComp, parentToPort) : parentStart;
      const parentSegs = getOrthogonalSegments(parentWire.id, parentStart, parentEnd);

      // Find segment closest to branchPos
      let bestDist = Infinity;
      let bestSeg = parentSegs[0];
      for (const seg of parentSegs) {
        let px = cx;
        let py = cy;
        if (seg.type === 'H') {
          py = seg.fixedCoord;
          px = Math.max(seg.minCoord, Math.min(seg.maxCoord, cx));
        } else {
          px = seg.fixedCoord;
          py = Math.max(seg.minCoord, Math.min(seg.maxCoord, cy));
        }
        const d = Math.hypot(cx - px, cy - py);
        if (d < bestDist) {
          bestDist = d;
          bestSeg = seg;
        }
      }

      if (bestSeg) {
        isParentHorizontal = bestSeg.type === 'H';
      }
    }
  }

  if (isParentHorizontal) {
    // Crossbar along X axis
    const barX1 = cx - BAR_HALF_LEN;
    const barY1 = cy;
    const barX2 = cx + BAR_HALF_LEN;
    const barY2 = cy;

    // Stem extends along Y axis in direction of targetPos (or flipped T upwards if on same line)
    const dy = targetPos.y - cy;
    const stemDirY = dy !== 0 ? (dy > 0 ? 1 : -1) : -1;
    const stemX1 = cx;
    const stemY1 = cy;
    const stemX2 = cx;
    const stemY2 = cy + stemDirY * STEM_LEN;

    return {
      barX1,
      barY1,
      barX2,
      barY2,
      stemX1,
      stemY1,
      stemX2,
      stemY2,
      centerX: cx,
      centerY: cy,
    };
  } else {
    // Parent is vertical: Crossbar along Y axis
    const barX1 = cx;
    const barY1 = cy - BAR_HALF_LEN;
    const barX2 = cx;
    const barY2 = cy + BAR_HALF_LEN;

    // Stem extends along X axis towards targetPos
    const dx = targetPos.x - cx;
    const stemDirX = dx !== 0 ? (dx > 0 ? 1 : -1) : 1;
    const stemX1 = cx;
    const stemY1 = cy;
    const stemX2 = cx + stemDirX * STEM_LEN;
    const stemY2 = cy;

    return {
      barX1,
      barY1,
      barX2,
      barY2,
      stemX1,
      stemY1,
      stemX2,
      stemY2,
      centerX: cx,
      centerY: cy,
    };
  }
}

/**
 * Gets the closest projected point along a wire's path from a clicked coordinate.
 */
export function getClosestPointOnWire(
  wire: Wire,
  components: CircuitComponent[],
  allWires: Wire[],
  clickPos: { x: number; y: number },
  gridSize: number = 20,
  snap: boolean = true
): { x: number; y: number } {
  const start = getEffectiveWireStartPos(wire, components, allWires);
  const toComp = components.find((c) => c.id === wire.toComponentId);
  const toPort = toComp?.ports.find((p) => p.id === wire.toPortId);
  const end = toComp ? getPortCanvasPos(toComp, toPort) : start;

  const segments = getOrthogonalSegments(wire.id, start, end);
  const projected = projectPointOntoSegments(clickPos, segments);

  if (!snap) return projected;

  // Grid snap along the segment while staying locked on the segment line
  let snappedX = Math.round(projected.x / gridSize) * gridSize;
  let snappedY = Math.round(projected.y / gridSize) * gridSize;

  // Re-project snapped coordinates onto the wire segments so it never deviates from the wire
  return projectPointOntoSegments({ x: snappedX, y: snappedY }, segments);
}
