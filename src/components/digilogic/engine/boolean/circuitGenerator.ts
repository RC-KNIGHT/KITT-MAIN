/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, GateType, Wire } from '../../types/circuit';
import { createComponent } from '../componentFactory';
import { ASTNode, extractVariables } from './ast';
import { convertToUniversalNAND, convertToUniversalNOR, optimizeXORPatterns } from './optimizer';

export type SynthesisMode = 'direct' | 'optimized_xor' | 'universal_nand' | 'universal_nor';

export interface SynthesizedCircuit {
  components: CircuitComponent[];
  wires: Wire[];
  outputCompId: string;
  gateCount: number;
  mode: SynthesisMode;
}

/**
 * Automatically synthesizes a clean, well-spaced digital logic circuit from a Boolean AST.
 * Supports Direct Gate Preservation, XOR/XNOR Parity Optimization, Universal NAND, and Universal NOR modes.
 */
export function synthesizeCircuitFromAST(
  rawAst: ASTNode,
  outputLabel: string = 'Y',
  baseX: number = 100,
  baseY: number = 100,
  mode: SynthesisMode = 'direct'
): SynthesizedCircuit {
  // Pre-process AST according to synthesis mode
  let ast = rawAst;
  if (mode === 'optimized_xor') {
    ast = optimizeXORPatterns(rawAst);
  } else if (mode === 'universal_nand') {
    ast = convertToUniversalNAND(rawAst);
  } else if (mode === 'universal_nor') {
    ast = convertToUniversalNOR(rawAst);
  }

  const components: CircuitComponent[] = [];
  const wires: Wire[] = [];

  const variables = extractVariables(ast);
  const inputCompMap = new Map<string, CircuitComponent>();

  const inputSpacing = 100;
  const colWidth = 170;

  // 1. Single constant case (e.g. F = 1 or F = 0)
  if (variables.length === 0) {
    const isOne = ast.type === 'CONST' && (ast.value === 1 || ast.value === '1');
    const constComp = createComponent(isOne ? 'CONST_1' : 'CONST_0', baseX, baseY, {
      name: isOne ? 'HIGH (1)' : 'LOW (0)',
    });
    const probeComp = createComponent('PROBE', baseX + colWidth, baseY, {
      name: `Output ${outputLabel}`,
      label: outputLabel,
    });
    components.push(constComp, probeComp);
    wires.push({
      id: `wire_${constComp.id}_${probeComp.id}_${Date.now()}`,
      fromComponentId: constComp.id,
      fromPortId: 'out',
      toComponentId: probeComp.id,
      toPortId: 'in_0',
    });
    return { components, wires, outputCompId: probeComp.id, gateCount: 0, mode };
  }

  // 2. Generate input switches (left-most column)
  variables.forEach((varName, idx) => {
    const switchComp = createComponent('SWITCH', baseX, baseY + idx * inputSpacing, {
      name: `Input ${varName}`,
      label: varName,
    });
    components.push(switchComp);
    inputCompMap.set(varName, switchComp);
  });

  interface SubcircuitOutput {
    comp: CircuitComponent;
    portId: string;
    level: number;
    approxY: number;
  }

  let rowCounter = 0;
  let totalGates = 0;

  function buildNode(node: ASTNode, depth: number): SubcircuitOutput {
    if (node.type === 'VAR') {
      const varName = String(node.value);
      const switchComp = inputCompMap.get(varName);
      if (switchComp) {
        return {
          comp: switchComp,
          portId: 'out',
          level: 0,
          approxY: switchComp.y,
        };
      }
    }

    if (node.type === 'CONST') {
      const isOne = node.value === 1 || node.value === '1';
      const cType: GateType = isOne ? 'CONST_1' : 'CONST_0';
      const cY = baseY + (rowCounter++) * inputSpacing;
      const constComp = createComponent(cType, baseX + colWidth, cY);
      components.push(constComp);
      return {
        comp: constComp,
        portId: 'out',
        level: 1,
        approxY: cY,
      };
    }

    // Direct Inversion Optimizations:
    // NOT(AND) -> NAND, NOT(OR) -> NOR, NOT(XOR) -> XNOR
    if (node.type === 'NOT' && node.children && node.children.length === 1) {
      const child = node.children[0];

      // Convert NOT(AND) directly into a NAND gate
      if (child.type === 'AND' && child.children && child.children.length >= 2) {
        return buildNode({ type: 'NAND', children: child.children }, depth);
      }
      // Convert NOT(OR) directly into a NOR gate
      if (child.type === 'OR' && child.children && child.children.length >= 2) {
        return buildNode({ type: 'NOR', children: child.children }, depth);
      }
      // Convert NOT(XOR) directly into an XNOR gate
      if (child.type === 'XOR' && child.children && child.children.length >= 2) {
        return buildNode({ type: 'XNOR', children: child.children }, depth);
      }

      // Standard NOT gate
      const childOut = buildNode(child, depth + 1);
      const notLevel = childOut.level + 1;
      const notX = baseX + notLevel * colWidth;
      const notY = childOut.approxY;

      const notComp = createComponent('NOT', notX, notY);
      components.push(notComp);
      totalGates++;

      wires.push({
        id: `wire_${childOut.comp.id}_${notComp.id}_${Date.now()}_${Math.random()}`,
        fromComponentId: childOut.comp.id,
        fromPortId: childOut.portId,
        toComponentId: notComp.id,
        toPortId: 'in_0',
      });

      return {
        comp: notComp,
        portId: 'out',
        level: notLevel,
        approxY: notY,
      };
    }

    // Binary / Multi-input operations: AND, OR, XOR, XNOR, NAND, NOR
    const children = node.children || [];
    if (children.length === 0) {
      const constComp = createComponent('CONST_0', baseX + colWidth, baseY);
      components.push(constComp);
      return { comp: constComp, portId: 'out', level: 1, approxY: baseY };
    }

    if (children.length === 1) {
      return buildNode(children[0], depth);
    }

    // Build all sub-children
    const childOutputs = children.map((c) => buildNode(c, depth + 1));
    const maxChildLevel = Math.max(...childOutputs.map((c) => c.level));
    const gateLevel = maxChildLevel + 1;

    const avgY =
      childOutputs.reduce((acc, c) => acc + c.approxY, 0) / childOutputs.length;
    const gateX = baseX + gateLevel * colWidth;
    const gateY = avgY;

    const gateType = node.type as GateType;
    const inputCount = Math.min(8, Math.max(2, children.length));
    const gateComp = createComponent(gateType, gateX, gateY, {
      inputCount,
    });
    components.push(gateComp);
    totalGates++;

    // Connect child outputs to gate inputs
    childOutputs.forEach((child, idx) => {
      const portId = `in_${Math.min(idx, inputCount - 1)}`;
      wires.push({
        id: `wire_${child.comp.id}_${gateComp.id}_${portId}_${Date.now()}_${Math.random()}`,
        fromComponentId: child.comp.id,
        fromPortId: child.portId,
        toComponentId: gateComp.id,
        toPortId: portId,
      });
    });

    return {
      comp: gateComp,
      portId: 'out',
      level: gateLevel,
      approxY: gateY,
    };
  }

  const rootResult = buildNode(ast, 0);

  // Add final output Probe / LED
  const probeX = baseX + (rootResult.level + 1) * colWidth;
  const probeY = rootResult.approxY;
  const probeComp = createComponent('PROBE', probeX, probeY, {
    name: `Output ${outputLabel}`,
    label: outputLabel,
  });
  components.push(probeComp);

  wires.push({
    id: `wire_${rootResult.comp.id}_${probeComp.id}_${Date.now()}`,
    fromComponentId: rootResult.comp.id,
    fromPortId: rootResult.portId,
    toComponentId: probeComp.id,
    toPortId: 'in_0',
  });

  return {
    components,
    wires,
    outputCompId: probeComp.id,
    gateCount: totalGates,
    mode,
  };
}
