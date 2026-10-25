/**
 * Self-Organizing Map (Kohonen Map)
 *
 * An unsupervised competitive learning algorithm that maps high-dimensional
 * input data onto a 2D grid while preserving topological structure.
 *
 * Training loop for each input vector x:
 *   1. Find Best Matching Unit (BMU): argmin_j ||x - w_j||
 *   2. Update weights: w_j(t+1) = w_j(t) + α(t) · h(j, bmu, t) · (x - w_j(t))
 *      where h(j, bmu, t) = exp(-d²_grid / (2σ(t)²)) is the Gaussian neighborhood
 *   3. Decay learning rate: α(t) = α_0 · exp(-t / T)
 *   4. Decay radius: σ(t) = σ_0 · exp(-t / T)
 *
 * @module som
 */

/** Configuration for creating a Self-Organizing Map. */
export interface SOMConfig {
  /** Width of the 2D neuron grid. */
  gridWidth: number;
  /** Height of the 2D neuron grid. */
  gridHeight: number;
  /** Dimensionality of input vectors. */
  inputDim: number;
  /** Initial learning rate α_0. */
  learningRate: number;
  /** Initial neighborhood radius σ_0. */
  initialRadius: number;
  /** Minimum learning rate (floor). */
  minLearningRate: number;
  /** Minimum neighborhood radius (floor). */
  minRadius: number;
  /** Maximum number of total training iterations. */
  maxIterations: number;
  /** Seed for deterministic random weight initialization. */
  seed: number;
}

/** State of the SOM at a given point during training. */
export interface SOMState {
  /**
   * Weight vectors for each neuron.
   * Indexed as weights[row][col][dim].
   */
  weights: number[][][];
  /** Current training iteration (global across all epochs). */
  iteration: number;
  /** Grid width (stored for convenience). */
  gridWidth: number;
  /** Grid height (stored for convenience). */
  gridHeight: number;
  /** Dimensionality of input vectors. */
  inputDim: number;
  /** Current (possibly decayed) learning rate. */
  currentLearningRate: number;
  /** Current (possibly decayed) neighborhood radius. */
  currentRadius: number;
  /** History of BMU coordinates for recent inputs. */
  bmuHistory: { row: number; col: number }[];
  /** History of quantization errors during training. */
  quantizationErrors: number[];
  /** Optional config reference. */
  config?: SOMConfig;
}

/** Result of finding the Best Matching Unit. */
export interface BMUResult {
  /** Row index of the BMU on the grid. */
  row: number;
  /** Column index of the BMU on the grid. */
  col: number;
  /** Euclidean distance from the input to the BMU weight vector. */
  distance: number;
}

/**
 * Mulberry32 - A simple 32-bit seeded PRNG.
 *
 * Produces deterministic pseudo-random numbers in [0, 1) given a seed.
 * Based on the Mulberry32 algorithm by Tommy Ettinger.
 *
 * @param seed - Integer seed value.
 * @returns A function that returns the next pseudo-random number in [0, 1).
 */
export function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Create an initial SOM state with seeded random weights in [0, 1].
 *
 * @param config - SOM configuration.
 * @returns The initial SOMState with randomized weights.
 * @throws {Error} If configuration parameters are invalid.
 */
export function createSOM(config: SOMConfig): SOMState {
  const {
    gridWidth,
    gridHeight,
    inputDim,
    learningRate,
    initialRadius,
    seed,
  } = config;

  if (gridWidth < 1 || gridHeight < 1) {
    throw new Error(
      `Grid dimensions must be >= 1, got ${gridWidth}x${gridHeight}`
    );
  }
  if (inputDim < 1) {
    throw new Error(`Input dimension must be >= 1, got ${inputDim}`);
  }
  if (learningRate <= 0) {
    throw new Error(`Learning rate must be positive, got ${learningRate}`);
  }
  if (initialRadius <= 0) {
    throw new Error(`Initial radius must be positive, got ${initialRadius}`);
  }

  const rng = mulberry32(seed);

  // Initialize weights randomly in [0, 1]
  const weights: number[][][] = [];
  for (let r = 0; r < gridHeight; r++) {
    const row: number[][] = [];
    for (let c = 0; c < gridWidth; c++) {
      const w: number[] = [];
      for (let d = 0; d < inputDim; d++) {
        w.push(rng());
      }
      row.push(w);
    }
    weights.push(row);
  }

  return {
    weights,
    iteration: 0,
    gridWidth,
    gridHeight,
    inputDim,
    currentLearningRate: learningRate,
    currentRadius: initialRadius,
    bmuHistory: [],
    quantizationErrors: [],
    config: { ...config },
  };
}

