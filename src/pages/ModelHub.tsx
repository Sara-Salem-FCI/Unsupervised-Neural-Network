import { Link } from 'react-router-dom';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { Zap, Layers, Map, Shield, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface ModelInfo {
  id: string;
  name: string;
  subtitle: string;
  path: string;
  icon: any;
  colorClass: string;
  accentBg: string;
  accentBorder: string;
  primaryPurpose: string;
  weightType: 'Fixed by design' | 'Learned from data' | 'Fixed prototype storage' | 'Prescribed spatial kernel';
  learningType: 'Competitive selection (No learning)' | 'Continuous / Discrete kernel' | 'Unsupervised competitive learning' | 'Similarity-based prototype classifier';
  inputSpace: string;
  outputSpace: string;
  keySteps: string[];
  limitations: string[];
  relationship: string;
}

const models: ModelInfo[] = [
  {
    id: 'maxnet',
    name: 'MAXNET',
    subtitle: 'The Competition Arena',
    path: '/models/maxnet',
    icon: Zap,
    colorClass: 'text-maxnet',
    accentBg: 'bg-maxnet/10',
    accentBorder: 'border-maxnet/30',
    primaryPurpose: 'Select the single largest initial activation (winner-takes-all) through symmetric lateral inhibition.',
    weightType: 'Fixed by design',
    learningType: 'Competitive selection (No learning)',
    inputSpace: 'Vector of m non-negative initial activations [a_1(0), ..., a_m(0)]',
    outputSpace: 'Vector with only one positive activation (the winner), or all zero / tied values',
    keySteps: [
      'Initialize activations from input detector scores',
      'Compute aggregate inhibitory sum across all competing nodes',
      'Update each node: a_i(t+1) = max(0, a_i(t) - ε·Σ_{j≠i} a_j(t))',
      'Halt when at most one node remains strictly positive'
    ],
    limitations: [
      'Cannot break exact numerical ties without random perturbation',
      'Sensitive to epsilon choice (requires 0 < ε < 1/m for stability)',
      'High communication overhead (all-to-all connectivity O(m²))'
    ],
    relationship: 'Serves as the second-stage selection mechanism in classical Hamming networks and winner-takes-all subcircuits.'
  },
  {
    id: 'mexican-hat',
    name: 'Mexican Hat',
    subtitle: 'The Field of Influence',
    path: '/models/mexican-hat',
    icon: Layers,
    colorClass: 'text-mexhat',
    accentBg: 'bg-mexhat/10',
    accentBorder: 'border-mexhat/30',
    primaryPurpose: 'Generate spatial pattern formation with local cooperation (excitation) and surrounding competition (inhibition).',
    weightType: 'Prescribed spatial kernel',
    learningType: 'Continuous / Discrete kernel',
    inputSpace: 'Spatial coordinates or discrete neural lattice distances r = ||r_i - r_j||',
    outputSpace: 'Coupling weights or continuous interaction field h(r)',
    keySteps: [
      'Measure Euclidean distance between nodes on the physical/topological grid',
      'Evaluate Difference of Gaussians (DoG) or Ricker wavelet: h(r) = A_e·e^(-r²/2σ_e²) - A_i·e^(-r²/2σ_i²)',
      'Apply positive influence to immediate spatial neighbors (excitation)',
      'Apply negative influence to intermediate ring of neurons (inhibition)'
    ],
    limitations: [
      'Kernel parameters require careful tuning (σ_i > σ_e) to form stable localized bubbles',
      'Boundary conditions can distort pattern symmetry near map edges',
      'A static kernel is not itself a complete network without dynamic activation laws'
    ],
    relationship: 'Provides biological inspiration for local feature sharpening, edge detection (LoG), and SOM neighborhood kernels.'
  },
  {
    id: 'som',
    name: 'Self-Organizing Map (SOM)',
    subtitle: "The Cartographer's Universe",
    path: '/models/som',
    icon: Map,
    colorClass: 'text-som',
    accentBg: 'bg-som/10',
    accentBorder: 'border-som/30',
    primaryPurpose: 'Project high-dimensional continuous data onto a low-dimensional topological grid while preserving neighborhood relations.',
    weightType: 'Learned from data',
    learningType: 'Unsupervised competitive learning',
    inputSpace: 'Continuous multi-dimensional vectors x ∈ ℝ^d',
    outputSpace: 'Low-dimensional discrete coordinate grid (usually 2D) of prototype vectors',
    keySteps: [
      'Present an input vector x to the lattice of prototype neurons',
      'Locate Best Matching Unit (BMU): c = argmin_i ||x - w_i||_2',
      'Compute spatial neighborhood influence h_{ci}(t) around BMU on the grid',
      'Adapt prototype weights: w_i(t+1) = w_i(t) + η(t)·h_{ci}(t)·[x - w_i(t)]',
      'Decay learning rate η(t) and neighborhood radius σ(t) over training epochs'
    ],
    limitations: [
      'Computational complexity scales with grid size × dataset size × iterations',
      'Topological defects (twists, folds) can occur if initial radius is too small',
      'Fixed grid topology cannot adapt to data with disconnected manifolds'
    ],
    relationship: 'The premier unsupervised topology-preserving model; utilizes competitive selection and spatial neighborhood cooperation.'
  },
  {
    id: 'hamming',
    name: 'Hamming Network',
    subtitle: 'The Hall of Memories',
    path: '/models/hamming',
    icon: Shield,
    colorClass: 'text-hamming',
    accentBg: 'bg-hamming/10',
    accentBorder: 'border-hamming/30',
    primaryPurpose: 'Classify binary/bipolar patterns by matching inputs against stored exemplars using minimum Hamming distance.',
    weightType: 'Fixed prototype storage',
    learningType: 'Similarity-based prototype classifier',
    inputSpace: 'Binary vector x ∈ {0, 1}^n or bipolar x ∈ {-1, +1}^n',
    outputSpace: 'Identification of the closest stored prototype or its index',
    keySteps: [
      'Feed-forward layer computes Hamming similarity: s_j = n - d_H(x, p_j)',
      'In bipolar formulation: net_j = (1/2)·p_j·x + n/2',
      'Feed similarity scores into a recurrent MAXNET competitive layer',
      'MAXNET converges to the stored pattern with minimum bit mismatches'
    ],
    limitations: [
      'Storage capacity is bounded; does not discover new classes autonomously',
      'Designed exclusively for binary/bipolar features, not continuous vectors',
      'Degrades when prototypes share identical Hamming distances to corrupted inputs'
    ],
    relationship: 'Directly combines a linear prototype correlation layer with a MAXNET winner-takes-all subnet.'
  }
];

export function ModelHub() {
  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-4">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Comparative Taxonomy</span>
          </div>
          <h1 className="text-title font-bold text-text-primary mb-4">Model Exploration Hub</h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Neural networks encompass fundamentally distinct computational paradigms. 
            Before diving into each specific journey, examine their architectures, operational principles, 
            and how their mechanisms contrast and interconnect.
          </p>
        </div>
      </Section>

      {/* Model Cards Grid */}
      <Section>
        <SectionHeader
          title="The Four Architectures"
          subtitle="Explore their mathematical identities, operational requirements, and key mechanics."
          badge="Detailed Overview"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {models.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${m.accentBg} ${m.accentBorder} border`}>
                        <Icon className={`w-6 h-6 ${m.colorClass}`} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-text-primary">{m.name}</h2>
                        <p className={`text-xs font-mono uppercase tracking-wider ${m.colorClass}`}>{m.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-text-muted">
                      {m.weightType}
                    </span>
                  </div>

                  <p className="text-text-secondary text-sm leading-relaxed mb-6">
                    {m.primaryPurpose}
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="p-3 rounded-xl bg-void-200 border border-white/5 text-xs">
                      <div className="text-text-dim uppercase tracking-wider mb-1 font-mono">Learning Paradigm</div>
                      <div className="text-text-primary font-medium">{m.learningType}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-void-200 border border-white/5">
                        <div className="text-text-dim uppercase tracking-wider mb-1 font-mono">Input Representation</div>
                        <div className="text-text-secondary">{m.inputSpace}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-void-200 border border-white/5">
                        <div className="text-text-dim uppercase tracking-wider mb-1 font-mono">Output Representation</div>
                        <div className="text-text-secondary">{m.outputSpace}</div>
                      </div>
                    </div>

                    <div className="text-xs">
                      <div className="text-text-dim uppercase tracking-wider mb-2 font-mono">Algorithm Execution Steps</div>
                      <ul className="space-y-1.5 text-text-secondary">
                        {m.keySteps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-mono font-bold">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="text-xs">
                      <div className="text-text-dim uppercase tracking-wider mb-2 font-mono">Known Limitations</div>
                      <ul className="space-y-1 text-text-muted">
                        {m.limitations.map((lim, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400/80">•</span>
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                      <span className="text-text-dim font-mono uppercase tracking-wider block mb-1">Architectural Role:</span>
                      <span className="text-text-secondary italic">{m.relationship}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={m.path}
                  className={`mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all text-sm font-semibold text-text-primary group`}
                >
                  Enter {m.name} Journey
                  <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-white group-hover:translate-x-1 transition-transform" />
                </Link>
              </Card>
            );
          })}
        </div>
      </Section>

      {/* Rigorous Comparison Matrix Table */}
      <Section className="bg-void-300 border-t border-white/5">
        <SectionHeader
          title="Scientific Comparison Matrix"
          subtitle="Side-by-side analysis of mathematical properties, computational complexity, and biological parallels."
          badge="Comparative Analysis"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-void-200/50">
                <th className="p-4 text-text-primary font-bold">Property</th>
                <th className="p-4 text-maxnet font-bold">MAXNET</th>
                <th className="p-4 text-mexhat font-bold">Mexican Hat</th>
                <th className="p-4 text-som font-bold">Self-Organizing Map</th>
                <th className="p-4 text-hamming font-bold">Hamming Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="p-4 font-semibold text-text-primary bg-white/[0.01]">Weights Adaptive?</td>
                <td className="p-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> No (Fixed -ε)</td>
                <td className="p-4 text-amber-400">Prescribed Spatial Kernel</td>
                <td className="p-4 text-emerald-400 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Yes (Online / Batch)</td>
                <td className="p-4 text-rose-400 flex items-center gap-1.5"><XCircle className="w-3.5 h-3.5" /> No (Fixed Prototypes)</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-text-primary bg-white/[0.01]">Supervision Required</td>
                <td className="p-4 text-text-secondary">None (Fixed Selection)</td>
                <td className="p-4 text-text-secondary">None (Field Dynamic)</td>
                <td className="p-4 text-emerald-400 font-semibold">Strictly Unsupervised</td>
                <td className="p-4 text-text-secondary">Exemplars Provided</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-text-primary bg-white/[0.01]">Metric / Function</td>
                <td className="p-4 font-mono text-text-secondary">Mutual Inhibition</td>
                <td className="p-4 font-mono text-text-secondary">Difference of Gaussians</td>
                <td className="p-4 font-mono text-text-secondary">Euclidean Distance ||x-w||</td>
                <td className="p-4 font-mono text-text-secondary">Hamming Distance d_H</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-text-primary bg-white/[0.01]">Time Complexity / Step</td>
                <td className="p-4 font-mono text-text-secondary">O(m) with sum trick</td>
                <td className="p-4 font-mono text-text-secondary">O(N·K) or O(N log N) FFT</td>
                <td className="p-4 font-mono text-text-secondary">O(N_neurons · D_features)</td>
                <td className="p-4 font-mono text-text-secondary">O(m·n) + MAXNET time</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-text-primary bg-white/[0.01]">Topology Preservation</td>
                <td className="p-4 text-text-muted">Not applicable</td>
                <td className="p-4 text-text-secondary">Preserves spatial proximity</td>
                <td className="p-4 text-emerald-400 font-semibold">Core Architectural Goal</td>
                <td className="p-4 text-text-muted">Discrete prototype matching</td>
              </tr>
              <tr>
                <td className="p-4 font-semibold text-text-primary bg-white/[0.01]">Biological Analogy</td>
                <td className="p-4 text-text-secondary">Renshaw cells in spinal cord</td>
                <td className="p-4 text-text-secondary">Retinal ganglion receptive fields</td>
                <td className="p-4 text-text-secondary">Somatosensory / retinotopic maps</td>
                <td className="p-4 text-text-secondary">Associative memory retrieval</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
