/**
 * Mexican Hat (Difference of Gaussians) Lateral Interaction Function
 *
 * Models lateral interaction in neural networks using the difference
 * of two Gaussian functions:
 *
 *   h(r) = A_e · exp(-r² / (2σ_e²)) − A_i · exp(-r² / (2σ_i²))
 *
 * where:
 *   - A_e = excitation amplitude (positive, typically larger)
 *   - A_i = inhibition amplitude (positive, typically smaller)
 *   - σ_e = excitation width (narrow)
 *   - σ_i = inhibition width (wide, σ_i > σ_e)
 *   - r   = distance from the center neuron
 *
 * This creates a profile with strong local excitation and
 * surround inhibition, resembling a Mexican sombrero hat.
 *
 * @module mexican-hat
 */

/** Parameters defining the Mexican Hat interaction profile. */
export interface MexicanHatParams {
  /** Excitation amplitude A_e (must be > 0). */
  excitationAmplitude: number;
  /** Inhibition amplitude A_i (must be > 0). */
  inhibitionAmplitude: number;
  /** Excitation width σ_e (must be > 0). */
  excitationWidth: number;
  /** Inhibition width σ_i (must be > 0, must be > σ_e). */
  inhibitionWidth: number;
}

/**
 * Validate Mexican Hat parameters.
 *
 * Requirements:
 *   - Both amplitudes must be positive.
 *   - Both widths must be positive.
 *   - Inhibition width σ_i must be strictly greater than excitation width σ_e.
 *
 * @param params - The parameters to validate.
 * @returns True if valid, false otherwise.
 */
export function validateMexicanHatParams(params: MexicanHatParams): boolean {
  const { excitationAmplitude, inhibitionAmplitude, excitationWidth, inhibitionWidth } = params;
  if (excitationAmplitude <= 0) return false;
  if (inhibitionAmplitude <= 0) return false;
  if (excitationWidth <= 0) return false;
  if (inhibitionWidth <= 0) return false;
  if (inhibitionWidth <= excitationWidth) return false;
  return true;
}

/**
 * Compute the Mexican Hat function at distance r.
 *
 *   h(r) = A_e · exp(-r² / (2σ_e²)) − A_i · exp(-r² / (2σ_i²))
 *
 * @param r - Distance from the center neuron.
 * @param params - Mexican Hat parameters.
 * @returns The interaction value h(r).
 */
export function mexicanHat(r: number, params: MexicanHatParams): number {
  const { excitationAmplitude: Ae, inhibitionAmplitude: Ai, excitationWidth: sigmaE, inhibitionWidth: sigmaI } = params;
  const rSq = r * r;
  const excitation = Ae * Math.exp(-rSq / (2 * sigmaE * sigmaE));
  const inhibition = Ai * Math.exp(-rSq / (2 * sigmaI * sigmaI));
  return excitation - inhibition;
}

/**
 * Compute the Mexican Hat profile for an array of distances.
 *
 * @param distances - Array of distance values.
 * @param params - Mexican Hat parameters.
 * @returns Array of interaction values h(r) for each distance.
 */
export function mexicanHatProfile(
  distances: number[],
  params: MexicanHatParams
): number[] {
  return distances.map((r) => mexicanHat(r, params));
}

/**
 * Find the zero-crossing distance where h(r) = 0 (for r > 0).
 *
 * Setting h(r) = 0:
 *   A_e · exp(-r² / (2σ_e²)) = A_i · exp(-r² / (2σ_i²))
 *
 * Taking the log of both sides:
 *   ln(A_e) - r²/(2σ_e²) = ln(A_i) - r²/(2σ_i²)
 *
 * Solving for r²:
 *   r² · (1/(2σ_e²) - 1/(2σ_i²)) = ln(A_e) - ln(A_i) = ln(A_e / A_i)
 *   r² = ln(A_e / A_i) / (1/(2σ_e²) - 1/(2σ_i²))
 *
 * @param params - Mexican Hat parameters.
 * @returns The zero-crossing distance r > 0, or null if none exists.
 */
export function findZeroCrossing(params: MexicanHatParams): number | null {
  const { excitationAmplitude: Ae, inhibitionAmplitude: Ai, excitationWidth: sigmaE, inhibitionWidth: sigmaI } = params;

  const denominator = 1 / (2 * sigmaE * sigmaE) - 1 / (2 * sigmaI * sigmaI);

  // If denominator is zero (σ_e = σ_i), no zero crossing exists
  if (Math.abs(denominator) < 1e-15) return null;

  const numerator = Math.log(Ae / Ai);
  const rSquared = numerator / denominator;

  // If r² ≤ 0, no real positive zero crossing
  if (rSquared <= 0) return null;

  return Math.sqrt(rSquared);
}

/**
 * Compute a 2D grid of Mexican Hat interaction values centered at (centerX, centerY).
 *
 * Each cell (i, j) in the grid gets the interaction value h(r) where
 * r = sqrt((i - centerX)² + (j - centerY)²).
 *
 * @param gridSize - Side length of the square grid.
 * @param centerX - X coordinate (row) of the center.
 * @param centerY - Y coordinate (column) of the center.
 * @param params - Mexican Hat parameters.
 * @returns 2D array [gridSize × gridSize] of interaction values.
 */
export function computeInteractionGrid(
  gridSize: number,
  centerX: number,
  centerY: number,
  params: MexicanHatParams
): number[][] {
  const grid: number[][] = [];
  for (let i = 0; i < gridSize; i++) {
    const row: number[] = [];
    for (let j = 0; j < gridSize; j++) {
      const dx = i - centerX;
      const dy = j - centerY;
      const r = Math.sqrt(dx * dx + dy * dy);
      row.push(mexicanHat(r, params));
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Compute a simple Gaussian neighborhood function.
 *
 *   g(d) = exp(-d² / (2σ²))
 *
 * Useful for comparison against the full Mexican Hat profile.
 *
 * @param distance - Distance from the center.
 * @param sigma - Width of the Gaussian.
 * @returns The Gaussian value.
 */
export function gaussianNeighborhood(distance: number, sigma: number): number {
  if (sigma <= 0) {
    throw new Error(`Sigma must be positive, got ${sigma}`);
  }
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}