/**
 * Compute the Euclidean distance between two vectors.
 *
 * @param a - First vector.
 * @param b - Second vector.
 * @returns The Euclidean distance ||a - b||.
 */
function euclideanDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Find the Best Matching Unit (BMU) for a given input vector.
 *
 * The BMU is the neuron whose weight vector is closest to the input
 * in Euclidean distance:
 *
 *   BMU = argmin_j ||x - w_j||
 *
 * @param state - Current SOM state.
 * @param input - Input vector of dimension inputDim.
 * @returns The BMU's grid coordinates and distance.
 * @throws {Error} If input dimension doesn't match.
 */
export function findBMU(state: SOMState, input: number[]): BMUResult {
  if (input.length !== state.inputDim) {
    throw new Error(
      `Input dimension mismatch: expected ${state.inputDim}, got ${input.length}`
    );
  }

  let bestRow = 0;
  let bestCol = 0;
  let bestDist = Infinity;

  for (let r = 0; r < state.gridHeight; r++) {
    for (let c = 0; c < state.gridWidth; c++) {
      const dist = euclideanDistance(input, state.weights[r][c]);
      if (dist < bestDist) {
        bestDist = dist;
        bestRow = r;
        bestCol = c;
      }
    }
  }

  return { row: bestRow, col: bestCol, distance: bestDist };
}

/**
 * Gaussian neighborhood function on the grid.
 *
 *   h(j, bmu, σ) = exp(-d²_grid / (2σ²))
 *
 * where d_grid is the Euclidean distance on the 2D grid (not input space).
 *
 * @param bmuRow - BMU row index.
 * @param bmuCol - BMU column index.
 * @param neuronRow - Target neuron row index.
 * @param neuronCol - Target neuron column index.
 * @param radius - Current neighborhood radius σ.
 * @returns The neighborhood influence value in [0, 1].
 */
export function gaussianNeighborhood(
  bmuRow: number,
  bmuCol: number,
  neuronRow: number,
  neuronCol: number,
  radius: number
): number {
  const dr = bmuRow - neuronRow;
  const dc = bmuCol - neuronCol;
  const distSq = dr * dr + dc * dc;
  return Math.exp(-distSq / (2 * radius * radius));
}

/**
 * Exponential decay for the learning rate.
 *
 *   α(t) = α_0 · exp(-t / T)
 *
 * @param initial - Initial learning rate α_0.
 * @param current - Current iteration t.
 * @param total - Total expected iterations T (time constant).
 * @returns The decayed learning rate.
 */
export function decayLearningRate(
  initial: number,
  current: number,
  total: number
): number {
  return initial * Math.exp(-current / total);
}

/**
 * Exponential decay for the neighborhood radius.
 *
 *   σ(t) = σ_0 · exp(-t / T)
 *
 * @param initial - Initial radius σ_0.
 * @param current - Current iteration t.
 * @param total - Total expected iterations T (time constant).
 * @returns The decayed radius.
 */
export function decayRadius(
  initial: number,
  current: number,
  total: number
): number {
  return initial * Math.exp(-current / total);
}

/**
 * Perform one SOM training step with a single input vector.
 *
 * Steps:
 *   1. Find BMU
 *   2. Decay learning rate and radius
 *   3. Update all neuron weights:
 *      w_j(t+1) = w_j(t) + α(t) · h(j, bmu, σ(t)) · (x - w_j(t))
 *
 * @param state - Current SOM state.
 * @param input - Input vector.
 * @param config - SOM configuration (needed for decay parameters).
 * @returns A new SOMState after the training step.
 */
