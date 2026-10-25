import { describe, it, expect } from 'vitest';
import {
  hammingDistance,
  hammingSimilarity,
  computeAllDistances,
  computeAllSimilarities,
  runHammingNet,
  flipBits,
  addNoise,
} from '../hamming';

describe('Hamming Network', () => {
  // ─── Hamming Distance ─────────────────────────────────────────────
  describe('hammingDistance', () => {
    it('should compute distance between identical vectors as 0', () => {
      expect(hammingDistance([1, 0, 1, 1], [1, 0, 1, 1])).toBe(0);
    });

    it('should compute distance between completely different vectors', () => {
      expect(hammingDistance([0, 0, 0, 0], [1, 1, 1, 1])).toBe(4);
    });

    it('should count individual differing positions', () => {
      // Hand-calculated: positions 0 and 3 differ → distance = 2
      expect(hammingDistance([1, 0, 1, 0], [0, 0, 1, 1])).toBe(2);
    });

    it('should throw for mismatched lengths', () => {
      expect(() => hammingDistance([1, 0], [1, 0, 1])).toThrow(
        'Vectors must have equal length'
      );
    });

    it('should handle empty vectors', () => {
      expect(hammingDistance([], [])).toBe(0);
    });
  });

  // ─── Hamming Similarity ───────────────────────────────────────────
  describe('hammingSimilarity', () => {
    it('should be n for identical vectors', () => {
      expect(hammingSimilarity([1, 0, 1], [1, 0, 1], 3)).toBe(3);
    });

    it('should be 0 for completely different vectors', () => {
      expect(hammingSimilarity([0, 0, 0], [1, 1, 1], 3)).toBe(0);
    });

    it('should compute n - distance correctly', () => {
      // Distance = 2, n = 5 → similarity = 3
      expect(
        hammingSimilarity([1, 1, 0, 0, 1], [0, 1, 0, 1, 1], 5)
      ).toBe(3);
    });
  });

  // ─── Batch Computations ───────────────────────────────────────────
  describe('computeAllDistances / computeAllSimilarities', () => {
    const patterns = [
      [1, 1, 1, 0],
      [0, 0, 1, 1],
      [1, 0, 0, 0],
    ];
    const input = [1, 1, 0, 0];

    it('should compute all distances', () => {
      const dists = computeAllDistances(input, patterns);
      // vs [1,1,1,0]: pos 2 differs → 1
      // vs [0,0,1,1]: pos 0,1,2,3 → 0≠1? no. wait:
      //   input=[1,1,0,0], p=[0,0,1,1] → diffs at pos 0,1,2,3 = 4
      // vs [1,0,0,0]: pos 1 differs → 1
      expect(dists).toEqual([1, 4, 1]);
    });

    it('should compute all similarities', () => {
      const sims = computeAllSimilarities(input, patterns, 4);
      // similarities = 4 - distances = [3, 0, 3]
      expect(sims).toEqual([3, 0, 3]);
    });
  });

  // ─── Full Hamming Network ─────────────────────────────────────────
  describe('runHammingNet', () => {
    it('should identify the closest pattern', () => {
      const patterns = [
        [1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 1, 1],
        [1, 0, 1, 0, 1, 0],
      ];
      // Input is closest to pattern 0 (differs in 1 bit at position 3)
      const input = [1, 1, 1, 0, 0, 0];
      const result = runHammingNet(input, patterns);

      expect(result.winner).toBe(0);
      expect(result.distances[0]).toBe(1);
      expect(result.similarities[0]).toBe(5);
      expect(result.tied).toBe(false);
    });

    it('should handle exact match (distance 0)', () => {
      const patterns = [
        [1, 0, 1],
        [0, 1, 0],
      ];
      const result = runHammingNet([1, 0, 1], patterns);
      expect(result.winner).toBe(0);
      expect(result.distances[0]).toBe(0);
      expect(result.similarities[0]).toBe(3);
    });

    it('should detect ties in similarity', () => {
      const patterns = [
        [1, 1, 0, 0],
        [0, 0, 1, 1],
      ];
      // Input differs from pattern 0 at pos 2,3 → dist=2, sim=2
      // Input differs from pattern 1 at pos 0,1 → dist=2, sim=2
      const input = [1, 1, 1, 1];
      // Similarities are [2, 2] - tied.
      // MAXNET with equal activations: both decay symmetrically → both go to 0 → tie
      const result = runHammingNet(input, patterns);
      // Both similarities are equal, so MAXNET should suppress both to 0
      expect(result.tied).toBe(true);
    });

    it('should use custom epsilon', () => {
      const patterns = [
        [1, 1, 0],
        [0, 0, 1],
      ];
      const result = runHammingNet([1, 1, 0], patterns, 0.1);
      expect(result.winner).toBe(0);
      expect(result.maxnetState.epsilon).toBe(0.1);
    });

    it('should throw for empty patterns', () => {
      expect(() => runHammingNet([1, 0], [])).toThrow(
        'At least one stored pattern is required'
      );
    });

    it('should throw for pattern length mismatch', () => {
      expect(() =>
        runHammingNet([1, 0], [[1, 0, 1]])
      ).toThrow('Pattern 0 has length 3, expected 2');
    });
  });

  // ─── flipBits ─────────────────────────────────────────────────────
  describe('flipBits', () => {
    it('should flip specified positions', () => {
      const result = flipBits([1, 1, 0, 0, 1], [0, 2]);
      expect(result).toEqual([0, 1, 1, 0, 1]);
    });

    it('should not mutate original', () => {
      const original = [1, 0, 1];
      flipBits(original, [0]);
      expect(original).toEqual([1, 0, 1]);
    });

    it('should throw for out-of-range index', () => {
      expect(() => flipBits([1, 0], [5])).toThrow('Index 5 out of range');
    });
  });

  // ─── addNoise ─────────────────────────────────────────────────────
  describe('addNoise', () => {
    it('should not flip any bits with noiseRate 0', () => {
      const result = addNoise([1, 0, 1, 0], 0, 42);
      expect(result).toEqual([1, 0, 1, 0]);
    });

    it('should produce deterministic results with seed', () => {
      const r1 = addNoise([1, 1, 0, 0, 1, 0, 1, 1], 0.3, 123);
      const r2 = addNoise([1, 1, 0, 0, 1, 0, 1, 1], 0.3, 123);
      expect(r1).toEqual(r2);
    });

    it('should throw for invalid noise rate', () => {
      expect(() => addNoise([1], 1.5, 42)).toThrow(
        'Noise rate must be in [0, 1]'
      );
      expect(() => addNoise([1], -0.1, 42)).toThrow(
        'Noise rate must be in [0, 1]'
      );
    });

    it('should not mutate original', () => {
      const original = [1, 0, 1, 0];
      addNoise(original, 0.5, 42);
      expect(original).toEqual([1, 0, 1, 0]);
    });
  });
});
