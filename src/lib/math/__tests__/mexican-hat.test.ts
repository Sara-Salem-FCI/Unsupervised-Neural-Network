import { describe, it, expect } from 'vitest';
import {
  mexicanHat,
  mexicanHatProfile,
  findZeroCrossing,
  computeInteractionGrid,
  validateMexicanHatParams,
  gaussianNeighborhood,
  type MexicanHatParams,
} from '../mexican-hat';

describe('Mexican Hat', () => {
  const defaultParams: MexicanHatParams = {
    excitationAmplitude: 1.0,
    inhibitionAmplitude: 0.5,
    excitationWidth: 1.0,
    inhibitionWidth: 3.0,
  };

  // ─── Hand-Calculated Values ───────────────────────────────────────
  describe('hand-calculated values', () => {
    it('should compute h(0) = Ae - Ai', () => {
      // At r=0: h(0) = Ae * exp(0) - Ai * exp(0) = Ae - Ai = 1.0 - 0.5 = 0.5
      expect(mexicanHat(0, defaultParams)).toBeCloseTo(0.5, 10);
    });

    it('should compute h(r) correctly for r=1', () => {
      // h(1) = 1.0 * exp(-1/(2*1)) - 0.5 * exp(-1/(2*9))
      //      = 1.0 * exp(-0.5) - 0.5 * exp(-1/18)
      //      = 0.60653... - 0.5 * 0.94595...
      //      = 0.60653... - 0.47298...
      //      = 0.13355...
      const expected =
        1.0 * Math.exp(-0.5) - 0.5 * Math.exp(-1 / 18);
      expect(mexicanHat(1, defaultParams)).toBeCloseTo(expected, 10);
    });

    it('should compute h(r) correctly for large r (negative value)', () => {
      // At large r, excitation decays faster → result should be negative
      // h(5) = 1.0 * exp(-25/2) - 0.5 * exp(-25/18)
      //      ≈ 3.73e-6 - 0.5 * 0.24935 ≈ -0.12467
      const expected =
        1.0 * Math.exp(-25 / 2) - 0.5 * Math.exp(-25 / 18);
      expect(mexicanHat(5, defaultParams)).toBeCloseTo(expected, 10);
      expect(mexicanHat(5, defaultParams)).toBeLessThan(0);
    });

    it('should be symmetric: h(r) = h(-r)', () => {
      expect(mexicanHat(2, defaultParams)).toBeCloseTo(
        mexicanHat(-2, defaultParams),
        10
      );
    });

    it('should compute equal amplitude params as pure difference', () => {
      // When Ae = Ai, h(0) = 0
      const equalParams: MexicanHatParams = {
        excitationAmplitude: 1.0,
        inhibitionAmplitude: 1.0,
        excitationWidth: 1.0,
        inhibitionWidth: 2.0,
      };
      expect(mexicanHat(0, equalParams)).toBeCloseTo(0, 10);
    });
  });

  // ─── Profile ──────────────────────────────────────────────────────
  describe('mexicanHatProfile', () => {
    it('should compute profile for array of distances', () => {
      const distances = [0, 1, 2, 3];
      const profile = mexicanHatProfile(distances, defaultParams);
      expect(profile.length).toBe(4);
      expect(profile[0]).toBeCloseTo(0.5, 10);
      // Verify each matches individual call
      for (let i = 0; i < distances.length; i++) {
        expect(profile[i]).toBeCloseTo(
          mexicanHat(distances[i], defaultParams),
          10
        );
      }
    });

    it('should handle empty distance array', () => {
      expect(mexicanHatProfile([], defaultParams)).toEqual([]);
    });
  });

  // ─── Zero Crossing ────────────────────────────────────────────────
  describe('findZeroCrossing', () => {
    it('should find zero crossing for default params', () => {
      // r² = ln(Ae/Ai) / (1/(2σe²) - 1/(2σi²))
      // r² = ln(1.0/0.5) / (1/2 - 1/18)
      // r² = ln(2) / (9/18 - 1/18)
      // r² = 0.6931... / (8/18) = 0.6931... / 0.4444...
      // r² = 1.5595...
      // r  = 1.2488...
      const r = findZeroCrossing(defaultParams);
      expect(r).not.toBeNull();

      const expectedRSq = Math.log(2) / (1 / 2 - 1 / 18);
      expect(r).toBeCloseTo(Math.sqrt(expectedRSq), 8);

      // Verify h(r) ≈ 0 at the zero crossing
      expect(mexicanHat(r!, defaultParams)).toBeCloseTo(0, 8);
    });

    it('should return null when no zero crossing exists', () => {
      // When Ae < Ai, the function is always negative (no crossing for r>0
      // unless the width relationship makes it positive near 0).
      // Actually with Ae < Ai but same widths difference, ln(Ae/Ai) < 0
      // and denominator > 0 (since σi > σe), so r² < 0 → no crossing.
      const params: MexicanHatParams = {
        excitationAmplitude: 0.3,
        inhibitionAmplitude: 1.0,
        excitationWidth: 1.0,
        inhibitionWidth: 3.0,
      };
      // ln(0.3/1.0) = ln(0.3) < 0, denominator = 1/2 - 1/18 > 0 → r² < 0
      const r = findZeroCrossing(params);
      expect(r).toBeNull();
    });
  });

  // ─── Interaction Grid ─────────────────────────────────────────────
  describe('computeInteractionGrid', () => {
    it('should produce correct grid dimensions', () => {
      const grid = computeInteractionGrid(5, 2, 2, defaultParams);
      expect(grid.length).toBe(5);
      expect(grid[0].length).toBe(5);
    });

    it('should have maximum at center', () => {
      const grid = computeInteractionGrid(7, 3, 3, defaultParams);
      const centerVal = grid[3][3];
      // Center should have highest value
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          expect(centerVal).toBeGreaterThanOrEqual(grid[i][j]);
        }
      }
    });

    it('should be symmetric around center', () => {
      const grid = computeInteractionGrid(5, 2, 2, defaultParams);
      // (1,2) and (3,2) are equidistant from center (2,2)
      expect(grid[1][2]).toBeCloseTo(grid[3][2], 10);
      // (2,1) and (2,3) are equidistant from center
      expect(grid[2][1]).toBeCloseTo(grid[2][3], 10);
    });
  });

  // ─── Validation ───────────────────────────────────────────────────
  describe('validateMexicanHatParams', () => {
    it('should accept valid params', () => {
      expect(validateMexicanHatParams(defaultParams)).toBe(true);
    });

    it('should reject negative excitation amplitude', () => {
      expect(
        validateMexicanHatParams({ ...defaultParams, excitationAmplitude: -1 })
      ).toBe(false);
    });

    it('should reject inhibition width <= excitation width', () => {
      expect(
        validateMexicanHatParams({ ...defaultParams, inhibitionWidth: 0.5 })
      ).toBe(false);
    });

    it('should reject zero excitation width', () => {
      expect(
        validateMexicanHatParams({ ...defaultParams, excitationWidth: 0 })
      ).toBe(false);
    });
  });

  // ─── Gaussian Neighborhood ────────────────────────────────────────
  describe('gaussianNeighborhood', () => {
    it('should return 1 at distance 0', () => {
      expect(gaussianNeighborhood(0, 1.0)).toBeCloseTo(1.0, 10);
    });

    it('should return exp(-0.5) at distance = sigma', () => {
      expect(gaussianNeighborhood(2.0, 2.0)).toBeCloseTo(
        Math.exp(-0.5),
        10
      );
    });

    it('should throw for non-positive sigma', () => {
      expect(() => gaussianNeighborhood(1, 0)).toThrow('Sigma must be positive');
      expect(() => gaussianNeighborhood(1, -1)).toThrow('Sigma must be positive');
    });
  });
});
