/**
 * KITT Bill of Materials (BOM) & Cost Estimation Engine
 * Generates itemized pricing, footprints, component footprints, and package classifications.
 */

import { componentRegistry } from './componentRegistry';

export interface BomItem {
  id: string;
  partNumber: string;
  displayName: string;
  category: string;
  quantity: number;
  unitCostUsd: number;
  totalCostUsd: number;
  footprint: string;
  manufacturer: string;
}

export interface BomSummary {
  items: BomItem[];
  totalUniqueComponents: number;
  totalQuantity: number;
  totalCostUsd: number;
  categoryBreakdown: Record<string, number>;
  markdownTable: string;
}

export class CostBomEngine {
  public generateBom(components: Array<{ id: string; partNumber: string; label?: string }>): BomSummary {
    const grouped = new Map<string, { count: number; specPart: string; displayName: string; category: string; footprint: string; unitCost: number; manufacturer: string }>();

    components.forEach(comp => {
      const spec = componentRegistry.lookup(comp.partNumber);
      const key = spec ? spec.id : comp.partNumber.toLowerCase();

      if (grouped.has(key)) {
        grouped.get(key)!.count++;
      } else {
        grouped.set(key, {
          count: 1,
          specPart: spec ? spec.partNumber : comp.partNumber,
          displayName: spec ? spec.displayName : (comp.label || comp.partNumber),
          category: spec ? spec.category : 'discrete',
          footprint: spec ? spec.packageFootprint : 'Standard THT',
          unitCost: spec ? spec.unitCostUsd : 0.25,
          manufacturer: spec ? spec.manufacturer : 'Generic / Standard',
        });
      }
    });

    const items: BomItem[] = [];
    let totalQuantity = 0;
    let totalCostUsd = 0;
    const categoryBreakdown: Record<string, number> = {};

    grouped.forEach((val, id) => {
      const lineTotal = Math.round(val.count * val.unitCost * 100) / 100;
      totalQuantity += val.count;
      totalCostUsd += lineTotal;

      categoryBreakdown[val.category] = (categoryBreakdown[val.category] || 0) + lineTotal;

      items.push({
        id,
        partNumber: val.specPart,
        displayName: val.displayName,
        category: val.category,
        quantity: val.count,
        unitCostUsd: val.unitCost,
        totalCostUsd: lineTotal,
        footprint: val.footprint,
        manufacturer: val.manufacturer,
      });
    });

    totalCostUsd = Math.round(totalCostUsd * 100) / 100;

    // Generate formatted Markdown BOM Table
    const tableHeader = `| Item | Part Number / Description | Footprint | Qty | Unit ($) | Total ($) |\n| :--- | :--- | :--- | :---: | :---: | :---: |\n`;
    const tableRows = items
      .map(
        (it, idx) =>
          `| **${idx + 1}** | **${it.displayName}** (\`${it.partNumber}\`) | \`${it.footprint}\` | ${it.quantity} | $${it.unitCostUsd.toFixed(2)} | **$${it.totalCostUsd.toFixed(2)}** |`
      )
      .join('\n');

    const markdownTable = `${tableHeader}${tableRows}\n| | **Estimated System Total** | | **${totalQuantity}** | | **$${totalCostUsd.toFixed(2)}** |`;

    return {
      items,
      totalUniqueComponents: items.length,
      totalQuantity,
      totalCostUsd,
      categoryBreakdown,
      markdownTable,
    };
  }
}

export const costBomEngine = new CostBomEngine();
