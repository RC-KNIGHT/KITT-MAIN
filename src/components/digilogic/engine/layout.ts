import { CircuitComponent, Wire } from '../types/circuit';

export function autoArrangeCircuit(
  components: CircuitComponent[],
  wires: Wire[],
  gridSize: number = 20
): CircuitComponent[] {
  if (components.length === 0) return components;

  // 1. Build a directed graph of components
  const adjacencyList = new Map<string, string[]>(); // Component ID -> List of Outgoing Component IDs
  const incomingEdges = new Map<string, string[]>(); // Component ID -> List of Incoming Component IDs
  
  components.forEach(c => {
    adjacencyList.set(c.id, []);
    incomingEdges.set(c.id, []);
  });

  wires.forEach(w => {
    if (adjacencyList.has(w.fromComponentId) && incomingEdges.has(w.toComponentId)) {
      adjacencyList.get(w.fromComponentId)!.push(w.toComponentId);
      incomingEdges.get(w.toComponentId)!.push(w.fromComponentId);
    }
  });

  // 2. Determine depths (layers) using a longest-path/topological sort approach
  const depths = new Map<string, number>();
  
  // Initialize inputs or components with no incoming edges at depth 0
  let queue: string[] = [];
  components.forEach(c => {
    // Treat explicit INPUT category or 0-incoming edge components as depth 0
    if (c.type === 'SWITCH' || c.type === 'BUTTON' || c.type === 'CLOCK' || c.type === 'CONST_0' || c.type === 'CONST_1' || incomingEdges.get(c.id)!.length === 0) {
      depths.set(c.id, 0);
      queue.push(c.id);
    }
  });

  // If there are loops and no explicit inputs, pick a random component as depth 0
  if (queue.length === 0 && components.length > 0) {
    depths.set(components[0].id, 0);
    queue.push(components[0].id);
  }

  // BFS to assign depths
  const visited = new Set<string>();
  let safetyCounter = 0;
  while (queue.length > 0 && safetyCounter < 10000) {
    safetyCounter++;
    const currId = queue.shift()!;
    const currDepth = depths.get(currId)!;
    
    visited.add(currId);

    const neighbors = adjacencyList.get(currId) || [];
    for (const neighborId of neighbors) {
      const neighborDepth = depths.get(neighborId) || 0;
      // If we found a longer path to neighbor, update its depth and requeue
      if (currDepth + 1 > neighborDepth) {
        depths.set(neighborId, currDepth + 1);
        queue.push(neighborId);
      }
    }
  }

  // Handle any disconnected islands or cyclic components that weren't reached
  components.forEach(c => {
    if (!depths.has(c.id)) {
      depths.set(c.id, 0); // Put them at start if unresolvable
    }
  });

  // 3. Group by depth
  const layers = new Map<number, CircuitComponent[]>();
  let maxDepth = 0;
  components.forEach(c => {
    const d = depths.get(c.id)!;
    if (!layers.has(d)) {
      layers.set(d, []);
    }
    layers.get(d)!.push(c);
    if (d > maxDepth) maxDepth = d;
  });

  // 4. Sort within each layer to minimize crossing.
  // A simple heuristic: sort by original Y position to preserve some user intent,
  // or by the average Y position of their parents.
  const getAverageParentY = (compId: string): number => {
    const parents = incomingEdges.get(compId) || [];
    if (parents.length === 0) {
      return components.find(c => c.id === compId)?.y || 0;
    }
    let sumY = 0;
    let count = 0;
    parents.forEach(pid => {
      const p = components.find(c => c.id === pid);
      if (p) {
        sumY += p.y;
        count++;
      }
    });
    return count > 0 ? sumY / count : 0;
  };

  for (let i = 0; i <= maxDepth; i++) {
    const layer = layers.get(i);
    if (layer) {
      // For depth 0, just use their existing Y to keep them sorted roughly as user placed them
      if (i === 0) {
        layer.sort((a, b) => a.y - b.y);
      } else {
        layer.sort((a, b) => getAverageParentY(a.id) - getAverageParentY(b.id));
      }
    }
  }

  // 5. Assign X, Y coordinates
  const newComponents: CircuitComponent[] = [];
  
  const X_SPACING = 200;
  const Y_SPACING = 120;
  const START_X = 100;
  const START_Y = 100;

  for (let i = 0; i <= maxDepth; i++) {
    const layer = layers.get(i);
    if (!layer) continue;
    
    let currentY = START_Y; 

    // We can try to align components with their parents if possible, 
    // but a simple stack is more reliable to prevent overlaps.
    layer.forEach((comp, idx) => {
      let x = START_X + (i * X_SPACING);
      let y = currentY + (idx * Y_SPACING);

      // Snap to grid
      x = Math.round(x / gridSize) * gridSize;
      y = Math.round(y / gridSize) * gridSize;

      newComponents.push({
        ...comp,
        x,
        y
      });
    });
  }

  return newComponents;
}
