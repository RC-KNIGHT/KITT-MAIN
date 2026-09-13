/**
 * KITT Electrical Panel & MCB Design Engine
 * Domain-specific physics and electrical safety validator for AC distribution panels,
 * circuit breakers, busbars, wire ampacity, and phase load balancing.
 * Follows NEC (National Electrical Code) and IEC standards.
 */

import { ElectricalPanelAction } from './schemas/actionSchema';
import { Logger } from './logger';

const logger = new Logger('ElectricalPanelEngine');

export interface BranchLoad {
  loadName: string;
  continuousCurrentAmps: number;
  nonContinuousCurrentAmps: number;
  wireGaugeAwg: number;
  cableType: string;
  powerFactor: number;
}

export interface BreakerNode {
  id: string;
  poles: 1 | 2 | 3;
  tripRatingAmps: number;
  curve: 'B' | 'C' | 'D';
  label: string;
  phase: 'L1' | 'L2' | 'L3' | 'NEUTRAL';
  slotNumber: number;
  kaRating: number;
  connectedLoads: BranchLoad[];
}

export interface PanelConfiguration {
  panelId: string;
  mainRatingAmps: number;
  busbarRatingAmps: number;
  voltageSystem: '120/240V_SPLIT' | '230/400V_3PHASE' | '120/208V_3PHASE';
  phases: 1 | 3;
  breakers: BreakerNode[];
}

export interface PanelDrcViolation {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  code: string;
  message: string;
  breakerId?: string;
  standardReference: string; // e.g. "NEC 210.20", "NEC Table 310.16"
  recommendation: string;
}

export interface PanelValidationResult {
  valid: boolean;
  status: 'COMPLIANT' | 'WARNINGS' | 'NON_COMPLIANT';
  totalConnectedLoadAmps: number;
  diversifiedDemandAmps: number;
  phaseLoads: {
    L1_Amps: number;
    L2_Amps: number;
    L3_Amps?: number;
  };
  phaseImbalancePercent: number;
  busbarUtilizationPercent: number;
  mainBreakerUtilizationPercent: number;
  violations: PanelDrcViolation[];
  derivationSummary: string;
}

// Conductor Maximum Allowable Ampacity (NEC Table 310.16, Copper 75°C / 60°C termination limits)
const COPPER_WIRE_AMPACITY_LIMITS: Record<number, number> = {
  14: 15, // 14 AWG -> max 15A breaker
  12: 20, // 12 AWG -> max 20A breaker
  10: 30, // 10 AWG -> max 30A breaker
  8: 40,  // 8 AWG  -> max 40A breaker
  6: 55,  // 6 AWG  -> max 55A/60A breaker
  4: 70,  // 4 AWG  -> max 70A breaker
  3: 85,  // 3 AWG  -> max 85A breaker
  2: 95,  // 2 AWG  -> max 95A/100A breaker
  1: 110, // 1 AWG  -> max 110A breaker
  0: 125, // 1/0 AWG -> max 125A breaker
};

export class ElectricalPanelEngine {
  /**
   * Applies structured actions to build or mutate a panel configuration.
   */
  public buildPanelFromActions(actions: ElectricalPanelAction[], basePanel?: Partial<PanelConfiguration>): PanelConfiguration {
    const panel: PanelConfiguration = {
      panelId: basePanel?.panelId || 'MAIN_SUBPANEL_01',
      mainRatingAmps: basePanel?.mainRatingAmps || 100,
      busbarRatingAmps: basePanel?.busbarRatingAmps || 125,
      voltageSystem: basePanel?.voltageSystem || '120/240V_SPLIT',
      phases: basePanel?.phases || 1,
      breakers: basePanel?.breakers ? [...basePanel.breakers] : [],
    };

    for (const act of actions) {
      switch (act.actionType) {
        case 'set_panel_specs':
          panel.panelId = act.payload.panelId || panel.panelId;
          panel.mainRatingAmps = act.payload.mainRatingAmps;
          panel.busbarRatingAmps = act.payload.busbarRatingAmps;
          panel.voltageSystem = act.payload.voltageSystem;
          panel.phases = act.payload.phases;
          break;

        case 'create_breaker': {
          const existing = panel.breakers.find(b => b.id === act.payload.id);
          if (!existing) {
            panel.breakers.push({
              id: act.payload.id,
              poles: act.payload.poles,
              tripRatingAmps: act.payload.tripRatingAmps,
              curve: act.payload.curve,
              label: act.payload.label,
              phase: 'L1',
              slotNumber: panel.breakers.length + 1,
              kaRating: act.payload.kaRating || 6,
              connectedLoads: [],
            });
          }
          break;
        }

        case 'assign_to_busbar': {
          const breaker = panel.breakers.find(b => b.id === act.payload.breakerId);
          if (breaker) {
            breaker.phase = act.payload.phase;
            breaker.slotNumber = act.payload.slotNumber;
          }
          break;
        }

        case 'connect_branch_load': {
          const breaker = panel.breakers.find(b => b.id === act.payload.breakerId);
          if (breaker) {
            breaker.connectedLoads.push({
              loadName: act.payload.loadName,
              continuousCurrentAmps: act.payload.continuousCurrentAmps,
              nonContinuousCurrentAmps: act.payload.nonContinuousCurrentAmps || 0,
              wireGaugeAwg: act.payload.wireGaugeAwg,
              cableType: act.payload.cableType || 'THHN',
              powerFactor: act.payload.powerFactor || 0.95,
            });
          }
          break;
        }

        case 'set_breaker_rating': {
          const breaker = panel.breakers.find(b => b.id === act.payload.breakerId);
          if (breaker) {
            breaker.tripRatingAmps = act.payload.tripRatingAmps;
            if (act.payload.curve) breaker.curve = act.payload.curve;
          }
          break;
        }
      }
    }

    return panel;
  }

