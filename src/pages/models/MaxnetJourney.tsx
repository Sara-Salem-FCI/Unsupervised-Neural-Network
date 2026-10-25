import { useState, useMemo, useEffect } from 'react';
import { Section, SectionHeader, Card } from '../../components/ui/Section';
import { EquationBlock, TeX } from '../../components/ui/Math';
import { SliderControl, PlaybackControls, Collapsible, InfoBox, Tabs } from '../../components/ui/Controls';
import {
  createMaxnetState,
  maxnetStep,
  runMaxnet,
  validateMaxnetConfig,
  isConverged,
  MaxnetState,
} from '../../lib/math/maxnet';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Zap, Play, CheckCircle2, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';

const NEURON_COLORS = [
  '#f59e0b', // Amber 500
  '#38bdf8', // Sky 400
  '#a855f7', // Purple 500
  '#10b981', // Emerald 500
  '#f43f5e', // Rose 500
  '#eab308', // Yellow 500
  '#6366f1', // Indigo 500
  '#ec4899', // Pink 500
];

export function MaxnetJourney() {
  // --- Live Algorithm Simulation State ---
  const [numNeurons, setNumNeurons] = useState(4);
  const [initialInputs, setInitialInputs] = useState<number[]>([0.7, 0.5, 0.3, 0.1]);
  const [epsilon, setEpsilon] = useState(0.18);
  const [simState, setSimState] = useState<MaxnetState>(() =>
    createMaxnetState([0.7, 0.5, 0.3, 0.1], { epsilon: 0.18, maxIterations: 100 })
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'math'>('visual');

  // Interactive Calculator State (Chapter 4)
  const [calcInputs, setCalcInputs] = useState<number[]>([0.8, 0.5, 0.2]);
  const [calcEps, setCalcEps] = useState(0.2);

  // Quiz State (Chapter 10)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  // Maximum valid epsilon for numNeurons
  const maxAllowedEpsilon = useMemo(() => 1 / numNeurons, [numNeurons]);

  // Handle neuron count change
  const handleNumNeuronsChange = (n: number) => {
    setNumNeurons(n);
    const newInputs = Array.from({ length: n }, (_, i) =>
      Number((Math.max(0.1, 0.8 - i * 0.15)).toFixed(2))
    );
    setInitialInputs(newInputs);
    const newEps = Number((0.75 / n).toFixed(3));
    setEpsilon(newEps);
    const newState = createMaxnetState(newInputs, { epsilon: newEps, maxIterations: 100 });
    setSimState(newState);
    setIsPlaying(false);
  };

  const handleInputChange = (idx: number, val: number) => {
    const nextInputs = [...initialInputs];
    nextInputs[idx] = Math.max(0, val);
    setInitialInputs(nextInputs);
    const newState = createMaxnetState(nextInputs, { epsilon, maxIterations: 100 });
    setSimState(newState);
    setIsPlaying(false);
  };

  const handleEpsilonChange = (newEps: number) => {
    setEpsilon(newEps);
    try {
      validateMaxnetConfig({ epsilon: newEps, maxIterations: 100 }, initialInputs.length);
      const newState = createMaxnetState(initialInputs, { epsilon: newEps, maxIterations: 100 });
      setSimState(newState);
    } catch {
      // invalid eps will just clamp
    }
  };

  const handleStep = () => {
    if (!simState.converged && simState.iteration < 100) {
      setSimState((prev) => maxnetStep(prev));
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSimState(createMaxnetState(initialInputs, { epsilon, maxIterations: 100 }));
  };

  const handleSetTieExample = () => {
    const tied = [0.6, 0.6, 0.2, 0.1];
    setNumNeurons(4);
    setInitialInputs(tied);
    setEpsilon(0.2);
    setSimState(createMaxnetState(tied, { epsilon: 0.2, maxIterations: 100 }));
    setIsPlaying(false);
  };

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;
    if (simState.converged || simState.iteration >= 100) {
      setIsPlaying(false);
      return;
    }
    const timer = setInterval(() => {
      setSimState((prev) => {
        if (prev.converged || prev.iteration >= 100) {
          setIsPlaying(false);
          return prev;
        }
        return maxnetStep(prev);
      });
    }, 600);
    return () => clearInterval(timer);
  }, [isPlaying, simState.converged, simState.iteration]);

  // Chart data format
  const chartData = useMemo(() => {
    return simState.history.map((stepVals, iterIdx) => {
      const entry: Record<string, number> = { iteration: iterIdx };
      stepVals.forEach((v, nodeIdx) => {
        entry[`Node_${nodeIdx + 1}`] = Number(v.toFixed(4));
      });
      return entry;
    });
  }, [simState.history]);

  // One-step calculator output
  const calcOutput = useMemo(() => {
    const totalSum = calcInputs.reduce((a, b) => a + b, 0);
    return calcInputs.map((val) => {
      const sumOthers = totalSum - val;
      const raw = val - calcEps * sumOthers;
      return {
        input: val,
        sumOthers: Number(sumOthers.toFixed(3)),
        raw: Number(raw.toFixed(4)),
        clamped: Number(Math.max(0, raw).toFixed(4)),
      };
    });
  }, [calcInputs, calcEps]);

  // Total sum of activations in simulation
  const currentTotalSum = useMemo(() => {
    return simState.activations.reduce((acc, v) => acc + v, 0);
  }, [simState.activations]);

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 mb-4">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Model Journey 01
            </span>
          </div>
          <h1 className="text-hero font-black text-text-primary tracking-tight mb-4">
            MAXNET <span className="text-gradient-gold">— The Arena</span>
          </h1>
          <p className="text-subtitle text-text-secondary leading-relaxed">
            A fixed-weight, fully interconnected competitive neural network that isolates the maximum
            activation through iterative mutual inhibition.
          </p>
        </div>
      </Section>

      {/* Chapter 1: The Problem */}
      <Section>
        <SectionHeader
          title="Chapter 1 — The Problem That Needed Solving"
          subtitle="Selecting the strongest candidate without centralized supervision or sorting routines."
          badge="Context & Motivation"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <p>
              Imagine an array of sensory pattern detectors or classification subnets. Each detector emits
              a continuous score indicating its confidence that an observed input matches its assigned template.
              To make a definitive categorical decision, the overall system requires a <strong>winner-takes-all (WTA)</strong> decision:
              exactly one detector must be flagged as the victor, while all competitors are silenced.
            </p>
            <p>
              In conventional von Neumann computing, picking a maximum is trivial: iterate through an array with a
              single <code className="text-amber-400">max()</code> comparator in \(O(m)\) steps. But in parallel analog hardware,
              neuromorphic architectures, or biological assemblies of neurons, there is no central processor
              or global memory bus. Every processing element can communicate only via local connections.
            </p>
            <p>
              How can a distributed collection of independent neurons, possessing no global sorting register,
              collaborate to extinguish all activations except the largest one?
            </p>
          </div>

          <Card className="border-amber-500/20">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              The Architectural Requirement
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">1. Fully Distributed:</span> No central arbiter or global sorting comparator.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">2. Fixed Weights:</span> No slow gradient-descent or synaptic plasticity required just to pick a winner.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">3. Monotonic Suppression:</span> Weaker activations must shrink faster than stronger activations until zeroed out.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 font-bold">4. Definitive Halting:</span> Convergence to a clean binary state (1 winner, \(m-1\) zeros).
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Chapter 2: Intuition */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 2 — Intuition: Gladiators in the Arena"
          subtitle="Every neuron reinforces its own signal while exerting equal suppression on every rival."
          badge="Mental Model"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-6">
          <p className="text-text-secondary leading-relaxed max-w-3xl text-sm">
            Picture \(m\) gladiators competing in an enclosed amphitheater. Each gladiator possesses a certain amount
            of initial stamina (activation \(a_i\)). In every round of combat:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-amber-400 font-bold text-lg mb-1">1. Self-Preservation</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Each gladiator keeps 100% of their current stamina into the next round (<TeX tex="w_{ii} = 1" />). They do not fatigue on their own.
              </p>
            </Card>

            <Card>
              <div className="text-amber-400 font-bold text-lg mb-1">2. Mutual Crossfire</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Every gladiator attacks every other competitor with an intensity proportional to their own stamina, scaled by a fixed fraction &epsilon; (<TeX tex="w_{ij} = -\varepsilon" />).
              </p>
            </Card>

            <Card>
              <div className="text-amber-400 font-bold text-lg mb-1">3. Knockout Threshold</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The moment a gladiator’s stamina drops to or below zero, they are eliminated and removed from combat (ReLU clamping: \(\max(0, \cdot)\)).
              </p>
            </Card>
          </div>

          <InfoBox type="tip" title="Why the strongest gladiator wins">
            A gladiator with higher stamina inflicts massive damage on rivals while receiving proportionally less damage,
            because the sum of attacks directed at them excludes their own large contribution! Consequently, smaller activations
            are driven to zero exponentially faster than the leader.
          </InfoBox>
        </div>
      </Section>

      {/* Chapter 3: Architecture */}
      <Section>
        <SectionHeader
          title="Chapter 3 — Architecture: Enter the Network"
          subtitle="A recurrent neural ring with excitatory self-loops and symmetric lateral inhibition."
          badge="Wiring Diagram"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <Card className="flex flex-col items-center justify-center p-6">
            <div className="w-full text-center text-xs text-text-dim font-mono mb-4">
              INTERCONNECTED TOPOLOGY (\(m = 4\))
            </div>
            <svg viewBox="0 0 400 320" className="w-full max-w-md h-auto">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" opacity="0.6" />
                </marker>
              </defs>

              {/* Inhibitory cross-connections */}
              {[
                [100, 80, 300, 80],
                [100, 80, 300, 240],
                [100, 80, 100, 240],
                [300, 80, 100, 240],
                [300, 80, 300, 240],
                [100, 240, 300, 240],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.3"
                />
              ))}

              {/* Self-excitatory loops */}
              {[
                [100, 80, -30, -30],
                [300, 80, 30, -30],
                [100, 240, -30, 30],
                [300, 240, 30, 30],
              ].map(([cx, cy, ox, oy], i) => (
                <path
                  key={`loop-${i}`}
                  d={`M ${cx} ${cy - 15} C ${cx + ox} ${cy + oy}, ${cx + ox * 1.5} ${cy + oy * 0.5}, ${cx - 15} ${cy}`}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              ))}

              {/* Neuron Nodes */}
              {[
                { cx: 100, cy: 80, label: 'Neuron 1', val: simState.activations[0] ?? 0.7 },
                { cx: 300, cy: 80, label: 'Neuron 2', val: simState.activations[1] ?? 0.5 },
                { cx: 300, cy: 240, label: 'Neuron 3', val: simState.activations[2] ?? 0.3 },
                { cx: 100, cy: 240, label: 'Neuron 4', val: simState.activations[3] ?? 0.1 },
              ].map((n, i) => (
                <g key={i}>
                  <circle
                    cx={n.cx}
                    cy={n.cy}
                    r={26 + (n.val > 0 ? n.val * 12 : 0)}
                    fill="#141530"
                    stroke={NEURON_COLORS[i]}
                    strokeWidth={n.val > 0 ? '3' : '1'}
                    className="transition-all duration-300"
                  />
                  <text
                    x={n.cx}
                    y={n.cy - 4}
                    textAnchor="middle"
                    fill="#f1f5f9"
                    fontSize="11"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    a_{i + 1}
                  </text>
                  <text
                    x={n.cx}
                    y={n.cy + 10}
                    textAnchor="middle"
                    fill={n.val > 0 ? '#fbbf24' : '#64748b'}
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {n.val.toFixed(2)}
                  </text>
                </g>
              ))}
            </svg>

            <div className="flex gap-4 text-xs font-mono mt-4">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-0.5 bg-emerald-400" /> Self-excitation (<TeX tex="w_{ii} = 1" />)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-3 h-0.5 border-b border-dashed border-amber-400" /> Lateral inhibition (<TeX tex="w_{ij} = -\varepsilon" />)
              </span>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-text-primary">The MAXNET Weight Matrix</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              For a network with <TeX tex="m" /> nodes, the synaptic connection matrix <TeX tex="\mathbf{W} \in \mathbb{R}^{m \times m}" /> has
              ones along the principal diagonal and <TeX tex="-\varepsilon" /> on all off-diagonal entries:
            </p>

            <EquationBlock
              tex="\mathbf{W} = \begin{pmatrix} 1 & -\varepsilon & \cdots & -\varepsilon \\ -\varepsilon & 1 & \cdots & -\varepsilon \\ \vdots & \vdots & \ddots & \vdots \\ -\varepsilon & -\varepsilon & \cdots & 1 \end{pmatrix}"
              label="Weight Matrix Structure"
            />

            <p className="text-xs text-text-muted leading-relaxed">
              Because this matrix is completely symmetric (<TeX tex="w_{ij} = w_{ji}" />) and has no learned parameters,
              it requires zero gradient training. The dynamics are entirely dictated by the continuous feedback loops.
            </p>
          </div>
        </div>
      </Section>

      {/* Chapter 4: Mathematical Foundations */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 4 — Mathematical Foundations"
          subtitle="Formulation, convergence boundaries, and exact iteration rules."
          badge="Mathematical Rigor"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-8">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-2">1. The Iteration Update Law</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              Given a set of non-negative initial activations \(a_i(0) \ge 0\), the activation of node \(i\) at time step \(t+1\) is governed by:
            </p>

            <EquationBlock
              tex="a_i(t+1) = \max\left(0,\, a_i(t) - \varepsilon \sum_{j \ne i} a_j(t)\right)"
              description="Each node retains its current activation minus a fraction ε of the sum of all other nodes' activations."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-amber-400">
                The Fundamental Stability Constraint
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                To guarantee that activations do not oscillate or extinguish all nodes simultaneously in the first step:
              </p>
              <TeX tex="0 < \varepsilon < \frac{1}{m}" display />
              <p className="text-xs text-text-muted mt-2">
                Where <TeX tex="m" /> is the total count of competing neurons. If <TeX tex="\varepsilon \ge 1/m" />, a node whose competitors
                sum up to more than <TeX tex="1/\varepsilon" /> can be decimated prematurely even if it was the rightful maximum!
              </p>
            </Card>

            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-amber-400">
                The Sum Trick: <TeX tex="O(m)" /> Computation
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                Notice that <TeX tex="\sum_{j \ne i} a_j(t) = \left(\sum_{k=1}^m a_k(t)\right) - a_i(t)" />. Rewriting the update:
              </p>
              <TeX tex="a_i(t+1) = \max\left(0,\, (1+\varepsilon)a_i(t) - \varepsilon S(t)\right)" display />
              <p className="text-xs text-text-muted mt-2">
                Where <TeX tex="S(t) = \sum_{k=1}^m a_k(t)" />. By computing <TeX tex="S(t)" /> once in <TeX tex="O(m)" />, all <TeX tex="m" /> updates take <TeX tex="O(1)" /> each,
                reducing the complexity from <TeX tex="O(m^2)" /> down to <TeX tex="O(m)" />.
              </p>
            </Card>
          </div>

          {/* Interactive 1-Step Calculator */}
          <div className="pt-4">
            <h3 className="text-base font-bold text-text-primary mb-3">Interactive Step Calculator</h3>
            <Card className="border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {calcInputs.map((val, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs font-mono text-text-muted">Node {idx + 1} Input</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="5"
                      value={val}
                      onChange={(e) => {
                        const next = [...calcInputs];
                        next[idx] = parseFloat(e.target.value) || 0;
                        setCalcInputs(next);
                      }}
                      className="w-full px-3 py-1.5 bg-void-200 border border-white/10 rounded-lg text-sm font-mono text-amber-300"
                    />
                  </div>
                ))}
                <div className="space-y-1">
                  <label className="text-xs font-mono text-text-muted">Epsilon (\(\varepsilon\))</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={0.99 / calcInputs.length}
                    value={calcEps}
                    onChange={(e) => setCalcEps(parseFloat(e.target.value) || 0.1)}
                    className="w-full px-3 py-1.5 bg-void-200 border border-white/10 rounded-lg text-sm font-mono text-text-primary"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-text-dim text-left">
                      <th className="py-2">Node</th>
                      <th><TeX tex="a_i(t)" /></th>
                      <th><TeX tex="\sum_{j \ne i} a_j" /></th>
                      <th><TeX tex="a_i - \varepsilon \sum" /></th>
                      <th><TeX tex="\max(0, \cdot)" /> [Result]</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {calcOutput.map((row, idx) => (
                      <tr key={idx} className="text-text-secondary">
                        <td className="py-2 text-text-primary font-bold">Node {idx + 1}</td>
                        <td>{row.input}</td>
                        <td>{row.sumOthers}</td>
                        <td className={row.raw < 0 ? 'text-rose-400' : 'text-text-secondary'}>{row.raw}</td>
                        <td className="text-amber-400 font-bold">{row.clamped}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      {/* Chapter 5: Live Algorithm Visualizer */}
      <Section>
        <SectionHeader
          title="Chapter 5 — The Live Algorithm: Interactive Arena"
          subtitle="Watch neural activations battle in real time. Manipulate inputs and parameters, inspect step updates, and witness convergence."
          badge="Interactive Laboratory"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="glass-card p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <PlaybackControls
                isPlaying={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onStep={handleStep}
                onReset={handleReset}
                iteration={simState.iteration}
                disabled={simState.converged}
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSetTieExample}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-300 transition-colors"
                >
                  Load Tied Example
                </button>
                <div className="text-xs font-mono text-text-muted">
                  Status:{' '}
                  {simState.converged ? (
                    <span className="text-emerald-400 font-bold">CONVERGED</span>
                  ) : (
                    <span className="text-amber-400">COMPETING...</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-white/5">
              <div>
                <SliderControl
                  label="Neuron Count (m)"
                  value={numNeurons}
                  min={3}
                  max={8}
                  step={1}
                  onChange={handleNumNeuronsChange}
                  description="Number of competing nodes in the arena"
                  color="amber"
                />
              </div>

              <div>
                <SliderControl
                  label="Inhibition Parameter (ε)"
                  value={epsilon}
                  min={0.01}
                  max={Number((maxAllowedEpsilon * 0.95).toFixed(3))}
                  step={0.01}
                  onChange={handleEpsilonChange}
                  description={`Must satisfy 0 < ε < ${(1 / numNeurons).toFixed(3)}`}
                  color="amber"
                />
              </div>

              <div className="space-y-2">
                <label className="text-text-secondary text-xs font-medium">Initial Activations</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {initialInputs.map((val, idx) => (
                    <input
                      key={idx}
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={val}
                      onChange={(e) => handleInputChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full text-center py-1 bg-void-200 border border-white/10 rounded text-xs font-mono text-amber-400"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visual Presentation Tabs */}
          <div className="flex justify-between items-center">
            <Tabs
              tabs={[
                { id: 'visual', label: 'Arena Visualizer' },
                { id: 'math', label: 'Mathematical Step Trace' },
              ]}
              activeTab={activeTab}
              onTabChange={(id) => setActiveTab(id as any)}
            />
          </div>

          {activeTab === 'visual' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Arena Neurons View */}
              <Card className="flex flex-col items-center justify-center p-6 min-h-[350px]">
                <div className="text-xs font-mono text-text-dim mb-4">
                  COMPETITIVE EQUILIBRIUM AT STEP {simState.iteration}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                  {simState.activations.map((act, idx) => {
                    const isWinner = simState.converged && act > 0;
                    const isEliminated = act === 0;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${
                          isWinner
                            ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                            : isEliminated
                            ? 'bg-void-200/40 border-white/5 opacity-40'
                            : 'bg-void-200 border-white/10'
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center font-mono font-bold text-sm mb-2 shadow-inner"
                          style={{
                            backgroundColor: isEliminated ? '#1e293b' : NEURON_COLORS[idx],
                            color: isEliminated ? '#64748b' : '#0a0b1a',
                          }}
                        >
                          N{idx + 1}
                        </div>
                        <div className="text-xs font-mono text-text-dim">a_{idx + 1}</div>
                        <div className="text-base font-mono font-bold text-text-primary mt-1">
                          {act.toFixed(4)}
                        </div>
                        {isWinner && (
                          <span className="text-[10px] mt-1 px-1.5 py-0.5 rounded bg-amber-400 text-void-500 font-bold uppercase tracking-wider">
                            Winner
                          </span>
                        )}
                        {isEliminated && (
                          <span className="text-[10px] mt-1 text-text-dim uppercase tracking-wider">
                            Eliminated
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="w-full mt-6 p-3 rounded-lg bg-void-200/60 border border-white/5 text-xs text-text-secondary">
                  <strong>Iteration Summary:</strong> Total active sum = {currentTotalSum.toFixed(4)}. Each neuron received
                  inhibition of \(\varepsilon \cdot (S - a_i)\).
                </div>
              </Card>

              {/* Activation Trajectory Line Chart */}
              <Card className="p-4">
                <div className="text-xs font-mono text-text-dim mb-2 uppercase">
                  Activation History Over Iterations
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis dataKey="iteration" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[0, 'auto']} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0d0e24',
                          borderColor: '#334155',
                          borderRadius: '8px',
                          fontSize: '11px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      {initialInputs.map((_, idx) => (
                        <Line
                          key={idx}
                          type="monotone"
                          dataKey={`Node_${idx + 1}`}
                          stroke={NEURON_COLORS[idx]}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          isAnimationActive={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          ) : (
            /* Mathematical Step Trace View */
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-text-dim">
                      <th className="py-2.5 px-3">Step (t)</th>
                      {initialInputs.map((_, idx) => (
                        <th key={idx} className="px-3">a_{idx + 1}(t)</th>
                      ))}
                      <th className="px-3">Total Sum S(t)</th>
                      <th className="px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {simState.history.map((stepVals, iterIdx) => {
                      const sum = stepVals.reduce((a, b) => a + b, 0);
                      const positiveCount = stepVals.filter((v) => v > 0).length;
                      return (
                        <tr key={iterIdx} className={iterIdx === simState.iteration ? 'bg-amber-500/10' : ''}>
                          <td className="py-2 px-3 text-text-muted">{iterIdx}</td>
                          {stepVals.map((v, idx) => (
                            <td
                              key={idx}
                              className={`px-3 ${
                                v > 0 ? 'text-amber-300 font-semibold' : 'text-text-dim'
                              }`}
                            >
                              {v.toFixed(4)}
                            </td>
                          ))}
                          <td className="px-3 text-text-secondary">{sum.toFixed(4)}</td>
                          <td className="px-3">
                            {positiveCount <= 1 ? (
                              <span className="text-emerald-400 font-bold">Solved</span>
                            ) : (
                              <span className="text-text-dim">Competing ({positiveCount})</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </Section>

      {/* Chapter 6: Verifiable Worked Numerical Example */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 6 — Complete Worked Numerical Example"
          subtitle="Verify every intermediate calculation step by step with four neurons."
          badge="Manual Verification"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-6">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Let us trace a 4-neuron network with <TeX tex="\varepsilon = 0.2" />. Note that <TeX tex="0.2 < 0.25" />, satisfying the
            stability bound. We begin with initial activations:
          </p>

          <div className="p-3 bg-void-200 border border-white/5 rounded-xl font-mono text-xs text-amber-300 inline-block">
            a(0) = [0.60, 0.40, 0.30, 0.10]
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-text-primary text-sm">Iteration 0 → 1:</h4>
            <div className="p-4 bg-void-500 rounded-xl font-mono text-xs text-text-secondary space-y-2 border border-white/5">
              <div>Total Sum \(S(0) = 0.60 + 0.40 + 0.30 + 0.10 = 1.40\)</div>
              <div>• \(a_1(1) = \max(0, 0.60 - 0.2 \times (1.40 - 0.60)) = \max(0, 0.60 - 0.16) = \mathbf{0.44}\)</div>
              <div>• \(a_2(1) = \max(0, 0.40 - 0.2 \times (1.40 - 0.40)) = \max(0, 0.40 - 0.20) = \mathbf{0.20}\)</div>
              <div>• \(a_3(1) = \max(0, 0.30 - 0.2 \times (1.40 - 0.30)) = \max(0, 0.30 - 0.22) = \mathbf{0.08}\)</div>
              <div>• \(a_4(1) = \max(0, 0.10 - 0.2 \times (1.40 - 0.10)) = \max(0, 0.10 - 0.26) = \max(0, -0.16) = \mathbf{0.00}\)</div>
            </div>

            <h4 className="font-bold text-text-primary text-sm">Iteration 1 → 2:</h4>
            <div className="p-4 bg-void-500 rounded-xl font-mono text-xs text-text-secondary space-y-2 border border-white/5">
              <div>Total Sum \(S(1) = 0.44 + 0.20 + 0.08 + 0.00 = 0.72\)</div>
              <div>• \(a_1(2) = \max(0, 0.44 - 0.2 \times (0.72 - 0.44)) = \max(0, 0.44 - 0.056) = \mathbf{0.384}\)</div>
              <div>• \(a_2(2) = \max(0, 0.20 - 0.2 \times (0.72 - 0.20)) = \max(0, 0.20 - 0.104) = \mathbf{0.096}\)</div>
              <div>• \(a_3(2) = \max(0, 0.08 - 0.2 \times (0.72 - 0.08)) = \max(0, 0.08 - 0.128) = \max(0, -0.048) = \mathbf{0.000}\)</div>
              <div>• \(a_4(2) = \mathbf{0.000}\)</div>
            </div>

            <h4 className="font-bold text-text-primary text-sm">Iteration 2 → 3:</h4>
            <div className="p-4 bg-void-500 rounded-xl font-mono text-xs text-text-secondary space-y-2 border border-white/5">
              <div>Total Sum \(S(2) = 0.384 + 0.096 + 0.000 + 0.000 = 0.480\)</div>
              <div>• \(a_1(3) = \max(0, 0.384 - 0.2 \times (0.480 - 0.384)) = \max(0, 0.384 - 0.0192) = \mathbf{0.3648}\)</div>
              <div>• \(a_2(3) = \max(0, 0.096 - 0.2 \times (0.480 - 0.096)) = \max(0, 0.096 - 0.0768) = \mathbf{0.0192}\)</div>
            </div>

            <h4 className="font-bold text-text-primary text-sm">Iteration 3 → 4:</h4>
            <div className="p-4 bg-void-500 rounded-xl font-mono text-xs text-text-secondary space-y-2 border border-white/5">
              <div>Total Sum \(S(3) = 0.3648 + 0.0192 = 0.384\)</div>
              <div>• \(a_1(4) = \max(0, 0.3648 - 0.2 \times 0.0192) = \mathbf{0.3610}\)</div>
              <div>• \(a_2(4) = \max(0, 0.0192 - 0.2 \times 0.3648) = \max(0, -0.0538) = \mathbf{0.0000}\)</div>
              <div className="text-emerald-400 font-bold pt-2">
                HALT: Exactly one positive activation remains (\(a_1 = 0.3610\)). Node 1 is declared the unique winner!
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Chapter 7: From Theory to Real Systems */}
      <Section>
        <SectionHeader
          title="Chapter 7 — From Theory to Real-World Systems"
          subtitle="Where competitive subnets operate in signal processing and optical neuromorphics."
          badge="Applied Engineering"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">
              Hardware Implementation
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              Optical & Analog Winner-Takes-All
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              MAXNET shines brightly in analog VLSI circuits and optical computing (such as spatial light modulators
              and photorefractive crystals). In optics, matrix multiplication and mutual cross-talk occur at the speed of
              light, making iterative feedback convergence happen in sub-nanosecond time frames without digital ALU bottlenecks.
            </p>
            <div className="text-[11px] font-mono text-text-muted">
              Evidence Level: <strong>Peer-reviewed research demonstrations</strong> (e.g. Applied Optics, 1992).
            </div>
          </Card>

          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2">
              Pipeline Subcircuit
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              Hamming Network Competitive Stage
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              In classical pattern-recognition systems, MAXNET functions as the second tier of a two-stage Hamming network.
              The front-end computes inner products to calculate matching scores; the back-end (MAXNET) filters out all sub-optimal
              matches to yield a single discrete categorical classification.
            </p>
            <div className="text-[11px] font-mono text-text-muted">
              Evidence Level: <strong>Documented classical architecture</strong> (Lippmann, IEEE ASSP 1987).
            </div>
          </Card>
        </div>

        <InfoBox type="warning" title="Academic Qualification: Production Recommender Systems">
          Modern commercial recommendation engines (such as those at YouTube, Netflix, or Meta) do <strong>NOT</strong> use
          classical MAXNET to pick recommendations. Modern systems use multi-stage deep candidate retrieval (two-tower DNNs,
          approximate nearest neighbor vector indexes like HNSW, and deep ranking models). MAXNET is an educational and
          hardware model of pure lateral inhibition.
        </InfoBox>
      </Section>

      {/* Chapter 8: Implementation From Scratch */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 8 — Implementation From Scratch"
          subtitle="Clean, idiomatic Python with NumPy using the O(m) sum optimization."
          badge="Code Laboratory"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-4">
          <div className="code-block">
            <pre className="text-xs text-text-secondary font-mono leading-relaxed">
{`import numpy as np

def maxnet(activations: np.ndarray, epsilon: float = None, max_iter: int = 100) -> tuple[int, np.ndarray, list]:
    """
    Simulate a MAXNET winner-takes-all competitive neural network.
    
    Parameters:
        activations: 1D array of non-negative initial activations.
        epsilon: Inhibition constant. Must satisfy 0 < epsilon < 1/m.
        max_iter: Guard limit against infinite loops.
        
    Returns:
        winner_idx: Index of winning neuron (or -1 if tied/extinguished).
        final_activations: State at convergence.
        history: Sequence of activation arrays at each step.
    """
    a = np.array(activations, dtype=np.float64)
    m = len(a)
    
    if m == 0:
        raise ValueError("Activation array cannot be empty.")
    if np.any(a < 0):
        raise ValueError("Initial activations must be non-negative.")
        
    if epsilon is None:
        epsilon = 0.8 / m  # Safe default within (0, 1/m)
    elif not (0 < epsilon < 1.0 / m):
        raise ValueError(f"Epsilon {epsilon} violates 0 < epsilon < 1/{m} ({1.0/m:.4f})")
        
    history = [a.copy()]
    
    for iteration in range(max_iter):
        # Stop condition: at most one positive activation remains
        positive_mask = a > 1e-7
        if np.sum(positive_mask) <= 1:
            break
            
        # O(m) optimized update: sum(all) - self
        total_sum = np.sum(a)
        sum_others = total_sum - a
        a = np.maximum(0.0, a - epsilon * sum_others)
        history.append(a.copy())
        
    survivors = np.where(a > 1e-7)[0]
    winner_idx = int(survivors[0]) if len(survivors) == 1 else -1
    return winner_idx, a, history`}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Collapsible title="Computational Complexity Analysis">
              <div className="text-xs text-text-secondary space-y-2">
                <p><strong>Time Complexity per Step:</strong> <TeX tex="O(m)" />. By computing the total sum in a single vectorized pass, each node requires only <TeX tex="O(1)" /> arithmetic.</p>
                <p><strong>Convergence Iterations:</strong> Typically \(O(\log m / \log(1/\rho))\), where \(\rho\) represents the relative gap between the largest and second-largest activations.</p>
                <p><strong>Space Complexity:</strong> \(O(m)\) state memory, or \(O(m \cdot T)\) if recording trajectory history.</p>
              </div>
            </Collapsible>

            <Collapsible title="Edge Case: Exact Maxima Ties">
              <div className="text-xs text-text-secondary space-y-2">
                <p>If two nodes start with identical top values (e.g. \([0.5, 0.5, 0.2]\)), lateral inhibition operates with perfect symmetry on both.</p>
                <p>Neither can gain advantage over the other. Both will decay at the exact same rate until both reach zero simultaneously, resulting in a tie with zero survivors.</p>
              </div>
            </Collapsible>
          </div>
        </div>
      </Section>

      {/* Chapter 9: Real Function Behind the Model */}
      <Section>
        <SectionHeader
          title="Chapter 9 — The Real Function Behind the Model"
          subtitle="How modern software frameworks replace iterative WTA selection."
          badge="Software APIs"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-bold text-text-primary text-sm mb-2">Digital Systems: Exact Comparator</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              In standard digital software (NumPy, PyTorch, TensorFlow), iterative lateral inhibition is replaced by
              direct single-pass functions:
            </p>
            <div className="code-block text-xs font-mono text-amber-300">
              np.argmax(activations, axis=-1)
            </div>
            <p className="text-xs text-text-muted mt-2">
              Runs in \(O(m)\) with tiny CPU cache footprints without requiring convergence iterations.
            </p>
          </Card>

          <Card>
            <h3 className="font-bold text-text-primary text-sm mb-2">Differentiable Winner Selection: Softmax</h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Because pure \(\arg\max\) and MAXNET have zero gradients almost everywhere, neural networks trained with
              backpropagation approximate competitive selection using the continuous Softmax function:
            </p>
            <TeX tex="\sigma(z)_i = \frac{e^{z_i / T}}{\sum_{j=1}^m e^{z_j / T}}" display />
            <p className="text-xs text-text-muted mt-2">
              As temperature \(T \to 0\), Softmax smoothly approaches the exact winner-takes-all distribution.
            </p>
          </Card>
        </div>
      </Section>

      {/* Chapter 10: Strengths, Weaknesses, Alternatives */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 10 — Strengths, Weaknesses, and Alternatives"
          subtitle="Honest technical evaluation of MAXNET in computation."
          badge="Critique & Comparison"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <h3 className="font-bold text-emerald-400 text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Architectural Strengths
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>• Completely decentralized: no central sorting register required.</li>
              <li>• Zero training phase: connection weights are fixed by closed-form rules.</li>
              <li>• Analog-friendly: easily fabricated via crossbar arrays or differential transistor pairs.</li>
              <li>• Biologically plausible mechanism for lateral reciprocal inhibition.</li>
            </ul>
          </Card>

          <Card className="border-rose-500/20 bg-rose-500/5">
            <h3 className="font-bold text-rose-400 text-sm mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Computational Limitations
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>• Cannot resolve perfect ties without stochastic noise injection.</li>
              <li>• All-to-all connectivity \(O(m^2)\) becomes wiring-prohibitive for large \(m\).</li>
              <li>• Iterative convergence latency is slower on digital hardware than a simple heap or max loop.</li>
              <li>• Non-differentiable at boundary states, preventing backpropagation training.</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Chapter 11: Knowledge Check */}
      <Section>
        <SectionHeader
          title="Chapter 11 — Knowledge Check"
          subtitle="Test your comprehension of MAXNET dynamics, parameter constraints, and edge cases."
          badge="Assessment"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-6 max-w-3xl">
          {[
            {
              id: 1,
              q: 'For a network with m = 5 competing neurons, what is the theoretical upper bound on epsilon (ε) to avoid over-inhibition instability?',
              options: ['ε < 1.0', 'ε < 0.20 (since 1/5 = 0.20)', 'ε < 0.50', 'ε = 0'],
              correct: 1,
              explanation:
                'The standard stability condition is 0 < ε < 1/m. For m = 5, this requires ε < 1/5 = 0.20. Setting ε ≥ 0.20 risks driving all neurons to zero simultaneously on step 1.',
            },
            {
              id: 2,
              q: 'What occurs inside MAXNET if the two largest initial activations are perfectly equal (e.g. a_1(0) = 0.8, a_2(0) = 0.8, all others 0.1)?',
              options: [
                'The network randomly selects node 1 after 1 step.',
                'The network oscillates indefinitely without halting.',
                'Both tied nodes are suppressed symmetrically and eventually decay to zero together.',
                'The weights automatically adjust to break the symmetry.',
              ],
              correct: 2,
              explanation:
                'Because the network is deterministic and symmetric, both nodes receive identical mutual inhibition. Neither can gain an advantage, causing both to decay symmetrically to zero.',
            },
            {
              id: 3,
              q: 'Why can the update rule be computed in O(m) operations rather than O(m²) operations per iteration?',
              options: [
                'Because neurons only talk to their nearest spatial neighbor.',
                'By computing the total sum S(t) once, the sum of rivals is simply S(t) - a_i(t).',
                'By using fast Fourier transforms on the weight matrix.',
                'Because the activation function is non-linear.',
              ],
              correct: 1,
              explanation:
                'The sum over j ≠ i can be decomposed into S(t) - a_i(t). Computing S(t) requires m additions, after which each node is updated in O(1) time.',
            },
          ].map((item) => {
            const selected = quizAnswers[item.id];
            const isSub = quizSubmitted[item.id];
            const isCorrect = selected === item.correct;

            return (
              <Card key={item.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 font-mono text-xs font-bold">
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
                          ? 'border border-amber-400 bg-amber-400/10 text-amber-200'
                          : 'border border-white/5 bg-void-200 hover:bg-white/5 text-text-secondary'
                      }`}
                    >
                      <span>{opt}</span>
                      {selected === optIdx && <span className="w-2 h-2 rounded-full bg-amber-400" />}
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

      {/* References Section */}
      <Section className="bg-void-300 border-t border-white/5">
        <SectionHeader
          title="Authoritative References & Literature"
          subtitle="Primary publications and foundational textbooks documenting MAXNET."
          badge="Bibliography"
          badgeColor="from-amber-500 to-yellow-500"
        />

        <div className="space-y-3 max-w-3xl text-xs text-text-secondary">
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>1. Lippmann, R. P. (1987).</strong> An Introduction to Computing with Neural Nets. <em>IEEE ASSP Magazine</em>, 4(4), 4–22. DOI: 10.1109/MASSP.1987.1165576
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>2. Fausett, L. V. (1994).</strong> <em>Fundamentals of Neural Networks: Architectures, Algorithms, and Applications</em>. Prentice-Hall. Chapter 4: Competitive Networks.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>3. Grossberg, S. (1973).</strong> Contour enhancement, short term memory, and constancies in reverberating neural networks. <em>Studies in Applied Mathematics</em>, 52(3), 213–257.
          </div>
        </div>
      </Section>
    </div>
  );
}
