import { useState, useMemo, useRef, useEffect } from 'react';
import { Section, SectionHeader, Card } from '../../components/ui/Section';
import { EquationBlock, TeX } from '../../components/ui/Math';
import { SliderControl, Collapsible, InfoBox, Tabs } from '../../components/ui/Controls';
import {
  mexicanHat,
  mexicanHatProfile,
  findZeroCrossing,
  computeInteractionGrid,
  validateMexicanHatParams,
  gaussianNeighborhood,
  MexicanHatParams,
} from '../../lib/math/mexican-hat';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export function MexicanHatJourney() {
  // Explorer Parameter State
  const [params, setParams] = useState<MexicanHatParams>({
    excitationAmplitude: 1.2,
    inhibitionAmplitude: 0.6,
    excitationWidth: 1.5,
    inhibitionWidth: 3.5,
  });

  const [compareMode, setCompareMode] = useState<'profile' | 'compare' | 'heatmap'>('profile');
  const [selectedNeuronIdx, setSelectedNeuronIdx] = useState<number>(3); // for 1D architecture
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  // Zero-crossing distance
  const zeroCrossing = useMemo(() => findZeroCrossing(params), [params]);

  // Curve data points for r ∈ [-8, 8]
  const curveData = useMemo(() => {
    const points = [];
    for (let r = -8; r <= 8; r += 0.25) {
      const val = mexicanHat(r, params);
      const gVal = gaussianNeighborhood(r, params.excitationWidth);
      points.push({
        r: Number(r.toFixed(2)),
        mexicanHat: Number(val.toFixed(4)),
        gaussian: Number(gVal.toFixed(4)),
      });
    }
    return points;
  }, [params]);

  // 2D Heatmap rendering on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridSize = 41; // 41x41 grid
    const center = Math.floor(gridSize / 2);
    const grid = computeInteractionGrid(gridSize, center, center, params);

    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Find max absolute value for normalization
    let maxAbs = 0.001;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        maxAbs = Math.max(maxAbs, Math.abs(grid[i][j]));
      }
    }

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const val = grid[i][j];
        if (val > 0) {
          // Excitatory: Emerald/Green
          const intensity = Math.min(1, val / maxAbs);
          ctx.fillStyle = `rgba(16, 185, 129, ${intensity * 0.9 + 0.1})`;
        } else if (val < 0) {
          // Inhibitory: Rose/Red
          const intensity = Math.min(1, Math.abs(val) / maxAbs);
          ctx.fillStyle = `rgba(244, 63, 94, ${intensity * 0.8 + 0.1})`;
        } else {
          ctx.fillStyle = '#0a0b1a';
        }
        ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
  }, [params]);

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Model Journey 02
            </span>
          </div>
          <h1 className="text-hero font-black text-text-primary tracking-tight mb-4">
            Mexican Hat <span className="text-gradient-emerald">— The Field of Influence</span>
          </h1>
          <p className="text-subtitle text-text-secondary leading-relaxed">
            The canonical model of spatial lateral interaction: short-range excitation coupled with
            surrounding long-range inhibition that generates localized activity bubbles and edge sharpening.
          </p>
        </div>
      </Section>

      {/* Section 1: The Problem */}
      <Section>
        <SectionHeader
          title="The Problem That Needed Solving"
          subtitle="How biological sensory maps establish sharp localized activity without global arbitrators."
          badge="Biological Roots"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <p>
              In vertebrate sensory cortex (visual, auditory, somatosensory), neurons are organized into continuous
              topographic sheets. When an external stimulus lands on a patch of the retina or skin, thousands of
              adjacent receptors fire simultaneously with varying intensities.
            </p>
            <p>
              If every active neuron simply passed its raw activation forward, sensory representations would suffer
              from massive optical blurring and diffuse cross-talk. Conversely, if only one single neuron in the
              entire cortex were permitted to fire (like MAXNET), the system could not represent continuous shapes,
              textures, or multi-point spatial stimuli.
            </p>
            <p>
              What spatial wiring pattern enables a neural sheet to simultaneously reinforce coherent local regions
              while suppressing surrounding diffuse clutter and accentuating contrasting contours?
            </p>
          </div>

          <Card className="border-emerald-500/20">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              The Center-Surround Receptive Field
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              In 1953, Stephen Kuffler observed that retinal ganglion cells possess concentric receptive fields:
              stimulating the center of the receptive field excites the neuron, whereas stimulating the annular
              surround inhibits it.
            </p>
            <div className="p-3 bg-void-200 border border-white/5 rounded-lg text-xs text-emerald-300 font-mono">
              h(r) &gt; 0 for small r (cooperation)
              <br />
              h(r) &lt; 0 for intermediate r (competition)
              <br />
              h(r) → 0 for large r (neutrality)
            </div>
          </Card>
        </div>
      </Section>

      {/* Section 2: Intuition */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Intuition: Cheering Neighbors, Jeering Crowd"
          subtitle="Spatial balance between local community cooperation and global perimeter competition."
          badge="Mental Model"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="text-emerald-400 font-bold text-lg mb-1">1. The Inner Circle (Excitation)</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Nearby neurons represent nearly identical features in the world. They reinforce each other with positive
              synaptic feedback, pulling their activations up together into a stable, coherent cluster.
            </p>
          </Card>

          <Card>
            <div className="text-rose-400 font-bold text-lg mb-1">2. The Moat (Inhibition)</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              At moderate spatial distances, neurons represent competing feature interpretations. They send negative
              inhibitory signals that suppress rivals and carve a dark perimeter (a moat) around the active cluster.
            </p>
          </Card>

          <Card>
            <div className="text-text-muted font-bold text-lg mb-1">3. The Horizon (Decay)</div>
            <p className="text-xs text-text-secondary leading-relaxed">
              At distant coordinates across the cortex, connection strength decays to zero. Distant regions can form
              their own independent activity clusters without mutual interference.
            </p>
          </Card>
        </div>
      </Section>

      {/* Section 3: Architecture */}
      <Section>
        <SectionHeader
          title="Architecture: Enter the Field"
          subtitle="Explore the spatial coupling weights emitted by a selected neuron across a 1D neural array."
          badge="Network Topology"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono text-text-dim uppercase">
                Click any neuron below to designate it as the active source
              </span>
              <span className="text-xs font-mono text-emerald-400">
                Selected Source: Neuron #{selectedNeuronIdx + 1}
              </span>
            </div>

            {/* 1D Neuron Array Visualization */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto py-4">
              {Array.from({ length: 9 }).map((_, idx) => {
                const dist = Math.abs(idx - selectedNeuronIdx);
                const weight = mexicanHat(dist * 1.2, params);
                const isSelected = idx === selectedNeuronIdx;
                const isExcitatory = weight > 0.05 && !isSelected;
                const isInhibitory = weight < -0.05;

                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedNeuronIdx(idx)}
                    className={`flex-1 min-w-[70px] p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105'
                        : isExcitatory
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isInhibitory
                        ? 'bg-rose-500/10 border-rose-500/30'
                        : 'bg-void-200 border-white/5'
                    }`}
                  >
                    <div className="relative mb-1">
                      {isSelected && (
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400 beacon-aura" />
                      )}
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                          isSelected
                            ? 'bg-emerald-400 text-void-500 shadow-lg shadow-emerald-400/50'
                            : isExcitatory
                            ? 'bg-emerald-500/30 text-emerald-300'
                            : isInhibitory
                            ? 'bg-rose-500/30 text-rose-300'
                            : 'bg-white/10 text-text-dim'
                        }`}
                      >
                        N{idx + 1}
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-text-dim">dist: {dist}</div>
                    <div
                      className={`text-xs font-mono font-bold mt-1 ${
                        isSelected
                          ? 'text-emerald-400'
                          : isExcitatory
                          ? 'text-emerald-300'
                          : isInhibitory
                          ? 'text-rose-400'
                          : 'text-text-muted'
                      }`}
                    >
                      {isSelected ? 'SOURCE' : weight.toFixed(3)}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-center gap-6 text-xs font-mono mt-4 pt-4 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Excitatory coupling (\(h(r) &gt; 0\))
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Inhibitory coupling (\(h(r) &lt; 0\))
              </span>
              <span className="flex items-center gap-1.5 text-text-dim">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Asymptotically zero
              </span>
            </div>
          </Card>
        </div>
      </Section>

      {/* Section 4: Mathematical Foundations */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Mathematical Foundations"
          subtitle="Formulating the Difference of Gaussians (DoG) and analytical zero-crossings."
          badge="Mathematical Formulation"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-2">1. Continuous Difference of Gaussians (DoG)</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              The continuous lateral interaction kernel as a function of radial Euclidean distance \(r\) is defined by subtracting
              a broader inhibitory Gaussian from a narrower excitatory Gaussian:
            </p>

            <EquationBlock
              tex="h(r) = A_e \exp\left(-\frac{r^2}{2\sigma_e^2}\right) - A_i \exp\left(-\frac{r^2}{2\sigma_i^2}\right)"
              description="Where A_e, A_i are peak amplitudes and σ_e, σ_i represent the spatial dispersion scales."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-emerald-400">
                The Geometric Conditions for a Mexican Hat Shape
              </h4>
              <ul className="space-y-2 text-xs text-text-secondary leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Narrow Excitation vs Broad Inhibition:</strong> Must satisfy \(\sigma_i &gt; \sigma_e\).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Positive Central Peak:</strong> At \(r = 0\), \(h(0) = A_e - A_i &gt; 0\), requiring \(A_e &gt; A_i\).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span><strong>Inhibitory Trough:</strong> Because \(\sigma_i &gt; \sigma_e\), the negative Gaussian decays more slowly, dominating intermediate distances.</span>
                </li>
              </ul>
            </Card>

            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-emerald-400">
                Analytical Zero-Crossing Radius \(r_0\)
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                The exact boundary where interaction switches from excitation to inhibition occurs where \(h(r_0) = 0\):
              </p>
              <TeX
                tex="r_0 = \sqrt{\frac{2\sigma_e^2 \sigma_i^2}{\sigma_i^2 - \sigma_e^2} \ln\left(\frac{A_e}{A_i}\right)}"
                display
              />
              <p className="text-xs text-text-muted mt-2">
                Current parameters yield:{' '}
                <strong className="text-emerald-300 font-mono">
                  {zeroCrossing !== null ? `r₀ = ${zeroCrossing.toFixed(3)}` : 'No real crossing'}
                </strong>
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Section 5: Live Interactive Explorer */}
      <Section>
        <SectionHeader
          title="The Live Algorithm: Field Explorer"
          subtitle="Manipulate amplitudes and spatial widths in real time. Inspect 1D profiles, 2D heatmaps, and compare against Gaussian kernels."
          badge="Interactive Laboratory"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-6">
          {/* Sliders Panel */}
          <div className="glass-card p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SliderControl
              label="Excitation Amp (A_e)"
              value={params.excitationAmplitude}
              min={0.5}
              max={3.0}
              step={0.1}
              onChange={(val) => setParams((p) => ({ ...p, excitationAmplitude: val }))}
              color="emerald"
            />
            <SliderControl
              label="Inhibition Amp (A_i)"
              value={params.inhibitionAmplitude}
              min={0.1}
              max={Math.min(params.excitationAmplitude - 0.1, 2.0)}
              step={0.05}
              onChange={(val) => setParams((p) => ({ ...p, inhibitionAmplitude: val }))}
              color="emerald"
            />
            <SliderControl
              label="Excitation Width (σ_e)"
              value={params.excitationWidth}
              min={0.5}
              max={3.0}
              step={0.1}
              onChange={(val) => setParams((p) => ({ ...p, excitationWidth: val }))}
              color="emerald"
            />
            <SliderControl
              label="Inhibition Width (σ_i)"
              value={params.inhibitionWidth}
              min={params.excitationWidth + 0.5}
              max={8.0}
              step={0.1}
              onChange={(val) => setParams((p) => ({ ...p, inhibitionWidth: val }))}
              color="emerald"
            />
          </div>

          {/* Mode Selector Tabs */}
          <div className="flex justify-between items-center">
            <Tabs
              tabs={[
                { id: 'profile', label: '1D Radial Profile' },
                { id: 'compare', label: 'Compare vs Gaussian' },
                { id: 'heatmap', label: '2D Spatial Heatmap' },
              ]}
              activeTab={compareMode}
              onTabChange={(id) => setCompareMode(id as any)}
            />
            <div className="text-xs font-mono text-emerald-400">
              Zero-crossing: r₀ = {zeroCrossing ? zeroCrossing.toFixed(3) : 'N/A'}
            </div>
          </div>

          {/* Visualization Displays */}
          {compareMode === 'profile' && (
            <Card className="p-4">
              <div className="text-xs font-mono text-text-dim mb-2 uppercase">
                Continuous Radial Function h(r) with Zero-Crossing Indicator
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="r" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d0e24',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    {zeroCrossing && (
                      <ReferenceLine x={Number(zeroCrossing.toFixed(2))} stroke="#f59e0b" label="r₀" />
                    )}
                    {zeroCrossing && (
                      <ReferenceLine x={-Number(zeroCrossing.toFixed(2))} stroke="#f59e0b" label="-r₀" />
                    )}
                    <Line
                      type="monotone"
                      dataKey="mexicanHat"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      name="Mexican Hat h(r)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {compareMode === 'compare' && (
            <Card className="p-4">
              <div className="text-xs font-mono text-text-dim mb-2 uppercase">
                Mexican Hat vs Standard Gaussian Neighborhood
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curveData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="r" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0d0e24',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="mexicanHat"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      name="Mexican Hat (Excitation + Inhibition)"
                    />
                    <Line
                      type="monotone"
                      dataKey="gaussian"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="Standard Gaussian (Excitation Only)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Notice that standard SOM Gaussian neighborhoods strictly stay positive (\(g(r) &gt; 0\)), drawing all
                neighbors closer. The Mexican Hat, by contrast, repels intermediate neighbors (\(h(r) &lt; 0\)), sharpening
                cluster boundaries.
              </p>
            </Card>
          )}

          {compareMode === 'heatmap' && (
            <Card className="p-6 flex flex-col items-center">
              <div className="text-xs font-mono text-text-dim mb-4 uppercase">
                2D Topographic Field (Center = Active Source Neuron)
              </div>
              <div className="relative border border-white/10 rounded-xl overflow-hidden shadow-2xl bg-void-500">
                <canvas ref={canvasRef} width={340} height={340} className="block" />
              </div>
              <div className="flex gap-6 text-xs font-mono mt-4">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm" /> Excitatory Center Core
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-3 bg-rose-500 rounded-sm" /> Inhibitory Surround Ring
                </span>
              </div>
            </Card>
          )}
        </div>
      </Section>

      {/* Section 6: Verifiable Worked Numerical Example */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Complete Worked Numerical Example"
          subtitle="Hand-calculated coupling weights and dynamic state updates across 7 discrete neurons."
          badge="Manual Calculation"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-6">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Consider a 1D lattice of 7 neurons at integer indices \([0, 1, 2, 3, 4, 5, 6]\). Let neuron 3 be strongly
            stimulated. We configure the kernel with:
          </p>

          <div className="p-3 bg-void-200 border border-white/5 rounded-xl font-mono text-xs text-emerald-300 inline-block">
            A_e = 1.0, \quad A_i = 0.5, \quad \sigma_e = 1.0, \quad \sigma_i = 2.0
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-left text-text-dim">
                  <th className="py-2.5 px-3">Neuron Index</th>
                  <th className="px-3">Distance <TeX tex="r = |i - 3|" /></th>
                  <th className="px-3">Excitatory <TeX tex="e^{-r^2/2}" /></th>
                  <th className="px-3">Inhibitory <TeX tex="0.5 e^{-r^2/8}" /></th>
                  <th className="px-3">Net Weight <TeX tex="h(r)" /></th>
                  <th className="px-3">Regime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { idx: 3, r: 0, ex: 1.0, in: 0.5, net: 0.5, reg: 'Center (Excited)' },
                  { idx: '2 & 4', r: 1, ex: 0.6065, in: 0.4412, net: 0.1653, reg: 'Near Neighbor (Excited)' },
                  { idx: '1 & 5', r: 2, ex: 0.1353, in: 0.3033, net: -0.1680, reg: 'Intermediate (Inhibited)' },
                  { idx: '0 & 6', r: 3, ex: 0.0111, in: 0.1623, net: -0.1512, reg: 'Perimeter (Inhibited)' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 text-text-primary font-bold">Node {row.idx}</td>
                    <td className="px-3">{row.r}</td>
                    <td className="px-3 text-emerald-300">{row.ex.toFixed(4)}</td>
                    <td className="px-3 text-rose-300">{row.in.toFixed(4)}</td>
                    <td
                      className={`px-3 font-bold ${
                        row.net > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {row.net > 0 ? `+${row.net.toFixed(4)}` : row.net.toFixed(4)}
                    </td>
                    <td className="px-3 text-text-dim">{row.reg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>

      {/* Section 7: Real-World Applications */}
      <Section>
        <SectionHeader
          title="From Theory to Real-World Systems"
          subtitle="Computer vision edge operators and continuous cortical field theory."
          badge="Applied Engineering"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
              Computer Vision
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              Laplacian of Gaussian (LoG) & Marr-Hildreth Edge Detection
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              David Marr and Ellen Hildreth demonstrated that taking the second spatial derivative of a smoothed Gaussian
              filter (\(\nabla^2 G\)) yields a continuous 2D Mexican Hat filter. Convolving an image with this kernel
              isolates zero-crossings, identifying sharp boundaries and intensity edges in visual scenes.
            </p>
            <div className="text-[11px] font-mono text-text-muted">
              Evidence Level: <strong>Seminal Computer Vision Publication</strong> (Marr & Hildreth, 1980).
            </div>
          </Card>

          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 mb-2">
              Computational Neuroscience
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              Amari Neural Field Equations (Pattern Formation)
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Shun-ichi Amari formalized continuous cortical layers where lateral connections follow Mexican Hat kernels.
              Under appropriate global inhibition thresholds, homogeneous neural sheets spontaneously break symmetry
              to form persistent localized "bumps" of activity (working memory representations and spatial navigation head-direction cells).
            </p>
            <div className="text-[11px] font-mono text-text-muted">
              Evidence Level: <strong>Documented Mathematical Neuroscience</strong> (Amari, 1977).
            </div>
          </Card>
        </div>
      </Section>

      {/* Section 8: Implementation From Scratch */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Implementation From Scratch"
          subtitle="Vectorized Python implementation with discrete spatial convolution."
          badge="Code Laboratory"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-4">
          <div className="code-block">
            <pre className="text-xs text-text-secondary font-mono leading-relaxed">
{`import numpy as np

def mexican_hat_kernel(size: int, sigma_e: float = 1.0, sigma_i: float = 2.5, 
                       a_e: float = 1.0, a_i: float = 0.5) -> np.ndarray:
    """
    Generate a 1D discrete Mexican Hat (Difference of Gaussians) kernel.
    
    Parameters:
        size: Length of kernel (odd integer recommended).
        sigma_e, sigma_i: Widths of excitatory and inhibitory components (sigma_i > sigma_e).
        a_e, a_i: Amplitudes (a_e > a_i).
        
    Returns:
        kernel: 1D array normalized such that peak center is positive.
    """
    if sigma_i <= sigma_e:
        raise ValueError("Inhibitory sigma must exceed excitatory sigma.")
    if a_e <= a_i:
        raise ValueError("Excitatory amplitude must exceed inhibitory amplitude.")
        
    radius = size // 2
    r = np.arange(-radius, radius + 1, dtype=np.float64)
    
    # Difference of Gaussians equation
    g_e = a_e * np.exp(-0.5 * (r / sigma_e) ** 2)
    g_i = a_i * np.exp(-0.5 * (r / sigma_i) ** 2)
    kernel = g_e - g_i
    return kernel

def step_neural_field(u: np.ndarray, kernel: np.ndarray, decay: float = 0.1) -> np.ndarray:
    """Apply one step of lateral interaction dynamics: u(t+1) = max(0, u(t) + conv(u, K) - decay)"""
    interaction = np.convolve(u, kernel, mode='same')
    return np.maximum(0.0, u + interaction - decay)`}
            </pre>
          </div>
        </div>
      </Section>

      {/* Section 9: Strengths & Weaknesses */}
      <Section>
        <SectionHeader
          title="Strengths, Weaknesses, and Comparisons"
          subtitle="Engineering assessment of lateral interaction kernels."
          badge="Tradeoffs"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <h3 className="font-bold text-emerald-400 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Advantages
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>• Natural topological feature enhancement without supervisory signals.</li>
              <li>• Filters low-frequency background noise while preserving sharp spatial edges.</li>
              <li>• Forms localized solitary excitation bubbles in continuous neural field models.</li>
            </ul>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <h3 className="font-bold text-rose-400 text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Limitations
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>• Static kernel: does not learn or adapt to input statistics automatically.</li>
              <li>• Boundary reflections can create spurious excitation artifacts at grid borders.</li>
              <li>• Sensitive to ratio \(\sigma_i / \sigma_e\): too wide leads to over-inhibition; too narrow eliminates the inhibitory moat.</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Section 10: Knowledge Check */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Interactive Knowledge Check"
          subtitle="Test your grasp of lateral interaction mechanics."
          badge="Assessment"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-6 max-w-3xl">
          {[
            {
              id: 1,
              q: 'What fundamental parameter condition is strictly necessary to produce a surrounding inhibitory trough in a Difference of Gaussians?',
              options: [
                'σ_e must be strictly greater than σ_i',
                'σ_i must be strictly greater than σ_e (inhibitory width wider than excitatory width)',
                'A_i must exceed A_e',
                'Both sigmas must be identical',
              ],
              correct: 1,
              explanation:
                'Because the inhibitory Gaussian must spread farther out than the excitatory Gaussian, its variance σ_i must be strictly larger than σ_e.',
            },
            {
              id: 2,
              q: 'How does a Mexican Hat neighborhood function differ from the standard Gaussian neighborhood commonly used in Self-Organizing Maps?',
              options: [
                'Mexican Hat is purely positive everywhere on the map.',
                'Mexican Hat possesses negative lateral regions that actively suppress intermediate neurons.',
                'Gaussian neighborhoods require integer inputs only.',
                'There is no mathematical difference.',
              ],
              correct: 1,
              explanation:
                'Standard SOM neighborhoods use a Gaussian kernel that is strictly positive everywhere (all neighbors move toward the input). A Mexican Hat kernel introduces negative regions that repel intermediate neurons.',
            },
            {
              id: 3,
              q: 'In computer vision edge detection, the Mexican Hat is mathematically equivalent to which differential operator on a 2D Gaussian?',
              options: [
                'The gradient (first derivative)',
                'The Laplacian (second derivative: ∇²G)',
                'The Fourier transform',
                'The median filter',
              ],
              correct: 1,
              explanation:
                'Marr and Hildreth demonstrated that the Laplacian of a 2D Gaussian (LoG) is closely approximated by the Difference of Gaussians (DoG), yielding the classic inverted Mexican Hat profile.',
            },
          ].map((item) => {
            const selected = quizAnswers[item.id];
            const isSub = quizSubmitted[item.id];
            const isCorrect = selected === item.correct;

            return (
              <Card key={item.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
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
                          ? 'border border-emerald-400 bg-emerald-400/10 text-emerald-200'
                          : 'border border-white/5 bg-void-200 hover:bg-white/5 text-text-secondary'
                      }`}
                    >
                      <span>{opt}</span>
                      {selected === optIdx && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </button>
                  ))}
                </div>

                {!isSub ? (
                  <button
                    disabled={selected === undefined}
                    onClick={() => setQuizSubmitted((prev) => ({ ...prev, [item.id]: true }))}
                    className="px-4 py-2 bg-emerald-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors"
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
      <Section>
        <SectionHeader
          title="Authoritative References & Literature"
          subtitle="Foundational research establishing lateral interactions in computational neuroscience."
          badge="Bibliography"
          badgeColor="from-emerald-500 to-teal-500"
        />

        <div className="space-y-3 max-w-3xl text-xs text-text-secondary">
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>1. Marr, D., & Hildreth, E. (1980).</strong> Theory of edge detection. <em>Proceedings of the Royal Society of London. Series B. Biological Sciences</em>, 207(1167), 187–217.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>2. Amari, S. I. (1977).</strong> Dynamics of pattern formation in lateral-inhibition type neural fields. <em>Biological Cybernetics</em>, 27(2), 77–87.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>3. Rodieck, R. W. (1965).</strong> Quantitative analysis of cat retinal ganglion cell response to visual stimuli. <em>Vision Research</em>, 5(11), 583–601.
          </div>
        </div>
      </Section>
    </div>
  );
}
