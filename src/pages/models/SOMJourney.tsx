import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Section, SectionHeader, Card } from '../../components/ui/Section';
import { EquationBlock, TeX } from '../../components/ui/Math';
import { SliderControl, PlaybackControls, Collapsible, InfoBox, Tabs } from '../../components/ui/Controls';
import {
  createSOM,
  findBMU,
  somStep,
  computeQuantizationError,
  computeUMatrix,
  SOMConfig,
  SOMState,
} from '../../lib/math/som';
import {
  generateGaussianBlobs,
  generateRing,
  generateTwoMoons,
  generateUniform,
} from '../../lib/math/datasets';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Map, CheckCircle2, AlertCircle, RefreshCw, Eye } from 'lucide-react';

export function SOMJourney() {
  // Playground State
  const [datasetType, setDatasetType] = useState<'blobs' | 'ring' | 'moons' | 'uniform'>('blobs');
  const [gridDim, setGridDim] = useState<number>(6); // 6x6 grid
  const [initialLR, setInitialLR] = useState<number>(0.5);
  const [initialRadius, setInitialRadius] = useState<number>(2.5);
  const [maxSteps, setMaxSteps] = useState<number>(400);
  const [seed, setSeed] = useState<number>(42);

  // Loaded dataset (2D coordinates in [0, 1])
  const [data, setData] = useState<number[][]>(() =>
    generateGaussianBlobs(120, 3, 2, 0.08, 42)
  );

  // SOM Engine State
  const [somState, setSomState] = useState<SOMState>(() => {
    const config: SOMConfig = {
      gridWidth: 6,
      gridHeight: 6,
      inputDim: 2,
      learningRate: 0.5,
      initialRadius: 2.5,
      minLearningRate: 0.01,
      minRadius: 0.5,
      maxIterations: 400,
      seed: 42,
    };
    return createSOM(config);
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'umatrix'>('grid');
  const [selectedPoint, setSelectedPoint] = useState<number[] | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  // Dataset Generator
  const regenerateDataset = useCallback((type: string, currentSeed: number) => {
    let pts: number[][] = [];
    if (type === 'blobs') pts = generateGaussianBlobs(120, 3, 2, 0.08, currentSeed);
    else if (type === 'ring') pts = generateRing(120, 0.35, 0.04, currentSeed);
    else if (type === 'moons') pts = generateTwoMoons(120, 0.06, currentSeed);
    else pts = generateUniform(120, 2, currentSeed);
    setData(pts);
    return pts;
  }, []);

  // Reset or reinitialize SOM
  const handleReset = useCallback(() => {
    setIsPlaying(false);
    const config: SOMConfig = {
      gridWidth: gridDim,
      gridHeight: gridDim,
      inputDim: 2,
      learningRate: initialLR,
      initialRadius: initialRadius,
      minLearningRate: 0.01,
      minRadius: 0.5,
      maxIterations: maxSteps,
      seed: seed,
    };
    const newSom = createSOM(config);
    setSomState(newSom);
    setSelectedPoint(null);
  }, [gridDim, initialLR, initialRadius, maxSteps, seed]);

  // Handle dataset type switch
  const handleDatasetChange = (newType: 'blobs' | 'ring' | 'moons' | 'uniform') => {
    setDatasetType(newType);
    regenerateDataset(newType, seed);
    handleReset();
  };

  // Step training once
  const handleStep = useCallback(() => {
    if (somState.iteration >= maxSteps) {
      setIsPlaying(false);
      return;
    }
    // Random sample from data
    const sampleIdx = Math.floor(Math.random() * data.length);
    const sample = data[sampleIdx];
    setSomState((prev) => somStep(prev, sample));
  }, [data, somState.iteration, maxSteps]);

  // Animation Loop for Continuous Training
  useEffect(() => {
    if (!isPlaying) return;

    let active = true;
    const runBatch = () => {
      if (!active) return;
      setSomState((prev) => {
        if (prev.iteration >= maxSteps) {
          setIsPlaying(false);
          return prev;
        }
        // Run a small mini-batch of 3 samples per frame for smooth speed
        let s = prev;
        for (let b = 0; b < 3 && s.iteration < maxSteps; b++) {
          const sample = data[Math.floor(Math.random() * data.length)];
          s = somStep(s, sample);
        }
        return s;
      });
      animFrameRef.current = requestAnimationFrame(runBatch);
    };

    animFrameRef.current = requestAnimationFrame(runBatch);

    return () => {
      active = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, data, maxSteps]);

  // Draw SOM Canvas (Data Points & Neurons Grid)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const padding = 25;
    const toScreen = (x: number, y: number) => ({
      sx: padding + x * (width - 2 * padding),
      sy: padding + (1 - y) * (height - 2 * padding),
    });

    if (viewMode === 'grid') {
      // 1. Draw Data Points
      ctx.fillStyle = '#64748b';
      for (const pt of data) {
        const { sx, sy } = toScreen(pt[0], pt[1]);
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Selected Point if clicked
      if (selectedPoint) {
        const { sx, sy } = toScreen(selectedPoint[0], selectedPoint[1]);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, 7, 0, Math.PI * 2);
        ctx.stroke();

        // Highlight its BMU
        const bmu = findBMU(somState, selectedPoint);
        const bmuWeight = somState.weights[bmu.row][bmu.col];
        const bmuScreen = toScreen(bmuWeight[0], bmuWeight[1]);

        ctx.strokeStyle = '#f59e0b';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(bmuScreen.sx, bmuScreen.sy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 3. Draw Grid Lines between adjacent neurons
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = 1.5;

      for (let r = 0; r < somState.gridHeight; r++) {
        for (let c = 0; c < somState.gridWidth; c++) {
          const w1 = somState.weights[r][c];
          const p1 = toScreen(w1[0], w1[1]);

          // Connect horizontally
          if (c + 1 < somState.gridWidth) {
            const w2 = somState.weights[r][c + 1];
            const p2 = toScreen(w2[0], w2[1]);
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }

          // Connect vertically
          if (r + 1 < somState.gridHeight) {
            const w2 = somState.weights[r + 1][c];
            const p2 = toScreen(w2[0], w2[1]);
            ctx.beginPath();
            ctx.moveTo(p1.sx, p1.sy);
            ctx.lineTo(p2.sx, p2.sy);
            ctx.stroke();
          }
        }
      }

      // 4. Draw Neuron Nodes
      for (let r = 0; r < somState.gridHeight; r++) {
        for (let c = 0; c < somState.gridWidth; c++) {
          const w = somState.weights[r][c];
          const p = toScreen(w[0], w[1]);

          ctx.beginPath();
          ctx.arc(p.sx, p.sy, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#818cf8';
          ctx.fill();
          ctx.strokeStyle = '#0a0b1a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    } else {
      // --- U-Matrix Heatmap View ---
      const uMatrix = computeUMatrix(somState);
      const rows = uMatrix.length;
      const cols = uMatrix[0].length;
      const cellW = width / cols;
      const cellH = height / rows;

      // Find max distance for color mapping
      let maxDist = 0.001;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          maxDist = Math.max(maxDist, uMatrix[r][c]);
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const norm = uMatrix[r][c] / maxDist;
          // Purple (close/same cluster) to Bright Gold (distant/boundary)
          const red = Math.floor(norm * 245 + (1 - norm) * 40);
          const green = Math.floor(norm * 158 + (1 - norm) * 20);
          const blue = Math.floor(norm * 11 + (1 - norm) * 120);

          ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
          ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
        }
      }
    }
  }, [somState, data, viewMode, selectedPoint]);

  // Handle clicking on Canvas to select a point and see its BMU
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const padding = 25;
    const normX = (clickX - padding) / (canvas.width - 2 * padding);
    const normY = 1 - (clickY - padding) / (canvas.height - 2 * padding);

    // Find nearest data point
    let bestDist = Infinity;
    let nearestPt: number[] | null = null;
    for (const pt of data) {
      const d = Math.hypot(pt[0] - normX, pt[1] - normY);
      if (d < bestDist && d < 0.1) {
        bestDist = d;
        nearestPt = pt;
      }
    }
    setSelectedPoint(nearestPt);
  };

  // Quantization Error Chart Data
  const errorChartData = useMemo(() => {
    return somState.quantizationErrors.map((err, idx) => ({
      sample: idx * 20,
      qe: Number(err.toFixed(4)),
    }));
  }, [somState.quantizationErrors]);

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-4">
            <Map className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Model Journey 03
            </span>
          </div>
          <h1 className="text-hero font-black text-text-primary tracking-tight mb-4">
            Self-Organizing Maps <span className="text-gradient-indigo">— The Cartographer's Universe</span>
          </h1>
          <p className="text-subtitle text-text-secondary leading-relaxed">
            Teuvo Kohonen's pioneering unsupervised architecture: project complex multi-dimensional
            data onto an organized low-dimensional topological grid through competitive learning and neighborhood cooperation.
          </p>
        </div>
      </Section>

      {/* Chapter 1: The Problem */}
      <Section>
        <SectionHeader
          title="Chapter 1 — The Problem That Needed Solving"
          subtitle="Extracting meaningful topological structure from high-dimensional manifolds without human labels."
          badge="Foundational Challenge"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <p>
              Modern science and industry collect massive datasets with dozens or hundreds of measurements per
              sample (genomic expressions, financial metrics, multi-sensor telemetries). Visualizing or clustering
              data beyond three dimensions is impossible for human perception.
            </p>
            <p>
              Linear projection techniques like Principal Component Analysis (PCA) preserve global variance, but they
              flatten curved nonlinear surfaces, destroying local neighborhood structures and folding distant clusters
              on top of one another.
            </p>
            <p>
              Standard k-means clustering can discover centroid groups, but it treats clusters as isolated islands,
              losing all continuous spatial relationships between them. How can a network project a high-dimensional
              space onto a 2D map while guaranteeing that <em>nearby observations in reality remain nearby neighbors on the map</em>?
            </p>
          </div>

          <Card className="border-indigo-500/20">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              The Triad of Self-Organization
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">1. Competition:</span> Neurons compete for each input. The closest prototype becomes the Best Matching Unit (BMU).
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">2. Cooperation:</span> The BMU shares credit with spatial neighbors on the lattice, pulling them toward the data.
              </li>
              <li className="flex gap-2">
                <span className="text-indigo-400 font-bold">3. Adaptation:</span> Learning rates and neighborhood radii shrink gradually over training, ensuring global ordering followed by fine tuning.
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Chapter 2: Intuition */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 2 — Intuition: The Elastic Net in Unknown Territory"
          subtitle="An elastic sheet of interconnected scouts stretching to cover the topography of data."
          badge="Mental Model"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-6">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Imagine an elastic rubber fishing net suspended in a multi-dimensional room. Data points are scattered
            like iron shavings across the floor. In every step:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-indigo-400 font-bold text-lg mb-1">1. Identify the Closest Knot</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                An iron shaving is drawn at random. We search the net to find which knot (neuron prototype) lies closest to it.
              </p>
            </Card>

            <Card>
              <div className="text-indigo-400 font-bold text-lg mb-1">2. Elastic Tug</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                We pull that winning knot directly toward the shaving. Because knots are woven into a flexible mesh,
                neighboring knots on the net are pulled along with it.
              </p>
            </Card>

            <Card>
              <div className="text-indigo-400 font-bold text-lg mb-1">3. Gradual Solidification</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Initially, the net is loose and moves freely (global unfolding). Over thousands of tugs, the net stiffens,
                freezing into a smooth two-dimensional surface that faithfully blankets the data cloud.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Chapter 3 & 4: Mathematics */}
      <Section>
        <SectionHeader
          title="Chapter 4 — Mathematical Foundations of SOM"
          subtitle="Every symbol, decay schedule, and weight update equation formalized."
          badge="Mathematical Foundations"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-8">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-2">1. Best Matching Unit (BMU) Selection</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              For an input vector <TeX tex="x \in \mathbb{R}^d" /> and prototype vectors <TeX tex="w_i \in \mathbb{R}^d" />, the BMU index <TeX tex="c" />
              is chosen by minimizing the Euclidean distance:
            </p>

            <EquationBlock
              tex="c = \arg\min_{i} \|x - w_i\|_2 = \arg\min_{i} \sqrt{\sum_{k=1}^d (x_k - w_{ik})^2}"
              description="The neuron whose prototype vector is closest to the observed input in input space."
            />
          </div>

          <div>
            <h3 className="text-base font-bold text-text-primary mb-2">2. Cooperative Synaptic Update Rule</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              All neurons \(i\) on the grid adjust their prototype weights according to their topological proximity to the BMU \(c\):
            </p>

            <EquationBlock
              tex="w_i(t+1) = w_i(t) + \eta(t) \, h_{ci}(t) \, \big[x - w_i(t)\big]"
              description="Where η(t) is the learning rate, and h_ci(t) is the spatial neighborhood coupling kernel."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-indigo-400">
                Gaussian Neighborhood Function on the Grid
              </h4>
              <TeX
                tex="h_{ci}(t) = \exp\left(-\frac{\|r_c - r_i\|_2^2}{2\sigma(t)^2}\right)"
                display
              />
              <p className="text-xs text-text-muted mt-2">
                <strong>Crucial Distinction:</strong> <TeX tex="\|r_c - r_i\|_2" /> is the discrete Euclidean distance between neurons
                on the 2D grid coordinates (e.g. <TeX tex="\sqrt{(row_c - row_i)^2 + (col_c - col_i)^2}" />), <em>NOT</em> the distance in feature space!
              </p>
            </Card>

            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-indigo-400">
                Exponential Parameter Decay Schedules
              </h4>
              <TeX
                tex="\eta(t) = \eta_0 \exp\left(-\frac{t}{\tau_\eta}\right), \quad \sigma(t) = \sigma_0 \exp\left(-\frac{t}{\tau_\sigma}\right)"
                display
              />
              <p className="text-xs text-text-muted mt-2">
                As training advances, the influence radius \(\sigma(t)\) contracts from covering half the grid down to
                individual neurons, while \(\eta(t)\) decays to ensure asymptotic convergence.
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Chapter 5: SOM Interactive Playground */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 5 — The Live Algorithm: Interactive SOM Playground"
          subtitle="Train a real Self-Organizing Map in your browser. Watch the 2D neural lattice unfold over complex synthetic manifolds."
          badge="Live Laboratory"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onStep={handleStep}
                onReset={handleReset}
                iteration={somState.iteration}
                maxIteration={maxSteps}
              />

              <div className="flex items-center gap-3">
                <span className="text-xs text-text-dim">Dataset:</span>
                {(['blobs', 'ring', 'moons', 'uniform'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => handleDatasetChange(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                      datasetType === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-void-200 text-text-secondary hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-white/5">
              <SliderControl
                label="Grid Lattice Size"
                value={gridDim}
                min={4}
                max={10}
                step={1}
                onChange={(val) => {
                  setGridDim(val);
                  handleReset();
                }}
                unit="x"
                color="indigo"
              />
              <SliderControl
                label="Initial Learning Rate (η₀)"
                value={initialLR}
                min={0.1}
                max={0.9}
                step={0.05}
                onChange={(val) => {
                  setInitialLR(val);
                  handleReset();
                }}
                color="indigo"
              />
              <SliderControl
                label="Initial Radius (σ₀)"
                value={initialRadius}
                min={1.0}
                max={5.0}
                step={0.25}
                onChange={(val) => {
                  setInitialRadius(val);
                  handleReset();
                }}
                color="indigo"
              />
              <SliderControl
                label="Total Training Steps"
                value={maxSteps}
                min={100}
                max={1000}
                step={50}
                onChange={(val) => {
                  setMaxSteps(val);
                  handleReset();
                }}
                color="indigo"
              />
            </div>
          </div>

          {/* Visualization Canvas & Side Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Main Interactive Canvas */}
            <Card className="lg:col-span-2 p-6 flex flex-col items-center">
              <div className="w-full flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <Tabs
                    tabs={[
                      { id: 'grid', label: 'Feature Space Lattice' },
                      { id: 'umatrix', label: 'U-Matrix Heatmap' },
                    ]}
                    activeTab={viewMode}
                    onTabChange={(id) => setViewMode(id as any)}
                  />
                </div>
                <div className="text-xs font-mono text-text-dim">
                  Click any data point to highlight its BMU
                </div>
              </div>

              <div className="relative border border-white/10 rounded-xl overflow-hidden bg-void-500 shadow-2xl">
                <canvas
                  ref={canvasRef}
                  width={460}
                  height={460}
                  onClick={handleCanvasClick}
                  className="cursor-crosshair block max-w-full h-auto"
                />
              </div>

              <div className="w-full flex justify-between items-center mt-4 text-xs font-mono text-text-secondary">
                <span>
                  Current η(t):{' '}
                  <strong className="text-indigo-400">{somState.currentLearningRate.toFixed(4)}</strong>
                </span>
                <span>
                  Current σ(t):{' '}
                  <strong className="text-purple-400">{somState.currentRadius.toFixed(3)}</strong>
                </span>
                <span>
                  Status:{' '}
                  {somState.iteration >= maxSteps ? (
                    <strong className="text-emerald-400">COMPLETE</strong>
                  ) : (
                    <strong className="text-amber-400">TRAINING...</strong>
                  )}
                </span>
              </div>
            </Card>

            {/* Error Chart & Stats */}
            <div className="space-y-6">
              <Card className="p-4">
                <div className="text-xs font-mono text-text-dim mb-2 uppercase">
                  Quantization Error Trajectory
                </div>
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={errorChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="sample" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0d0e24',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="qe"
                        stroke="#818cf8"
                        strokeWidth={2}
                        dot={false}
                        name="Quantization Error"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[11px] text-text-muted mt-2">
                  Quantization error measures the average Euclidean distance between input samples and their respective BMUs.
                </p>
              </Card>

              <Card className="p-4 text-xs space-y-2">
                <div className="font-bold text-text-primary uppercase tracking-wider text-[11px]">
                  What is the U-Matrix?
                </div>
                <p className="text-text-secondary leading-relaxed">
                  The Unified Distance Matrix (U-Matrix) visualizes the Euclidean distances between adjacent prototype neurons.
                  High values (yellow/gold) signal valleys of empty space separating distinct clusters, while low values (dark purple)
                  reveal dense clusters of similar data points.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </Section>

      {/* Chapter 6: Verifiable Worked Numerical Example */}
      <Section>
        <SectionHeader
          title="Chapter 6 — Complete Worked Numerical Example"
          subtitle="Trace a 2x2 SOM grid receiving a single 2D input sample by hand."
          badge="Manual Verification"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-6 max-w-4xl">
          <p className="text-sm text-text-secondary leading-relaxed">
            Consider a 2×2 grid of neurons with 2D prototype weights at step \(t = 0\):
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 bg-void-200 border border-white/5 rounded-lg">w_(0,0) = [0.20, 0.60]</div>
            <div className="p-2.5 bg-void-200 border border-white/5 rounded-lg">w_(0,1) = [0.80, 0.70]</div>
            <div className="p-2.5 bg-void-200 border border-white/5 rounded-lg">w_(1,0) = [0.30, 0.10]</div>
            <div className="p-2.5 bg-void-200 border border-white/5 rounded-lg">w_(1,1) = [0.90, 0.20]</div>
          </div>

          <div className="p-4 bg-void-500 border border-white/5 rounded-xl space-y-3 font-mono text-xs text-text-secondary">
            <div><strong>Input Vector:</strong> \(x = [0.75, 0.80]\), with \(\eta = 0.50\) and \(\sigma = 1.0\).</div>
            <div>
              <strong>1. Euclidean Distance to each neuron:</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li><TeX tex="d_{(0,0)} = \sqrt{(0.75 - 0.20)^2 + (0.80 - 0.60)^2} = \sqrt{0.3425} \approx 0.5852" /></li>
                <li><TeX tex="d_{(0,1)} = \sqrt{(0.75 - 0.80)^2 + (0.80 - 0.70)^2} = \sqrt{0.0125} \approx 0.1118" /> (BMU!)</li>
                <li><TeX tex="d_{(1,0)} = \sqrt{(0.75 - 0.30)^2 + (0.80 - 0.10)^2} = \sqrt{0.6925} \approx 0.8322" /></li>
                <li><TeX tex="d_{(1,1)} = \sqrt{(0.75 - 0.90)^2 + (0.80 - 0.20)^2} = \sqrt{0.3825} \approx 0.6185" /></li>
              </ul>
            </div>
            <div>
              <strong>2. Winner identified:</strong> Neuron \((0,1)\) has minimum distance \(0.1118\).
            </div>
            <div>
              <strong>3. Neighborhood factor for BMU and its direct neighbor (0,0):</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>For BMU \((0,1)\): distance on grid is \(0 \implies h = \exp(0) = \mathbf{1.0}\)</li>
                <li>For neighbor \((0,0)\): grid distance is \(1 \implies h = \exp(-1^2 / (2 \times 1.0^2)) = e^{-0.5} \approx \mathbf{0.6065}\)</li>
              </ul>
            </div>
            <div>
              <strong>4. Weight Updates:</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li><TeX tex="w_{(0,1)}^{\text{new}} = [0.80, 0.70] + 0.5 \times 1.0 \times ([0.75, 0.80] - [0.80, 0.70]) = [0.775, 0.750]" /></li>
                <li><TeX tex="w_{(0,0)}^{\text{new}} = [0.20, 0.60] + 0.5 \times 0.6065 \times ([0.75, 0.80] - [0.20, 0.60]) = [0.3668, 0.6607]" /></li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Chapter 7: Industry Relevance & Recommender Qualifications */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 7 — Industry Applications & The Recommendation Question"
          subtitle="Documented deployments in industrial monitoring, and an honest analysis of modern recommendation systems."
          badge="Applied Data Science"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-indigo-400 mb-2">
                Documented Case Study
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                Industrial Anomaly Detection in High-Dimensional Sensors
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                In complex process industries (pulp and paper mills, wind turbine arrays, nuclear cooling circuits),
                engineers train SOMs on thousands of healthy multivariate sensor cycles. When an emerging mechanical fault
                occurs, the sensor vector lands far from any BMU prototype, generating high quantization error that triggers alarms.
              </p>
              <div className="text-[11px] font-mono text-text-muted">
                Evidence Level: <strong>Peer-reviewed engineering literature</strong> (Alhoniemi et al., 1999).
              </div>
            </Card>

            <Card>
              <div className="text-xs font-mono uppercase tracking-wider text-purple-400 mb-2">
                Scientific Exploration
              </div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                Genomic Microarray & Transcriptomic Cartography
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                SOMs were extensively adopted by computational biologists (e.g. Tamayo et al., PNAS 1999) to organize
                thousands of co-regulated gene expression profiles into smooth clusters, revealing regulatory gene families
                without requiring supervised disease labels.
              </p>
              <div className="text-[11px] font-mono text-text-muted">
                Evidence Level: <strong>Seminal Bioinformatics Publication</strong> (Tamayo et al., PNAS 1999).
              </div>
            </Card>
          </div>

          <InfoBox type="important" title="Critical Clarification: Does YouTube or Netflix Use SOM?">
            <div className="space-y-2 text-xs text-text-secondary leading-relaxed">
              <p>
                <strong>No.</strong> Modern commercial recommendation engines do not use Self-Organizing Maps in production.
                While SOM serves as an excellent educational tool to illustrate candidate vector quantization and item similarity,
                production systems at companies like Google/YouTube and Netflix utilize:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Two-Tower Deep Neural Networks for user-item embedding retrieval.</li>
                <li>Approximate Nearest Neighbor (ANN) index graphs like ScaNN or HNSW over billion-vector catalogs.</li>
                <li>Deep multi-task ranking transformers with complex click/dwell-time feedback loops.</li>
              </ul>
              <p>
                Never present SOM as a commercial recommendation engine architecture.
              </p>
            </div>
          </InfoBox>
        </div>
      </Section>

      {/* Chapter 8 & 9: Implementation with MiniSom Comparison */}
      <Section>
        <SectionHeader
          title="Chapter 8 & 9 — Implementation & Real Library Ecosystems"
          subtitle="Minimal NumPy implementation compared against the widely adopted MiniSom library."
          badge="Code Laboratory"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-6">
          <div className="code-block">
            <pre className="text-xs text-text-secondary font-mono leading-relaxed">
{`# 1. Custom Minimal SOM in NumPy
import numpy as np

class MinimalSOM:
    def __init__(self, x_dim: int, y_dim: int, input_len: int, lr: float = 0.5, sigma: float = 1.5):
        self.x_dim, self.y_dim = x_dim, y_dim
        self.weights = np.random.rand(x_dim, y_dim, input_len)
        self.lr = lr
        self.sigma = sigma
        
    def find_bmu(self, x: np.ndarray) -> tuple[int, int]:
        diff = self.weights - x
        dist_sq = np.sum(diff ** 2, axis=-1)
        return np.unravel_index(np.argmin(dist_sq), (self.x_dim, self.y_dim))
        
    def train_step(self, x: np.ndarray, t: int, max_t: int):
        bmu_r, bmu_c = self.find_bmu(x)
        # Decay schedules
        curr_lr = self.lr * np.exp(-t / max_t)
        curr_sigma = self.sigma * np.exp(-t / max_t)
        
        # Grid coordinates
        r_coords, c_coords = np.indices((self.x_dim, self.y_dim))
        dist_sq = (r_coords - bmu_r)**2 + (c_coords - bmu_c)**2
        h = np.exp(-dist_sq / (2 * curr_sigma**2))
        
        # Weight update
        self.weights += curr_lr * h[:, :, None] * (x - self.weights)

# 2. Comparison with the standard 'minisom' Python package
from minisom import MiniSom

# Initialize a 10x10 SOM for 3-dimensional data
som = MiniSom(x=10, y=10, input_len=3, sigma=1.5, learning_rate=0.5, neighborhood_function='gaussian')
som.random_weights_init(data)
som.train_random(data, num_iteration=1000)`}
            </pre>
          </div>
        </div>
      </Section>

      {/* Chapter 10: Strengths & Weaknesses */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 10 — Strengths, Weaknesses, and Modern Alternatives"
          subtitle="Where SOM excels and where modern dimensionality reduction methods take over."
          badge="Evaluation"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-indigo-500/20 bg-indigo-500/5">
            <h3 className="font-bold text-indigo-400 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Advantages of SOM
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>• Strictly unsupervised: uncovers nonlinear topological manifolds without teacher signals.</li>
              <li>• Simultaneous clustering and dimensionality reduction in a unified coordinate grid.</li>
              <li>• Out-of-sample projection: easily maps new unseen data points to existing BMUs in \(O(N)\) time.</li>
              <li>• Highly interpretable visual diagnostics through U-Matrices and component planes.</li>
            </ul>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <h3 className="font-bold text-rose-400 text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Limitations & Modern Alternatives
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>• Rigid grid topology: cannot adapt if data lies on disconnected separate manifolds.</li>
              <li>• High sensitivity to initial radius: too small causes map twisting (topological defects).</li>
              <li>• Modern visualization alternatives like <strong>t-SNE</strong> and <strong>UMAP</strong> preserve local cluster purity better for high-dimensional embedding inspection.</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Chapter 11: Knowledge Check */}
      <Section>
        <SectionHeader
          title="Chapter 11 — Knowledge Check"
          subtitle="Test your comprehension of Kohonen maps, learning schedules, and topology preservation."
          badge="Assessment"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-6 max-w-3xl">
          {[
            {
              id: 1,
              q: 'What is the fundamental difference between the distance used to find the BMU and the distance used in the neighborhood function h_ci(t)?',
              options: [
                'BMU uses grid coordinates; neighborhood uses feature space.',
                'BMU uses Euclidean distance in feature space ||x - w||; neighborhood uses distance on the 2D grid coordinates ||r_c - r_i||.',
                'Both use the exact same distance metric.',
                'Neighborhood uses Manhattan distance only.',
              ],
              correct: 1,
              explanation:
                'The BMU is selected by comparing the input vector with prototypes in high-dimensional feature space. The neighborhood kernel evaluates how far other neurons are from the winner across the 2D grid lattice.',
            },
            {
              id: 2,
              q: 'Why do both the learning rate η(t) and neighborhood radius σ(t) decay monotonically over training time?',
              options: [
                'To save computer memory during long runs.',
                'To allow broad global ordering of the grid in early stages, followed by localized fine-tuning without instability later.',
                'Because the dataset shrinks over time.',
                'To prevent neurons from moving at all.',
              ],
              correct: 1,
              explanation:
                'Early in training, large σ and η pull large swathes of the grid into global alignment with data contours. In later epochs, small σ and η allow fine-grained, localized adjustments without disrupting the global map topology.',
            },
            {
              id: 3,
              q: 'What does a high value (bright/yellow) on a U-Matrix indicate about the data distribution?',
              options: [
                'The neurons are identical to each other.',
                'A boundary or valley of low data density separating two distinct clusters.',
                'An area of extremely dense data points.',
                'That training failed and should be restarted.',
              ],
              correct: 1,
              explanation:
                'The U-Matrix displays distances between adjacent prototype vectors. Large distances mean neighboring neurons had to stretch across empty space to reach different data clusters, signifying cluster boundaries.',
            },
            {
              id: 4,
              q: 'What is a "topological defect" (or knot/twist) in a trained Self-Organizing Map?',
              options: [
                'When neurons exceed the maximum memory limit.',
                'A state where the grid folds over itself because the initial neighborhood radius was too small to unfold the mesh globally.',
                'When all prototype weights equal zero.',
                'A hardware calculation error in float precision.',
              ],
              correct: 1,
              explanation:
                'If the initial neighborhood radius is too small, different parts of the grid organize independently in conflicting orientations, resulting in a twisted or folded lattice that cannot be untangled without re-training.',
            },
          ].map((item) => {
            const selected = quizAnswers[item.id];
            const isSub = quizSubmitted[item.id];
            const isCorrect = selected === item.correct;

            return (
              <Card key={item.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 font-mono text-xs font-bold">
                    Q{item.id}
                  </span>
                  <div className="font-semibold text-text-primary text-sm">{item.q}</div>
                </div>

                <div className="space-y-2">
                  {item.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      disabled={isSub}
                      onClick={() => setQuizAnswers((prev) => ({ ...prev, [item.id]: optIdx }))}
                      className={`w-full text-left p-3 rounded-lg text-xs transition-all flex items-center justify-between ${
                        selected === optIdx
                          ? 'border border-indigo-400 bg-indigo-400/10 text-indigo-200'
                          : 'border border-white/5 bg-void-200 hover:bg-white/5 text-text-secondary'
                      }`}
                    >
                      <span>{opt}</span>
                      {selected === optIdx && <span className="w-2 h-2 rounded-full bg-indigo-400" />}
                    </button>
                  ))}
                </div>

                {!isSub ? (
                  <button
                    disabled={selected === undefined}
                    onClick={() => setQuizSubmitted((prev) => ({ ...prev, [item.id]: true }))}
                    className="px-4 py-2 bg-indigo-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div
                    className={`p-3 rounded-lg text-xs ${
                      isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="font-bold mb-1">
                      {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </div>
                    <div>{item.explanation}</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>

      {/* References */}
      <Section className="bg-void-300 border-t border-white/5">
        <SectionHeader
          title="Authoritative References & Literature"
          subtitle="Primary citations documenting Self-Organizing Maps and topological representations."
          badge="Bibliography"
          badgeColor="from-indigo-500 to-purple-500"
        />

        <div className="space-y-3 max-w-3xl text-xs text-text-secondary">
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>1. Kohonen, T. (1982).</strong> Self-organized formation of topologically correct feature maps. <em>Biological Cybernetics</em>, 43(1), 59–69.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>2. Kohonen, T. (1990).</strong> The self-organizing map. <em>Proceedings of the IEEE</em>, 78(9), 1464–1480.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>3. Kohonen, T. (2001).</strong> <em>Self-Organizing Maps</em> (3rd ed.). Springer Series in Information Sciences, Vol. 30. Springer-Verlag.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>4. Vettigli, G. (2018).</strong> MiniSom: minimalistic and NumPy-based implementation of the Self Organizing Map. <em>GitHub repository</em>, https://github.com/JustGlowing/minisom.
          </div>
        </div>
      </Section>
    </div>
  );
}
