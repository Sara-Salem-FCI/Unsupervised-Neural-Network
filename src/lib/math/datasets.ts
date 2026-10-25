/**
 * Dataset Generators for Self-Organizing Maps
 *
 * Provides synthetic dataset generation functions for testing and
 * demonstrating SOM training. All generators accept a seed for
 * deterministic, reproducible output.
 *
 * @module datasets
 */

import { mulberry32 } from './som';

/**
 * Box-Muller transform: convert two uniform random numbers into
 * a standard normal (Gaussian) random number.
 *
 * Uses the basic form: z = sqrt(-2 ln u1) · cos(2π u2)
 *
 * @param rng - A uniform RNG returning values in [0, 1).
 * @returns A standard normal random value.
 */
function boxMuller(rng: () => number): number {
  let u1 = rng();
  // Avoid log(0)
  while (u1 === 0) u1 = rng();
  const u2 = rng();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

/**
 * Generate clustered data points drawn from multiple Gaussian blobs.
 *
 * Each cluster has a randomly placed center in [0, 1]^dim, and points
 * are drawn from a Gaussian distribution centered there with the
 * given spread (standard deviation).
 *
 * @param numPoints - Total number of data points to generate.
 * @param numClusters - Number of Gaussian clusters.
 * @param dim - Dimensionality of each data point.
 * @param spread - Standard deviation of each cluster.
 * @param seed - PRNG seed for reproducibility.
 * @returns Array of data points, each of length dim.
 */
export function generateGaussianBlobs(
  numPoints: number,
  numClusters: number,
  dim: number,
  spread: number,
  seed: number
): number[][] {
  const rng = mulberry32(seed);

  // Generate cluster centers in [0, 1]^dim
  const centers: number[][] = [];
  for (let k = 0; k < numClusters; k++) {
    const center: number[] = [];
    for (let d = 0; d < dim; d++) {
      center.push(rng());
    }
    centers.push(center);
  }

  // Assign each point to a cluster (round-robin) and sample around center
  const data: number[][] = [];
  for (let i = 0; i < numPoints; i++) {
    const cluster = i % numClusters;
    const point: number[] = [];
    for (let d = 0; d < dim; d++) {
      point.push(centers[cluster][d] + spread * boxMuller(rng));
    }
    data.push(point);
  }

  return data;
}

/**
 * Generate data points arranged in a ring (circle) with optional noise.
 *
 * Points are placed at evenly spaced angles on a circle of the given
 * radius, with Gaussian noise added to both coordinates.
 *
 * @param numPoints - Number of points on the ring.
 * @param radius - Radius of the ring.
 * @param noise - Standard deviation of additive Gaussian noise.
 * @param seed - PRNG seed for reproducibility.
 * @returns Array of 2D data points.
 */
export function generateRing(
  numPoints: number,
  radius: number,
  noise: number,
  seed: number
): number[][] {
  const rng = mulberry32(seed);
  const data: number[][] = [];

  for (let i = 0; i < numPoints; i++) {
    const angle = (2 * Math.PI * i) / numPoints;
    const x = radius * Math.cos(angle) + noise * boxMuller(rng);
    const y = radius * Math.sin(angle) + noise * boxMuller(rng);
    // Shift to center around (0.5, 0.5)
    data.push([x + 0.5, y + 0.5]);
  }

  return data;
}

/**
 * Generate the "two moons" (two interleaving half-circles) dataset.
 *
 * A classic nonlinear classification benchmark. The first moon is a
 * semicircle centered at (0.5, 0.5), and the second is offset and
 * flipped below.
 *
 * @param numPoints - Total number of points (split evenly between moons).
 * @param noise - Standard deviation of additive Gaussian noise.
 * @param seed - PRNG seed for reproducibility.
 * @returns Array of 2D data points.
 */
export function generateTwoMoons(
  numPoints: number,
  noise: number,
  seed: number
): number[][] {
  const rng = mulberry32(seed);
  const data: number[][] = [];
  const halfN = Math.floor(numPoints / 2);
  const radius = 0.3;

  // First moon: upper semicircle
  for (let i = 0; i < halfN; i++) {
    const angle = (Math.PI * i) / halfN;
    const x = radius * Math.cos(angle) + 0.35 + noise * boxMuller(rng);
    const y = radius * Math.sin(angle) + 0.4 + noise * boxMuller(rng);
    data.push([x, y]);
  }

  // Second moon: lower semicircle, shifted right and down
  for (let i = 0; i < numPoints - halfN; i++) {
    const angle = (Math.PI * i) / (numPoints - halfN) + Math.PI;
    const x = radius * Math.cos(angle) + 0.65 + noise * boxMuller(rng);
    const y = radius * Math.sin(angle) + 0.6 + noise * boxMuller(rng);
    data.push([x, y]);
  }

  return data;
}

/**
 * Generate data points on a regular grid with small random perturbation.
 *
 * Creates a sqrt(numPoints) × sqrt(numPoints) grid in [0, 1]² with
 * tiny jitter. If numPoints is not a perfect square, a slightly
 * larger grid is created and then trimmed.
 *
 * @param numPoints - Approximate number of points.
 * @param seed - PRNG seed for reproducibility.
 * @returns Array of 2D data points.
 */
export function generateGrid(numPoints: number, seed: number): number[][] {
  const rng = mulberry32(seed);
  const side = Math.ceil(Math.sqrt(numPoints));
  const data: number[][] = [];

  for (let i = 0; i < side && data.length < numPoints; i++) {
    for (let j = 0; j < side && data.length < numPoints; j++) {
      const x = (i + 0.5) / side + 0.01 * boxMuller(rng);
      const y = (j + 0.5) / side + 0.01 * boxMuller(rng);
      data.push([x, y]);
    }
  }

  return data;
}

/**
 * Generate uniformly distributed random points in [0, 1]^dim.
 *
 * @param numPoints - Number of points to generate.
 * @param dim - Dimensionality of each data point.
 * @param seed - PRNG seed for reproducibility.
 * @returns Array of data points, each of length dim.
 */
export function generateUniform(
  numPoints: number,
  dim: number,
  seed: number
): number[][] {
  const rng = mulberry32(seed);
  const data: number[][] = [];

  for (let i = 0; i < numPoints; i++) {
    const point: number[] = [];
    for (let d = 0; d < dim; d++) {
      point.push(rng());
    }
    data.push(point);
  }

  return data;
}
