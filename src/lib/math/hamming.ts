/**
 * Hamming Network - Associative Memory Pattern Classifier
 *
 * A two-layer neural network for binary pattern recognition:
 *   1. **Layer 1 (Matching)**: Computes similarity between the input
 *      and each stored pattern using Hamming similarity:
 *        similarity_j = n − hammingDistance(input, pattern_j)
 *   2. **Layer 2 (Competition)**: Feeds similarities into MAXNET
 *      to find the single winning (most similar) pattern.
 *
 * @module hamming
 */

import {
  type MaxnetConfig,
  type MaxnetState,
  runMaxnet,
} from './maxnet';

/** Configuration for the Hamming Network. */
export interface HammingNetConfig {
  /** Stored binary patterns (each pattern is an array of 0s and 1s). */
  patterns: number[][];
  /** Length of each input/pattern vector. */
  inputLength: number;
}

/** Complete state of a Hamming Network computation. */
export interface HammingNetState {
  /** The input vector that was classified. */
  input: number[];
  /** The stored patterns the input was compared against. */
  patterns: number[][];
  /** Hamming distances from input to each pattern. */
  distances: number[];
  /** Hamming similarities (n − distance) for each pattern. */
  similarities: number[];
  /** State of the MAXNET competition layer after convergence. */
  maxnetState: MaxnetState;
  /** Index of the winning pattern, or null if no winner. */
  winner: number | null;
  /** True if there was a tie (multiple patterns equally similar). */
  tied: boolean;
}

/**
 * Compute the Hamming distance between two binary vectors.
 *
 * Hamming distance counts the number of positions where the
 * corresponding bits differ:
 *
 *   d(a, b) = Σ_i (a_i ⊕ b_i)    where ⊕ is XOR
 *
 * @param a - First binary vector (0s and 1s).
 * @param b - Second binary vector (0s and 1s).
 * @returns The number of differing bit positions.
 * @throws {Error} If vectors have different lengths.
 */
export function hammingDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vectors must have equal length: got ${a.length} and ${b.length}`
    );
  }
  let dist = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      dist++;
    }
  }
  return dist;
}

/**
 * Compute the Hamming similarity between two binary vectors.
 *
 *   similarity(a, b) = n − hammingDistance(a, b)
 *
 * where n is the vector length. A higher value means the vectors
 * are more alike.
 *
 * @param a - First binary vector.
 * @param b - Second binary vector.
 * @param n - Length of the vectors (used as the base count).
 * @returns The Hamming similarity value.
 */
export function hammingSimilarity(
  a: number[],
  b: number[],
  n: number
): number {
  return n - hammingDistance(a, b);
}

/**
 * Compute Hamming distances from an input to all stored patterns.
 *
 * @param input - The input binary vector.
 * @param patterns - Array of stored binary patterns.
 * @returns Array of Hamming distances (one per pattern).
 */
export function computeAllDistances(
  input: number[],
  patterns: number[][]
): number[] {
  return patterns.map((p) => hammingDistance(input, p));
}

/**
 * Compute Hamming similarities from an input to all stored patterns.
 *
 * @param input - The input binary vector.
 * @param patterns - Array of stored binary patterns.
 * @param n - Length of the vectors.
 * @returns Array of Hamming similarities (one per pattern).
 */
export function computeAllSimilarities(
  input: number[],
  patterns: number[][],
  n: number
): number[] {
  return patterns.map((p) => hammingSimilarity(input, p, n));
}

/**
 * Run the full Hamming Network: compute similarities then use MAXNET
 * to select the winning pattern.
 *
 * Steps:
 *   1. Compute Hamming similarity for each stored pattern.
 *   2. Feed similarities as initial activations into MAXNET.
 *   3. MAXNET competes until one winner emerges (or tie/maxIter).
 *   4. The surviving node index identifies the winning pattern.
 *
 * @param input - Binary input vector.
 * @param patterns - Stored binary patterns.
 * @param epsilon - MAXNET inhibition parameter (default: 1/(2m) where m = number of patterns).
 * @returns The complete HammingNetState.
 * @throws {Error} If input or patterns are invalid.
 */
export function runHammingNet(
  input: number[],
  patterns: number[][],
  epsilon?: number
): HammingNetState {
  if (patterns.length === 0) {
    throw new Error('At least one stored pattern is required');
  }
  const n = input.length;
  for (let i = 0; i < patterns.length; i++) {
    if (patterns[i].length !== n) {
      throw new Error(
        `Pattern ${i} has length ${patterns[i].length}, expected ${n}`
      );
    }
  }

  const m = patterns.length;
  const distances = computeAllDistances(input, patterns);
  const similarities = computeAllSimilarities(input, patterns, n);

  // Default epsilon: 1/(2m) ensures 0 < ε < 1/m
  const eps = epsilon ?? 1 / (2 * m);

  const maxnetConfig: MaxnetConfig = {
    epsilon: eps,
    maxIterations: 100,
  };

  const maxnetState = runMaxnet(similarities, maxnetConfig);

  // Check if multiple patterns share the maximum similarity
  const maxSim = Math.max(...similarities);
  const maxSimCount = similarities.filter((s) => s === maxSim).length;
  const initialTie = maxSimCount > 1;

  // Determine winner: the index of the remaining positive activation
  let winner: number | null = null;
  let positiveCount = 0;
  for (let i = 0; i < maxnetState.activations.length; i++) {
    if (maxnetState.activations[i] > 0) {
      winner = i;
      positiveCount++;
    }
  }

  const tied = initialTie || positiveCount > 1 || (positiveCount === 0 && maxSim > 0);
  if (positiveCount === 0) {
    winner = null;
  } else if (positiveCount > 1) {
    // Pick first positive if tied without extinction
    for (let i = 0; i < maxnetState.activations.length; i++) {
      if (maxnetState.activations[i] > 0) {
        winner = i;
        break;
      }
    }
  }

  return {
    input: [...input],
    patterns: patterns.map((p) => [...p]),
    distances,
    similarities,
    maxnetState,
    winner,
    tied,
  };
}

/**
 * Create a noisy copy of a binary pattern by flipping specific bit positions.
 *
 * @param pattern - Original binary pattern.
 * @param indices - Indices of bits to flip (0→1 or 1→0).
 * @returns A new pattern with the specified bits flipped.
 */
export function flipBits(pattern: number[], indices: number[]): number[] {
  const result = [...pattern];
  for (const idx of indices) {
    if (idx < 0 || idx >= result.length) {
      throw new Error(`Index ${idx} out of range [0, ${result.length})`);
    }
    result[idx] = result[idx] === 0 ? 1 : 0;
  }
  return result;
}

/**
 * Add random noise to a binary pattern by flipping bits with a given probability.
 *
 * Uses a seeded PRNG (mulberry32) for deterministic results when seed is provided.
 *
 * @param pattern - Original binary pattern.
 * @param noiseRate - Probability of flipping each bit (0 to 1).
 * @param seed - Optional seed for deterministic noise.
 * @returns A new pattern with random noise applied.
 */
export function addNoise(
  pattern: number[],
  noiseRate: number,
  seed?: number
): number[] {
  if (noiseRate < 0 || noiseRate > 1) {
    throw new Error(`Noise rate must be in [0, 1], got ${noiseRate}`);
  }

  // Simple mulberry32 PRNG inlined for independence
  let state = (seed ?? Date.now()) | 0;
  const rng = () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const result = [...pattern];
  for (let i = 0; i < result.length; i++) {
    if (rng() < noiseRate) {
      result[i] = result[i] === 0 ? 1 : 0;
    }
  }
  return result;
}