  /**
   * Performs full electrical safety, ampacity, and phase balancing evaluation.
   */
  public evaluatePanel(panel: PanelConfiguration): PanelValidationResult {
    const violations: PanelDrcViolation[] = [];
    let l1_Amps = 0;
    let l2_Amps = 0;
    let l3_Amps = 0;

    let totalConnectedLoadAmps = 0;

    panel.breakers.forEach(breaker => {
      // 1. Double-tapping check: More than 1 branch conductor on a single breaker
      if (breaker.connectedLoads.length > 1) {
        violations.push({
          severity: 'ERROR',
          code: 'ERR_DOUBLE_TAPPED_BREAKER',
          breakerId: breaker.id,
          standardReference: 'NEC 110.14(A) / UL 489',
          message: `Breaker '${breaker.label}' (ID: ${breaker.id}) has ${breaker.connectedLoads.length} branch circuits landed on its terminal lug. Double-tapping creates loose terminations and severe fire hazards.`,
          recommendation: 'Use an approved pigtail wire nut inside the enclosure or allocate an independent breaker slot for each circuit.',
        });
      }

      // Calculate required trip rating for connected loads
      let breakerTotalContinuousAmps = 0;
      let breakerTotalNonContinuousAmps = 0;

      breaker.connectedLoads.forEach(load => {
        breakerTotalContinuousAmps += load.continuousCurrentAmps;
        breakerTotalNonContinuousAmps += load.nonContinuousCurrentAmps;

        // 2. Conductor Wire Gauge Sizing vs Breaker Rating
        const maxPermittedBreakerAmps = COPPER_WIRE_AMPACITY_LIMITS[load.wireGaugeAwg] || 15;
        if (breaker.tripRatingAmps > maxPermittedBreakerAmps) {
          violations.push({
            severity: 'ERROR',
            code: 'ERR_CONDUCTOR_UNDERSIZED',
            breakerId: breaker.id,
            standardReference: 'NEC Table 310.16 & 240.4(D)',
            message: `Breaker rating of ${breaker.tripRatingAmps}A exceeds the ${maxPermittedBreakerAmps}A maximum safe ampacity of the connected ${load.wireGaugeAwg} AWG conductor on '${load.loadName}'. In an overload condition, the wire will overheat and ignite before the breaker trips.`,
            recommendation: `Upgrade the wire to at least ${this.getMinAwgForAmps(breaker.tripRatingAmps)} AWG copper, or reduce the breaker rating to ${maxPermittedBreakerAmps}A.`,
          });
        }
      });

      // 3. Continuous Load 125% Rule (NEC 210.20)
      const requiredDesignAmps = breakerTotalContinuousAmps * 1.25 + breakerTotalNonContinuousAmps;
      if (breaker.tripRatingAmps < requiredDesignAmps) {
        violations.push({
          severity: 'ERROR',
          code: 'ERR_BREAKER_UNDERSIZED',
          breakerId: breaker.id,
          standardReference: 'NEC 210.20(A) & IEC 60898',
          message: `Connected continuous load on breaker '${breaker.label}' requires minimum trip ampacity of ${requiredDesignAmps.toFixed(1)}A (125% of continuous load ${breakerTotalContinuousAmps}A + ${breakerTotalNonContinuousAmps}A non-continuous), but breaker is rated for only ${breaker.tripRatingAmps}A. Nuisance thermal tripping will occur.`,
          recommendation: `Upsize breaker to at least ${this.getNextStandardBreakerRating(requiredDesignAmps)}A and ensure wire gauge matches.`,
        });
      }

      const totalLoadOnBreaker = breakerTotalContinuousAmps + breakerTotalNonContinuousAmps;
      totalConnectedLoadAmps += totalLoadOnBreaker;

      // Accumulate phase loading
      if (breaker.phase === 'L1') {
        l1_Amps += totalLoadOnBreaker;
      } else if (breaker.phase === 'L2') {
        l2_Amps += totalLoadOnBreaker;
      } else if (breaker.phase === 'L3') {
        l3_Amps += totalLoadOnBreaker;
      } else {
        l1_Amps += totalLoadOnBreaker / 2;
        l2_Amps += totalLoadOnBreaker / 2;
      }
    });

    // 4. Panel Total Coincident Loading vs Main Breaker
    const diversifiedDemandAmps = totalConnectedLoadAmps * 0.8; // 80% diversity factor
    const busbarUtilizationPercent = Math.round((diversifiedDemandAmps / panel.busbarRatingAmps) * 100);
    const mainBreakerUtilizationPercent = Math.round((diversifiedDemandAmps / panel.mainRatingAmps) * 100);

    if (diversifiedDemandAmps > panel.mainRatingAmps) {
      violations.push({
        severity: 'ERROR',
        code: 'ERR_PANEL_MAIN_OVERLOAD',
        standardReference: 'NEC Article 220',
        message: `Total diversified panel demand (${diversifiedDemandAmps.toFixed(1)}A) exceeds the main service disconnect rating of ${panel.mainRatingAmps}A (${mainBreakerUtilizationPercent}% capacity).`,
        recommendation: `Upgrade main breaker/service panel to 150A or 200A, or shed non-critical branch circuits.`,
      });
    } else if (mainBreakerUtilizationPercent > 80) {
      violations.push({
        severity: 'WARNING',
        code: 'WARN_HIGH_PANEL_UTILIZATION',
        standardReference: 'NEC 408.36',
        message: `Panel loading is at ${mainBreakerUtilizationPercent}% of main breaker rating. National electrical codes recommend keeping continuous loads below 80% to avoid thermal de-rating.`,
        recommendation: 'Plan for subpanel load distribution if additional circuits are to be added.',
      });
    }

    // 5. Phase Balancing
    const maxPhase = Math.max(l1_Amps, l2_Amps, l3_Amps || 0);
    const minPhase = Math.min(l1_Amps, l2_Amps, ...(panel.phases === 3 ? [l3_Amps] : []));
    let phaseImbalancePercent = 0;

    if (maxPhase > 0) {
      phaseImbalancePercent = Math.round(((maxPhase - minPhase) / maxPhase) * 100);
    }

    if (phaseImbalancePercent > 20 && maxPhase > 15) {
      violations.push({
        severity: 'WARNING',
        code: 'WARN_PHASE_IMBALANCE',
        standardReference: 'IEEE 141 & IEC 61000',
        message: `Significant phase imbalance detected (${phaseImbalancePercent}% between Phase L1: ${l1_Amps.toFixed(1)}A and Phase L2: ${l2_Amps.toFixed(1)}A). Unbalanced loads cause excessive neutral current and transformer core heating.`,
        recommendation: 'Swap breaker busbar phases (L1 <-> L2) on heavy loads to distribute demand within 10% parity.',
      });
    }

    const hasErrors = violations.some(v => v.severity === 'ERROR');
    const hasWarnings = violations.some(v => v.severity === 'WARNING');

    const derivationSummary = `### ⚡ Electrical Panel Engineering Telemetry & Compliance Report
- **Panel Model**: ${panel.panelId} (${panel.voltageSystem}, Main Disconnect: **${panel.mainRatingAmps}A**, Busbar: **${panel.busbarRatingAmps}A**)
- **Total Connected Load**: ${totalConnectedLoadAmps.toFixed(1)}A
- **Diversified Demand (80% factor)**: **${diversifiedDemandAmps.toFixed(1)}A** (${mainBreakerUtilizationPercent}% of main capacity)
- **Phase Distribution**: L1: **${l1_Amps.toFixed(1)}A** | L2: **${l2_Amps.toFixed(1)}A** (Phase Delta: **${phaseImbalancePercent}%**)
- **NEC/IEC Compliance Status**: **${hasErrors ? 'NON-COMPLIANT (Safety Violations Detected)' : hasWarnings ? 'COMPLIANT WITH WARNINGS' : 'FULLY COMPLIANT'}**`;

    return {
      valid: !hasErrors,
      status: hasErrors ? 'NON_COMPLIANT' : hasWarnings ? 'WARNINGS' : 'COMPLIANT',
      totalConnectedLoadAmps,
      diversifiedDemandAmps,
      phaseLoads: {
        L1_Amps: l1_Amps,
        L2_Amps: l2_Amps,
        L3_Amps: panel.phases === 3 ? l3_Amps : undefined,
      },
      phaseImbalancePercent,
      busbarUtilizationPercent,
      mainBreakerUtilizationPercent,
      violations,
      derivationSummary,
    };
  }

  private getMinAwgForAmps(amps: number): number {
    if (amps <= 15) return 14;
    if (amps <= 20) return 12;
    if (amps <= 30) return 10;
    if (amps <= 40) return 8;
    if (amps <= 55) return 6;
    if (amps <= 70) return 4;
    return 2;
  }

  private getNextStandardBreakerRating(amps: number): number {
    const standardRatings = [10, 15, 16, 20, 25, 30, 32, 40, 50, 60, 63, 70, 80, 90, 100, 125, 150, 200];
    for (const r of standardRatings) {
      if (r >= amps) return r;
    }
    return Math.ceil(amps / 10) * 10;
  }
}

export const electricalPanelEngine = new ElectricalPanelEngine();