export function somStep(state: SOMState, input: number[], config?: SOMConfig): SOMState {
  const cfg = config ?? state.config ?? {
    gridWidth: state.gridWidth,
    gridHeight: state.gridHeight,
    inputDim: state.inputDim,
    learningRate: state.currentLearningRate,
    initialRadius: state.currentRadius,
    minLearningRate: 0.01,
    minRadius: 0.5,
    maxIterations: 500,
    seed: 42,
  };

  // 1. Find BMU
  const bmu = findBMU(state, input);

  // 2. Decay parameters
  const newLR = Math.max(
    cfg.minLearningRate,
    decayLearningRate(cfg.learningRate, state.iteration, cfg.maxIterations)
  );
  const newRadius = Math.max(
    cfg.minRadius,
    decayRadius(cfg.initialRadius, state.iteration, cfg.maxIterations)
  );

  // 3. Update weights (immutable: create new weight arrays)
  const newWeights: number[][][] = [];
  for (let r = 0; r < state.gridHeight; r++) {
    const row: number[][] = [];
    for (let c = 0; c < state.gridWidth; c++) {
      const h = gaussianNeighborhood(bmu.row, bmu.col, r, c, newRadius);
      const oldW = state.weights[r][c];
      const newW: number[] = [];
      for (let d = 0; d < state.inputDim; d++) {
        // w_j(t+1) = w_j(t) + α(t) · h(j, bmu, σ(t)) · (x_d - w_j_d(t))
        newW.push(oldW[d] + newLR * h * (input[d] - oldW[d]));
      }
      row.push(newW);
    }
    newWeights.push(row);
  }

  return {
    weights: newWeights,
    iteration: state.iteration + 1,
    gridWidth: state.gridWidth,
    gridHeight: state.gridHeight,
    inputDim: state.inputDim,
    currentLearningRate: newLR,
    currentRadius: newRadius,
    bmuHistory: [...state.bmuHistory, { row: bmu.row, col: bmu.col }],
    quantizationErrors: [...state.quantizationErrors, bmu.distance],
    config: cfg,
  };
}

/**
 * Train the SOM on a dataset for a specified number of epochs.
 *
 * Each epoch presents every data point once. The total number of
 * iterations equals epochs × data.length.
 *
 * @param state - Initial or current SOM state.
 * @param data - Array of input vectors.
 * @param epochs - Number of complete passes over the data.
 * @param config - SOM configuration.
 * @returns The SOMState after all training is complete.
 */
export function trainSOM(
  state: SOMState,
  data: number[][],
  epochs: number,
  config: SOMConfig
): SOMState {
  let current = state;
  for (let e = 0; e < epochs; e++) {
    for (let i = 0; i < data.length; i++) {
      current = somStep(current, data[i], config);
    }
  }
  return current;
}

/**
 * Compute the average quantization error over a dataset.
 *
 * Quantization error = (1/N) Σ_i ||x_i - w_{BMU(x_i)}||
 *
 * @param state - Current SOM state.
 * @param data - Array of input vectors.
 * @returns The mean Euclidean distance from each data point to its BMU.
 */
export function computeQuantizationError(
  state: SOMState,
  data: number[][]
): number {
  if (data.length === 0) return 0;

  let totalError = 0;
  for (const input of data) {
    const bmu = findBMU(state, input);
    totalError += bmu.distance;
  }
  return totalError / data.length;
}

/**
 * Compute the Unified Distance Matrix (U-Matrix).
 *
 * For each neuron, the U-Matrix value is the average Euclidean distance
 * to all of its immediate grid neighbors (up, down, left, right).
 *
 * High values indicate cluster boundaries; low values indicate
 * neurons within a cluster.
 *
 * @param state - Current SOM state.
 * @returns A 2D array [gridHeight × gridWidth] of average neighbor distances.
 */
export function computeUMatrix(state: SOMState): number[][] {
  const { weights, gridHeight, gridWidth } = state;
  const uMatrix: number[][] = [];

  // Neighbor offsets: up, down, left, right
  const offsets = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (let r = 0; r < gridHeight; r++) {
    const row: number[] = [];
    for (let c = 0; c < gridWidth; c++) {
      let sumDist = 0;
      let count = 0;
      for (const [dr, dc] of offsets) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < gridHeight && nc >= 0 && nc < gridWidth) {
          sumDist += euclideanDistance(weights[r][c], weights[nr][nc]);
          count++;
        }
      }
      row.push(count > 0 ? sumDist / count : 0);
    }
    uMatrix.push(row);
  }

  return uMatrix;
}
