import { describe, it, expect } from 'vitest';
import {
  validateMaxnetConfig,
  isConverged,
  createMaxnetState,
  maxnetStep,
  runMaxnet,
} from '../maxnet';

describe('MAXNET', () => {
  // ─── Hand-Calculated Example ──────────────────────────────────────
  describe('hand-calculated step', () => {
    it('should compute one step correctly with ε=0.1 and activations [0.6, 0.4, 0.2]', () => {
      // m=3, ε=0.1 (valid since 0.1 < 1/3 ≈ 0.333)
      // Step 1:
      //   a_0(1) = max(0, 0.6 - 0.1*(0.4+0.2)) = max(0, 0.6 - 0.06) = 0.54
      //   a_1(1) = max(0, 0.4 - 0.1*(0.6+0.2)) = max(0, 0.4 - 0.08) = 0.32
      //   a_2(1) = max(0, 0.2 - 0.1*(0.6+0.4)) = max(0, 0.2 - 0.10) = 0.10
      const state = createMaxnetState([0.6, 0.4, 0.2], {
        epsilon: 0.1,
        maxIterations: 100,
      });
      const next = maxnetStep(state);

      expect(next.activations[0]).toBeCloseTo(0.54, 10);
      expect(next.activations[1]).toBeCloseTo(0.32, 10);
      expect(next.activations[2]).toBeCloseTo(0.10, 10);
      expect(next.iteration).toBe(1);
      expect(next.converged).toBe(false);
    });

    it('should compute second step correctly', () => {
      // From [0.54, 0.32, 0.10]:
      //   a_0(2) = max(0, 0.54 - 0.1*(0.32+0.10)) = max(0, 0.54 - 0.042) = 0.498
      //   a_1(2) = max(0, 0.32 - 0.1*(0.54+0.10)) = max(0, 0.32 - 0.064) = 0.256
      //   a_2(2) = max(0, 0.10 - 0.1*(0.54+0.32)) = max(0, 0.10 - 0.086) = 0.014
      const state = createMaxnetState([0.6, 0.4, 0.2], {
        epsilon: 0.1,
        maxIterations: 100,
      });
      const step1 = maxnetStep(state);
      const step2 = maxnetStep(step1);

      expect(step2.activations[0]).toBeCloseTo(0.498, 10);
      expect(step2.activations[1]).toBeCloseTo(0.256, 10);
      expect(step2.activations[2]).toBeCloseTo(0.014, 10);
      expect(step2.iteration).toBe(2);
    });
  });

  // ─── Convergence ──────────────────────────────────────────────────
  describe('convergence', () => {
    it('should converge to a single winner for distinct activations', () => {
      const result = runMaxnet([0.8, 0.3, 0.1], {
        epsilon: 0.2,
        maxIterations: 200,
      });
      expect(result.converged).toBe(true);

      // Only node 0 should remain positive
      const positiveNodes = result.activations.filter((a) => a > 0);
      expect(positiveNodes.length).toBe(1);
      expect(result.activations[0]).toBeGreaterThan(0);
    });

    it('should pick the largest initial activation as the winner', () => {
      const result = runMaxnet([0.1, 0.9, 0.5, 0.3], {
        epsilon: 0.1,
        maxIterations: 200,
      });
      expect(result.converged).toBe(true);
      expect(result.activations[1]).toBeGreaterThan(0);
      expect(result.activations[0]).toBe(0);
      expect(result.activations[2]).toBe(0);
      expect(result.activations[3]).toBe(0);
    });

    it('should respect maxIterations limit', () => {
      // With very small epsilon, convergence is slow
      const result = runMaxnet([0.5, 0.4999], {
        epsilon: 0.01,
        maxIterations: 3,
      });
      expect(result.iteration).toBeLessThanOrEqual(3);
    });
  });

  // ─── isConverged ──────────────────────────────────────────────────
  describe('isConverged', () => {
    it('should return true for all zeros', () => {
      expect(isConverged([0, 0, 0])).toBe(true);
    });

    it('should return true for exactly one positive', () => {
      expect(isConverged([0, 0.5, 0])).toBe(true);
    });

    it('should return false for two positives', () => {
      expect(isConverged([0.1, 0.2, 0])).toBe(false);
    });

    it('should return true for empty array', () => {
      expect(isConverged([])).toBe(true);
    });
  });

  // ─── Validation ───────────────────────────────────────────────────
  describe('validateMaxnetConfig', () => {
    it('should reject epsilon <= 0', () => {
      expect(() =>
        validateMaxnetConfig({ epsilon: 0, maxIterations: 100 })
      ).toThrow('Epsilon must be positive');
    });

    it('should reject epsilon >= 1/m', () => {
      expect(() =>
        validateMaxnetConfig({ epsilon: 0.5, maxIterations: 100 }, 2)
      ).toThrow('Epsilon must be < 1/m');
    });

    it('should accept valid epsilon', () => {
      expect(() =>
        validateMaxnetConfig({ epsilon: 0.1, maxIterations: 100 }, 5)
      ).not.toThrow();
    });

    it('should reject maxIterations < 1', () => {
      expect(() =>
        validateMaxnetConfig({ epsilon: 0.1, maxIterations: 0 })
      ).toThrow('maxIterations must be >= 1');
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────────
  describe('edge cases', () => {
    it('should handle single node (already converged)', () => {
      const result = runMaxnet([5], { epsilon: 0.1, maxIterations: 100 });
      expect(result.converged).toBe(true);
      expect(result.iteration).toBe(0);
      expect(result.activations[0]).toBe(5);
    });

    it('should handle tied activations (both suppressed symmetrically)', () => {
      // Two equal values: both are suppressed symmetrically
      // a_0(1) = max(0, 0.5 - 0.25*0.5) = max(0, 0.375) = 0.375
      // a_1(1) = max(0, 0.5 - 0.25*0.5) = max(0, 0.375) = 0.375
      // They stay tied and eventually both go to zero
      const result = runMaxnet([0.5, 0.5], {
        epsilon: 0.25,
        maxIterations: 200,
      });
      // With perfect tie, both should decay to 0 together or remain tied
      // Eventually both reach 0 → converged
      expect(result.converged).toBe(true);
    });

    it('should handle all-zero activations', () => {
      const result = runMaxnet([0, 0, 0], {
        epsilon: 0.1,
        maxIterations: 10,
      });
      expect(result.converged).toBe(true);
      expect(result.iteration).toBe(0);
    });

    it('should record full history', () => {
      const result = runMaxnet([0.6, 0.2], {
        epsilon: 0.3,
        maxIterations: 100,
      });
      // History should have iteration+1 entries (including the initial)
      expect(result.history.length).toBe(result.iteration + 1);
      // First entry is the original activations
      expect(result.history[0]).toEqual([0.6, 0.2]);
    });

    it('should clamp negative values to zero (ReLU)', () => {
      // a_0(1) = max(0, 0.1 - 0.3 * 0.9) = max(0, 0.1 - 0.27) = max(0, -0.17) = 0
      // a_1(1) = max(0, 0.9 - 0.3 * 0.1) = max(0, 0.9 - 0.03) = 0.87
      const state = createMaxnetState([0.1, 0.9], {
        epsilon: 0.3,
        maxIterations: 100,
      });
      const next = maxnetStep(state);
      expect(next.activations[0]).toBe(0);
      expect(next.activations[1]).toBeCloseTo(0.87, 10);
    });
  });
});
