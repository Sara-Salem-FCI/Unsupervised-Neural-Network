/**
 * MAXNET - Competitive Neural Network
 *
 * A winner-take-all network that iteratively suppresses all activations
 * except the largest one. Each iteration applies:
 *
 *   a_i(t+1) = max(0, a_i(t) - ε * Σ_{j≠i} a_j(t))
 *
 * where ε ∈ (0, 1/m) and m is the number of nodes.
 *
 * Convergence is reached when at most one activation remains positive.
 *
 * @module maxnet
 */

/** State of the MAXNET network at a given point in time. */
export interface MaxnetState {
  /** Current activation values for each node. */
  activations: number[];
  /** Current iteration count (0-indexed). */
  iteration: number;
  /** Whether the network has converged (at most one non-zero activation). */
  converged: boolean;
  /** Full history of activations at each iteration (including initial). */
  history: number[][];
  /** The inhibition parameter ε used during computation. */
  epsilon: number;
}

/** Configuration for a MAXNET run. */
export interface MaxnetConfig {
  /**
   * Inhibition parameter ε.
   * Must satisfy 0 < ε < 1/m where m is the number of nodes.
   */
  epsilon: number;
  /**
   * Maximum number of iterations before stopping.
   * @default 100
   */
  maxIterations: number;
}

/**
 * Validate that a MAXNET configuration is mathematically valid.
 *
 * The inhibition parameter ε must satisfy 0 < ε < 1/m to guarantee
 * convergence. If m (number of nodes) is not yet known, this validates
 * only that ε > 0.
 *
 * @param config - The configuration to validate.
 * @param m - Number of nodes (optional; if provided, checks ε < 1/m).
 * @throws {Error} If any parameter is invalid.
 */
export function validateMaxnetConfig(config: MaxnetConfig, m?: number): void {
  if (config.epsilon <= 0) {
    throw new Error(`Epsilon must be positive, got ${config.epsilon}`);
  }
  if (m !== undefined && m > 0 && config.epsilon >= 1 / m) {
    throw new Error(
      `Epsilon must be < 1/m = 1/${m} = ${1 / m}, got ${config.epsilon}`
    );
  }
  if (config.maxIterations < 1) {
    throw new Error(
      `maxIterations must be >= 1, got ${config.maxIterations}`
    );
  }
}

export const MAXNET_TOLERANCE = 1e-7;

/**
 * Check whether the network has converged.
 *
 * Convergence is defined as having at most one activation > 0 (above numerical tolerance).
 *
 * @param activations - Current activation values.
 * @param tolerance - Minimum activation considered positive (default 1e-7).
 * @returns True if at most one activation is positive.
 */
export function isConverged(activations: number[], tolerance = MAXNET_TOLERANCE): boolean {
  let positiveCount = 0;
  for (const a of activations) {
    if (a > tolerance) {
      positiveCount++;
      if (positiveCount > 1) return false;
    }
  }
  return true;
}

/**
 * Create the initial MAXNET state from a set of activation values.
 *
 * @param initialActivations - Starting activation values for each node.
 * @param config - MAXNET configuration.
 * @returns The initial MaxnetState.
 * @throws {Error} If activations array is empty or config is invalid.
 */
export function createMaxnetState(
  initialActivations: number[],
  config: MaxnetConfig
): MaxnetState {
  if (initialActivations.length === 0) {
    throw new Error('Initial activations array must not be empty');
  }
  validateMaxnetConfig(config, initialActivations.length);

  const activations = [...initialActivations];
  return {
    activations,
    iteration: 0,
    converged: isConverged(activations),
    history: [activations],
    epsilon: config.epsilon,
  };
}

/**
 * Perform one iteration of the MAXNET update rule.
 *
 * For each node i:
 *   a_i(t+1) = max(0, a_i(t) - ε * Σ_{j≠i} a_j(t))
 *
 * The sum Σ_{j≠i} a_j(t) equals (totalSum - a_i(t)).
 *
 * @param state - Current MAXNET state.
 * @returns A new MaxnetState after one iteration (immutable update).
 */
export function maxnetStep(state: MaxnetState): MaxnetState {
  const { activations, epsilon } = state;
  const m = activations.length;

  // Compute total sum of all current activations
  let totalSum = 0;
  for (let i = 0; i < m; i++) {
    totalSum += activations[i];
  }

  // Apply update rule: a_i(t+1) = max(0, a_i(t) - ε * Σ_{j≠i} a_j(t))
  const newActivations = new Array<number>(m);
  for (let i = 0; i < m; i++) {
    const sumOthers = totalSum - activations[i];
    const rawVal = activations[i] - epsilon * sumOthers;
    newActivations[i] = rawVal > MAXNET_TOLERANCE ? rawVal : 0;
  }

  const newIteration = state.iteration + 1;
  return {
    activations: newActivations,
    iteration: newIteration,
    converged: isConverged(newActivations),
    history: [...state.history, newActivations],
    epsilon,
  };
}

/**
 * Run the MAXNET network to convergence or until maxIterations is reached.
 *
 * Starting from the given initial activations, repeatedly applies the
 * MAXNET update rule until at most one activation remains positive
 * or the iteration limit is hit.
 *
 * @param initialActivations - Starting activation values.
 * @param config - MAXNET configuration (epsilon, maxIterations).
 * @returns The final MaxnetState.
 */
export function runMaxnet(
  initialActivations: number[],
  config: MaxnetConfig
): MaxnetState {
  let state = createMaxnetState(initialActivations, config);

  while (!state.converged && state.iteration < config.maxIterations) {
    state = maxnetStep(state);
  }

  return state;
}
