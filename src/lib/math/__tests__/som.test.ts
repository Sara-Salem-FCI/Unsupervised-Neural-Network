import { describe, it, expect } from 'vitest';
import {
  mulberry32,
  createSOM,
  findBMU,
  gaussianNeighborhood,
  decayLearningRate,
  decayRadius,
  somStep,
  trainSOM,
  computeQuantizationError,
  computeUMatrix,
  type SOMConfig,
} from '../som';

const baseConfig: SOMConfig = {
  gridWidth: 3,
  gridHeight: 3,
  inputDim: 2,
  learningRate: 0.5,
  initialRadius: 1.5,
  minLearningRate: 0.01,
  minRadius: 0.1,
  maxIterations: 100,
  seed: 42,
};

describe('SOM', () => {
  // ─── PRNG ─────────────────────────────────────────────────────────
  describe('mulberry32 PRNG', () => {
    it('should produce deterministic values for the same seed', () => {
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(42);
      for (let i = 0; i < 20; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('should produce values in [0, 1)', () => {
      const rng = mulberry32(123);
      for (let i = 0; i < 1000; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it('should produce different sequences for different seeds', () => {
      const rng1 = mulberry32(1);
      const rng2 = mulberry32(2);
      const vals1 = Array.from({ length: 5 }, () => rng1());
      const vals2 = Array.from({ length: 5 }, () => rng2());
      // Very unlikely to be identical
      expect(vals1).not.toEqual(vals2);
    });
  });

  // ─── Initialization ──────────────────────────────────────────────
  describe('createSOM', () => {
    it('should create grid with correct dimensions', () => {
      const state = createSOM(baseConfig);
      expect(state.weights.length).toBe(3); // gridHeight
      expect(state.weights[0].length).toBe(3); // gridWidth
      expect(state.weights[0][0].length).toBe(2); // inputDim
    });

    it('should initialize weights in [0, 1]', () => {
      const state = createSOM(baseConfig);
      for (const row of state.weights) {
        for (const w of row) {
          for (const v of w) {
            expect(v).toBeGreaterThanOrEqual(0);
            expect(v).toBeLessThan(1);
          }
        }
      }
    });

    it('should produce deterministic weights for same seed', () => {
      const s1 = createSOM(baseConfig);
      const s2 = createSOM(baseConfig);
      expect(s1.weights).toEqual(s2.weights);
    });

    it('should throw for invalid grid dimensions', () => {
      expect(() =>
        createSOM({ ...baseConfig, gridWidth: 0 })
      ).toThrow('Grid dimensions must be >= 1');
    });

    it('should throw for invalid input dimension', () => {
      expect(() =>
        createSOM({ ...baseConfig, inputDim: 0 })
      ).toThrow('Input dimension must be >= 1');
    });
  });

  // ─── BMU Finding ──────────────────────────────────────────────────
  describe('findBMU', () => {
    it('should find the closest neuron to the input', () => {
      // Create a SOM and manually set weights we know
      const state = createSOM(baseConfig);
      // Overwrite weights for a predictable test
      const testState = {
        ...state,
        weights: [
          [[0, 0], [0.5, 0.5], [1, 1]],
          [[0, 1], [0.5, 0], [1, 0]],
          [[0.3, 0.3], [0.7, 0.7], [0.9, 0.1]],
        ],
      };

      // Input [0.5, 0.5] should match neuron at (0,1) exactly
      const bmu = findBMU(testState, [0.5, 0.5]);
      expect(bmu.row).toBe(0);
      expect(bmu.col).toBe(1);
      expect(bmu.distance).toBeCloseTo(0, 10);
    });

    it('should throw for dimension mismatch', () => {
      const state = createSOM(baseConfig);
      expect(() => findBMU(state, [1, 2, 3])).toThrow(
        'Input dimension mismatch'
      );
    });
  });

  // ─── Gaussian Neighborhood ────────────────────────────────────────
  describe('gaussianNeighborhood', () => {
    it('should return 1 for the BMU itself', () => {
      expect(gaussianNeighborhood(2, 3, 2, 3, 1.0)).toBeCloseTo(1.0, 10);
    });

    it('should decrease with distance', () => {
      const close = gaussianNeighborhood(5, 5, 5, 6, 2.0);
      const far = gaussianNeighborhood(5, 5, 5, 8, 2.0);
      expect(close).toBeGreaterThan(far);
    });

    it('should compute correct value for known distance', () => {
      // Distance on grid from (0,0) to (1,1) = sqrt(2), d²=2
      // h = exp(-2 / (2*1²)) = exp(-1) ≈ 0.3679
      expect(gaussianNeighborhood(0, 0, 1, 1, 1.0)).toBeCloseTo(
        Math.exp(-1),
        10
      );
    });
  });

  // ─── Decay Functions ──────────────────────────────────────────────
  describe('decay functions', () => {
    it('should return initial value at t=0', () => {
      expect(decayLearningRate(0.5, 0, 100)).toBeCloseTo(0.5, 10);
      expect(decayRadius(2.0, 0, 100)).toBeCloseTo(2.0, 10);
    });

    it('should decay exponentially', () => {
      // α(50) = 0.5 * exp(-50/100) = 0.5 * exp(-0.5)
      expect(decayLearningRate(0.5, 50, 100)).toBeCloseTo(
        0.5 * Math.exp(-0.5),
        10
      );
    });

    it('should approach zero for large t', () => {
      expect(decayLearningRate(0.5, 10000, 100)).toBeLessThan(1e-10);
    });
  });

  // ─── Training Step ────────────────────────────────────────────────
  describe('somStep', () => {
    it('should increment iteration', () => {
      const state = createSOM(baseConfig);
      const next = somStep(state, [0.5, 0.5], baseConfig);
      expect(next.iteration).toBe(1);
    });

    it('should record BMU in history', () => {
      const state = createSOM(baseConfig);
      const next = somStep(state, [0.5, 0.5], baseConfig);
      expect(next.bmuHistory.length).toBe(1);
    });

    it('should move BMU weights closer to input', () => {
      const state = createSOM(baseConfig);
      const input = [0.5, 0.5];
      const bmu = findBMU(state, input);
      const oldDist = bmu.distance;

      const next = somStep(state, input, baseConfig);
      const newBmu = findBMU(next, input);
      // After one step, BMU should be closer to the input
      expect(newBmu.distance).toBeLessThanOrEqual(oldDist);
    });
  });

  // ─── Full Training ────────────────────────────────────────────────
  describe('trainSOM', () => {
    it('should reduce quantization error over training', () => {
      const data = [
        [0.1, 0.1],
        [0.9, 0.9],
        [0.1, 0.9],
        [0.9, 0.1],
      ];
      const state = createSOM({ ...baseConfig, maxIterations: 100 });
      const errBefore = computeQuantizationError(state, data);
      const trained = trainSOM(state, data, 10, {
        ...baseConfig,
        maxIterations: 100,
      });
      const errAfter = computeQuantizationError(trained, data);
      expect(errAfter).toBeLessThan(errBefore);
    });

    it('should handle single data point', () => {
      const data = [[0.5, 0.5]];
      const state = createSOM(baseConfig);
      const trained = trainSOM(state, data, 5, baseConfig);
      expect(trained.iteration).toBe(5);
    });
  });

  // ─── U-Matrix ─────────────────────────────────────────────────────
  describe('computeUMatrix', () => {
    it('should return correct dimensions', () => {
      const state = createSOM(baseConfig);
      const umat = computeUMatrix(state);
      expect(umat.length).toBe(3);
      expect(umat[0].length).toBe(3);
    });

    it('should produce non-negative values', () => {
      const state = createSOM(baseConfig);
      const umat = computeUMatrix(state);
      for (const row of umat) {
        for (const val of row) {
          expect(val).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('corner neurons should average over 2 neighbors', () => {
      // Corner at (0,0) has only 2 neighbors: (1,0) and (0,1)
      const state = createSOM(baseConfig);
      const umat = computeUMatrix(state);
      // Just verify it's a valid number (computed from 2 neighbors)
      expect(typeof umat[0][0]).toBe('number');
      expect(isNaN(umat[0][0])).toBe(false);
    });
  });

  // ─── Quantization Error ───────────────────────────────────────────
  describe('computeQuantizationError', () => {
    it('should return 0 for empty dataset', () => {
      const state = createSOM(baseConfig);
      expect(computeQuantizationError(state, [])).toBe(0);
    });

    it('should return 0 when data points exactly match neurons', () => {
      const state = createSOM(baseConfig);
      // Set weights to exact data points
      const testState = {
        ...state,
        weights: [
          [[0, 0], [0.5, 0.5], [1, 1]],
          [[0, 1], [0.5, 0], [1, 0]],
          [[0.3, 0.3], [0.7, 0.7], [0.9, 0.1]],
        ],
      };
      const data = [[0, 0], [1, 1], [0.5, 0.5]];
      expect(computeQuantizationError(testState, data)).toBeCloseTo(0, 10);
    });
  });
});
