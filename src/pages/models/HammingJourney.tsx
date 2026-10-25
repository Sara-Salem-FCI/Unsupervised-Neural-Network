import { useState, useMemo, useCallback } from 'react';
import { Section, SectionHeader, Card } from '../../components/ui/Section';
import { EquationBlock, TeX } from '../../components/ui/Math';
import { SliderControl, PlaybackControls, Collapsible, InfoBox, Tabs } from '../../components/ui/Controls';
import {
  hammingDistance,
  hammingSimilarity,
  computeAllDistances,
  computeAllSimilarities,
  runHammingNet,
  addNoise,
  HammingNetState,
} from '../../lib/math/hamming';
import { createMaxnetState, maxnetStep } from '../../lib/math/maxnet';
import { Shield, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

// Preset 8-bit prototypes
const PRESET_PATTERNS = [
  { name: 'Pattern A', bits: [1, 1, 1, 0, 0, 0, 1, 1] },
  { name: 'Pattern B', bits: [0, 0, 1, 1, 1, 1, 0, 0] },
  { name: 'Pattern C', bits: [1, 0, 1, 0, 1, 0, 1, 0] },
  { name: 'Pattern D', bits: [0, 1, 0, 1, 0, 1, 0, 1] },
];

export function HammingJourney() {
  // Pattern Lab State
  const [prototypes, setPrototypes] = useState<number[][]>(() =>
    PRESET_PATTERNS.map((p) => [...p.bits])
  );
  const [inputBits, setInputBits] = useState<number[]>([1, 1, 1, 0, 0, 0, 1, 0]); // Pattern A with 1 bit corrupted
  const [noiseRate, setNoiseRate] = useState<number>(0.25);

  // MAXNET Competition State inside Hamming
  const [competitionState, setCompetitionState] = useState(() => {
    const sims = computeAllSimilarities(inputBits, prototypes, inputBits.length);
    return createMaxnetState(sims, { epsilon: 0.15, maxIterations: 50 });
  });

  // Quiz State
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});

  // Real-time distances and similarities
  const distances = useMemo(
    () => computeAllDistances(inputBits, prototypes),
    [inputBits, prototypes]
  );
  const similarities = useMemo(
    () => computeAllSimilarities(inputBits, prototypes, inputBits.length),
    [inputBits, prototypes]
  );

  // Toggle an input bit
  const handleToggleInputBit = (idx: number) => {
    const next = [...inputBits];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setInputBits(next);
    const newSims = computeAllSimilarities(next, prototypes, next.length);
    setCompetitionState(createMaxnetState(newSims, { epsilon: 0.15, maxIterations: 50 }));
  };

  // Add random noise
  const handleAddNoise = () => {
    const noisy = addNoise(inputBits, noiseRate);
    setInputBits(noisy);
    const newSims = computeAllSimilarities(noisy, prototypes, noisy.length);
    setCompetitionState(createMaxnetState(newSims, { epsilon: 0.15, maxIterations: 50 }));
  };

  // Step the MAXNET competitive layer
  const handleStepCompetition = () => {
    if (!competitionState.converged) {
      setCompetitionState((prev) => maxnetStep(prev));
    }
  };

  const handleResetCompetition = () => {
    const sims = computeAllSimilarities(inputBits, prototypes, inputBits.length);
    setCompetitionState(createMaxnetState(sims, { epsilon: 0.15, maxIterations: 50 }));
  };

  // Check if there is an exact tie in maximum similarities
  const maxSim = useMemo(() => Math.max(...similarities), [similarities]);
  const isTied = useMemo(
    () => similarities.filter((s) => s === maxSim).length > 1,
    [similarities, maxSim]
  );

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/20 bg-rose-500/10 mb-4">
            <Shield className="w-4 h-4 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Model Journey 04
            </span>
          </div>
          <h1 className="text-hero font-black text-text-primary tracking-tight mb-4">
            Hamming Networks <span className="text-gradient-rose">— The Hall of Memories</span>
          </h1>
          <p className="text-subtitle text-text-secondary leading-relaxed">
            A two-layer associative pattern-matching network that pairs linear inner-product exemplar
            correlations with a recurrent MAXNET competitive layer to classify corrupted binary inputs.
          </p>
        </div>
      </Section>

      {/* Chapter 1: The Problem */}
      <Section>
        <SectionHeader
          title="Chapter 1 — The Problem That Needed Solving"
          subtitle="Matching noisy, partially corrupted binary signatures against a permanent repository of memories."
          badge="Context & Motivation"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4 text-text-secondary leading-relaxed text-sm">
            <p>
              In digital communications, optical character recognition (OCR), and telecommunications, information
              frequently arrives damaged by noisy channels, transmission bit-flips, or physical occlusions.
              A scanner reading a printed document might misread black pixels as white due to smudged ink.
            </p>
            <p>
              Exact string lookup fails completely when even a single bit is flipped. What is needed is an
              <strong>associative memory</strong>: a system that accepts an imperfect, noisy cue and swiftly retrieves
              the closest stored reference archetype from its library.
            </p>
            <p>
              In 1987, Richard P. Lippmann synthesized this problem by demonstrating how a feedforward similarity
              subnet combined with a MAXNET competitive subnet creates an optimal minimum-error classifier
              for binary patterns under independent bit-flip noise.
            </p>
          </div>

          <Card className="border-rose-500/20">
            <h3 className="text-base font-bold text-text-primary mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              The Two-Stage Architecture
            </h3>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li className="flex gap-2">
                <span className="text-rose-400 font-bold">Stage 1: Lower Matching Subnet:</span> Computes similarity scores between the input and all stored prototypes in a single feedforward matrix multiplication.
              </li>
              <li className="flex gap-2">
                <span className="text-rose-400 font-bold">Stage 2: Upper MAXNET Subnet:</span> Uses mutual lateral inhibition to suppress all sub-optimal matches, locking onto the single closest prototype.
              </li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* Chapter 2: Intuition */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 2 — Intuition: The Hall of Memories"
          subtitle="Walking down a corridor of pristine museum exhibits holding a torn, degraded photograph."
          badge="Mental Model"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-6">
          <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
            Picture entering a grand hall where \(m\) pristine reference statues stand in alcoves. You hold a partially
            broken, dusty artifact:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-rose-400 font-bold text-lg mb-1">1. Parallel Comparison</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                You hold up your artifact against every statue simultaneously, counting how many features match and how many conflict (Hamming distance).
              </p>
            </Card>

            <Card>
              <div className="text-rose-400 font-bold text-lg mb-1">2. Similarity Spotlight</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Each statue turns on an overhead spotlight whose brightness equals its similarity score: <TeX tex="\text{Score} = n - \text{mismatches}" />.
              </p>
            </Card>

            <Card>
              <div className="text-rose-400 font-bold text-lg mb-1">3. The MAXNET Contest</div>
              <p className="text-xs text-text-secondary leading-relaxed">
                The spotlights engage in reciprocal crossfire. Dimmer lights are extinguished first until only the single best-matching statue remains brilliantly illuminated!
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Chapter 3 & 4: Mathematics */}
      <Section>
        <SectionHeader
          title="Chapter 4 — Mathematical Foundations"
          subtitle="Binary vs bipolar representations, connection weights, and feedforward correlation."
          badge="Mathematical Foundations"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-8">
          <div>
            <h3 className="text-base font-bold text-text-primary mb-2">1. Hamming Distance and Similarity</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">
              For two binary vectors <TeX tex="x, p \in \{0, 1\}^n" />, the Hamming distance counts the exact number of mismatched bit coordinates:
            </p>

            <EquationBlock
              tex="d_H(x, p) = \sum_{k=1}^n \mathbf{1}[x_k \ne p_k], \qquad s(x, p) = n - d_H(x, p)"
              description="Where s(x, p) represents the count of identical matching bit positions."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-rose-400">
                Bipolar Formulation <TeX tex="\{-1, +1\}" />
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                In neural network literature, binary bits <TeX tex="\{0, 1\}" /> are frequently transformed to bipolar values <TeX tex="\{-1, +1\}" />.
                Under this mapping, the inner product <TeX tex="x \cdot p = \sum x_k p_k" /> counts matches (+1) minus mismatches (-1):
              </p>
              <TeX tex="x \cdot p = (n - d_H) - d_H = n - 2 d_H" display />
              <p className="text-xs text-text-muted mt-2">
                Rearranging gives the exact similarity score: <TeX tex="s(x, p) = \frac{1}{2}(x \cdot p) + \frac{n}{2}" />.
              </p>
            </Card>

            <Card>
              <h4 className="font-semibold text-text-primary text-sm mb-2 text-rose-400">
                Synaptic Weight Assignment for Stage 1
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed mb-3">
                Because Stage 1 is linear, we set feedforward weights from input bit <TeX tex="k" /> to prototype node <TeX tex="j" /> directly as:
              </p>
              <TeX tex="w_{kj} = \frac{p_{j, k}}{2}, \quad \text{with constant bias } \theta_j = \frac{n}{2}" display />
              <p className="text-xs text-text-muted mt-2">
                This guarantees that neuron <TeX tex="j" /> produces activation exactly equal to <TeX tex="n - d_H(x, p_j)" /> in a single feedforward pass!
              </p>
            </Card>
          </div>
        </div>
      </Section>

      {/* Chapter 5: Pattern Matching Laboratory */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 5 — The Live Algorithm: Pattern Matching Lab"
          subtitle="Click to flip bits on the input. Inject random noise, inspect real-time Hamming distances, and step through MAXNET competition."
          badge="Interactive Laboratory"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-6">
          {/* Input Bitstrip Editor */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-text-primary text-sm">Interactive Input Vector (8-bit)</h3>
                <p className="text-xs text-text-muted">Click any bit below to toggle between 0 and 1</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddNoise}
                  className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-300 transition-colors"
                >
                  Inject {(noiseRate * 100).toFixed(0)}% Noise
                </button>
                <div className="w-28">
                  <input
                    type="range"
                    min={0.1}
                    max={0.5}
                    step={0.05}
                    value={noiseRate}
                    onChange={(e) => setNoiseRate(parseFloat(e.target.value))}
                    className="w-full h-1 bg-void-200 rounded appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Clickable 8-bit Strip */}
            <div className="flex justify-center gap-2 py-3">
              {inputBits.map((bit, idx) => (
                <button
                  key={idx}
                  onClick={() => handleToggleInputBit(idx)}
                  className={`w-11 h-14 rounded-xl border flex flex-col items-center justify-center font-mono font-bold transition-all transform hover:scale-105 ${
                    bit === 1
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/20'
                      : 'bg-void-200 border-white/10 text-text-dim'
                  }`}
                >
                  <span className="text-[10px] text-text-dim">b{idx}</span>
                  <span className="text-lg">{bit}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Prototype Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {prototypes.map((proto, pIdx) => {
              const dist = distances[pIdx];
              const sim = similarities[pIdx];
              const isBest = sim === maxSim;

              return (
                <Card
                  key={pIdx}
                  className={`border transition-all ${
                    isBest
                      ? 'border-rose-500/40 bg-rose-500/10 shadow-lg shadow-rose-500/10'
                      : 'border-white/5 bg-void-200/50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-mono font-bold text-text-primary">
                      {PRESET_PATTERNS[pIdx].name}
                    </span>
                    {isBest && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500 text-void-500 font-bold uppercase">
                        {isTied ? 'Tied Match' : 'Closest Match'}
                      </span>
                    )}
                  </div>

                  {/* Bit Grid Showing Matches / Mismatches */}
                  <div className="grid grid-cols-8 gap-1 mb-4">
                    {proto.map((bit, bIdx) => {
                      const match = bit === inputBits[bIdx];
                      return (
                        <div
                          key={bIdx}
                          className={`h-7 rounded flex items-center justify-center font-mono text-xs font-bold ${
                            match
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                          }`}
                          title={`Input: ${inputBits[bIdx]} | Proto: ${bit}`}
                        >
                          {bit}
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-1.5 text-xs font-mono pt-2 border-t border-white/5">
                    <div className="flex justify-between">
                      <span className="text-text-dim">Mismatches (d_H):</span>
                      <strong className={dist > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                        {dist}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-dim">Similarity (8 - d_H):</span>
                      <strong className="text-text-primary">{sim} / 8</strong>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Stage 2: MAXNET Convergence Simulator */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-400" />
                  Stage 2: Recurrent MAXNET Layer
                </h3>
                <p className="text-xs text-text-muted">
                  Feed similarity scores into competitive cross-inhibition to isolate the single surviving candidate.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleStepCompetition}
                  disabled={competitionState.converged}
                  className="px-3 py-1.5 bg-indigo-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:bg-indigo-500 transition-colors"
                >
                  Step Competition
                </button>
                <button
                  onClick={handleResetCompetition}
                  className="px-3 py-1.5 bg-void-200 text-text-secondary rounded-lg text-xs font-semibold hover:bg-white/5 transition-colors"
                >
                  Reset
                </button>
                <span className="text-xs font-mono text-text-dim ml-2">
                  Step: {competitionState.iteration} |{' '}
                  {competitionState.converged ? (
                    <strong className="text-emerald-400">CONVERGED</strong>
                  ) : (
                    <strong className="text-rose-400">COMPETING...</strong>
                  )}
                </span>
              </div>
            </div>

            {/* Candidate Activation Bars */}
            <div className="space-y-3">
              {competitionState.activations.map((act, idx) => {
                const isWinner = competitionState.converged && act > 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-text-secondary">{PRESET_PATTERNS[idx].name}</span>
                      <span className={isWinner ? 'text-rose-400 font-bold' : 'text-text-dim'}>
                        {act.toFixed(4)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-void-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWinner ? 'bg-rose-500' : 'bg-indigo-500/60'
                        }`}
                        style={{ width: `${Math.min(100, (act / 8) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </Section>

      {/* Chapter 6: Verifiable Worked Numerical Example */}
      <Section>
        <SectionHeader
          title="Chapter 6 — Complete Worked Numerical Example"
          subtitle="Manual step-by-step verification with 3 prototypes and a noisy 4-bit vector."
          badge="Manual Calculation"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-6 max-w-4xl">
          <p className="text-sm text-text-secondary leading-relaxed">
            Let stored 4-bit prototypes be:
          </p>

          <div className="grid grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-void-200 border border-white/5 rounded-lg">p_1 = [1, 1, 0, 0]</div>
            <div className="p-3 bg-void-200 border border-white/5 rounded-lg">p_2 = [0, 1, 1, 0]</div>
            <div className="p-3 bg-void-200 border border-white/5 rounded-lg">p_3 = [0, 0, 1, 1]</div>
          </div>

          <div className="p-4 bg-void-500 border border-white/5 rounded-xl space-y-3 font-mono text-xs text-text-secondary">
            <div><strong>Observed Corrupted Input:</strong> \(x = [1, 1, 1, 0]\)</div>
            <div>
              <strong>1. Bit-by-Bit Mismatch Counts:</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Against \(p_1\): differs at bit 2 (1 vs 0). Total mismatches \(d_H = 1\). Similarity \(s_1 = 4 - 1 = \mathbf{3}\).</li>
                <li>Against \(p_2\): differs at bit 0 (1 vs 0). Total mismatches \(d_H = 1\). Similarity \(s_2 = 4 - 1 = \mathbf{3}\).</li>
                <li>Against \(p_3\): differs at bit 0 (1 vs 0), bit 1 (1 vs 0), bit 3 (0 vs 1). Total mismatches \(d_H = 3\). Similarity \(s_3 = 4 - 3 = \mathbf{1}\).</li>
              </ul>
            </div>
            <div>
              <strong>2. Tie Detection in Stage 1:</strong> Notice that \(p_1\) and \(p_2\) are tied with identical similarity \(s = 3\).
            </div>
            <div>
              <strong>3. Stage 2 (MAXNET) Execution with \(\varepsilon = 0.2\):</strong>
              <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                <li>Total sum \(S(0) = 3 + 3 + 1 = 7\).</li>
                <li>\(a_1(1) = \max(0, 3 - 0.2 \times (7 - 3)) = \max(0, 3 - 0.8) = 2.2\)</li>
                <li>\(a_2(1) = \max(0, 3 - 0.2 \times (7 - 3)) = \max(0, 3 - 0.8) = 2.2\)</li>
                <li>\(a_3(1) = \max(0, 1 - 0.2 \times (7 - 1)) = \max(0, 1 - 1.2) = \mathbf{0.0}\) (Extinguished!)</li>
              </ul>
            </div>
            <div className="text-amber-300 font-semibold pt-1">
              Result: Sub-optimal prototype \(p_3\) is eliminated. Prototypes \(p_1\) and \(p_2\) remain tied at 2.2, demonstrating why ties must be flagged.
            </div>
          </div>
        </div>
      </Section>

      {/* Chapter 7: Practical Applications & Limitations */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 7 — Practical Applications & Limitations"
          subtitle="Binary signature matching and why classical Hamming nets cannot handle continuous deep learning embeddings."
          badge="Applied Engineering"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-rose-400 mb-2">
              Valid Application Domain
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              Binary Hashing & Biometric Iris Codes
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Biometric iris recognition systems (John Daugman's algorithms) convert circular iris textures into
              2,048-bit binary phase demodulation vectors. Fast Hamming distance comparators match real-time scans
              against millions of stored iris codes in national identity databases in fractions of a millisecond.
            </p>
            <div className="text-[11px] font-mono text-text-muted">
              Evidence Level: <strong>Documented Biometric Architecture</strong> (Daugman, IEEE TPAMI 1993).
            </div>
          </Card>

          <Card>
            <div className="text-xs font-mono uppercase tracking-wider text-rose-400 mb-2">
              Architectural Limitation
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">
              Not for Continuous Deep Embeddings
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-3">
              Classical Hamming networks operate exclusively on discrete binary/bipolar vectors. They cannot process
              continuous 768-dimensional float32 vectors generated by modern LLMs or Vision Transformers without
              lossy Locality Sensitive Hashing (LSH) or binarization, which sacrifices geometric cosine fidelity.
            </p>
            <div className="text-[11px] font-mono text-text-muted">
              Evidence Level: <strong>Vector Search Literature</strong> (Malkov & Yashunin, 2018).
            </div>
          </Card>
        </div>
      </Section>

      {/* Chapter 8: Implementation From Scratch */}
      <Section>
        <SectionHeader
          title="Chapter 8 — Implementation From Scratch"
          subtitle="Complete vectorized Python implementation of the two-stage Hamming network."
          badge="Code Laboratory"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-4">
          <div className="code-block">
            <pre className="text-xs text-text-secondary font-mono leading-relaxed">
{`import numpy as np

def hamming_network(input_vec: np.ndarray, prototypes: np.ndarray, epsilon: float = None) -> tuple[int, np.ndarray]:
    """
    Simulate a complete 2-stage Hamming Network.
    
    Parameters:
        input_vec: 1D binary vector of length n (entries in {0, 1}).
        prototypes: 2D array of shape (m, n) holding m stored binary archetypes.
        epsilon: MAXNET lateral inhibition factor.
        
    Returns:
        winner_idx: Index of winning stored prototype (-1 if tied or unresolved).
        similarities: Stage 1 similarity scores.
    """
    x = np.array(input_vec, dtype=np.int32)
    P = np.array(prototypes, dtype=np.int32)
    m, n = P.shape
    
    # Stage 1: Compute Hamming distance and similarity
    # d_H = count of bit differences
    distances = np.sum(x != P, axis=1)
    similarities = n - distances
    
    # Stage 2: Recurrent MAXNET competition
    if epsilon is None:
        epsilon = 0.8 / m
        
    a = similarities.astype(np.float64)
    for _ in range(100):
        if np.sum(a > 1e-7) <= 1:
            break
        total_sum = np.sum(a)
        a = np.maximum(0.0, a - epsilon * (total_sum - a))
        
    survivors = np.where(a > 1e-7)[0]
    winner = int(survivors[0]) if len(survivors) == 1 else -1
    return winner, similarities`}
            </pre>
          </div>
        </div>
      </Section>

      {/* Chapter 10: Knowledge Check */}
      <Section className="bg-void-300 border-y border-white/5">
        <SectionHeader
          title="Chapter 10 — Knowledge Check"
          subtitle="Test your grasp of Hamming metrics and associative retrieval."
          badge="Assessment"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-6 max-w-3xl">
          {[
            {
              id: 1,
              q: 'For two 10-bit binary vectors x and p that differ at 3 bit positions, what is the Hamming distance and similarity score?',
              options: [
                'Distance = 7, Similarity = 3',
                'Distance = 3, Similarity = 7 (since 10 - 3 = 7)',
                'Distance = 3, Similarity = 3',
                'Distance = 0, Similarity = 10',
              ],
              correct: 1,
              explanation:
                'Hamming distance counts the number of differing bits (3). The similarity score equals total length minus distance: 10 - 3 = 7.',
            },
            {
              id: 2,
              q: 'Where does learning occur during the standard training phase of a classical Hamming network?',
              options: [
                'Through backpropagation of gradient descent errors.',
                'The prototypes are directly loaded into the weight matrix; there is no iterative weight training.',
                'Inside the MAXNET layer using Hebbian learning.',
                'Through genetic evolutionary algorithms.',
              ],
              correct: 1,
              explanation:
                'A classical Hamming network is a fixed-prototype memory. Reference exemplars are directly programmed into the synaptic connections w_kj = p_kj / 2 without iterative gradient updates.',
            },
            {
              id: 3,
              q: 'Why does a Hamming network fail to replace modern Vector Databases like Pinecone or Milvus?',
              options: [
                'Hamming networks can only compare binary patterns and do not handle continuous high-dimensional floating-point embeddings.',
                'Hamming networks are too fast for modern computers.',
                'Binary vectors can never represent images.',
                'Hamming distance is illegal under patent law.',
              ],
              correct: 0,
              explanation:
                'Modern vector search operates on 768- or 1536-dimensional continuous floating-point vectors using cosine distance or inner products across billions of items, whereas Hamming networks operate exclusively on binary vectors.',
            },
          ].map((item) => {
            const selected = quizAnswers[item.id];
            const isSub = quizSubmitted[item.id];
            const isCorrect = selected === item.correct;

            return (
              <Card key={item.id} className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 font-mono text-xs font-bold">
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
                          ? 'border border-rose-400 bg-rose-400/10 text-rose-200'
                          : 'border border-white/5 bg-void-200 hover:bg-white/5 text-text-secondary'
                      }`}
                    >
                      <span>{opt}</span>
                      {selected === optIdx && <span className="w-2 h-2 rounded-full bg-rose-400" />}
                    </button>
                  ))}
                </div>

                {!isSub ? (
                  <button
                    disabled={selected === undefined}
                    onClick={() => setQuizSubmitted((prev) => ({ ...prev, [item.id]: true }))}
                    className="px-4 py-2 bg-rose-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:bg-rose-500 transition-colors"
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
          subtitle="Foundational research establishing Hamming networks in pattern recognition."
          badge="Bibliography"
          badgeColor="from-rose-500 to-pink-500"
        />

        <div className="space-y-3 max-w-3xl text-xs text-text-secondary">
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>1. Lippmann, R. P. (1987).</strong> An Introduction to Computing with Neural Nets. <em>IEEE ASSP Magazine</em>, 4(4), 4–22.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>2. Hamming, R. W. (1950).</strong> Error detecting and error correcting codes. <em>Bell System Technical Journal</em>, 29(2), 147–160.
          </div>
          <div className="p-3 bg-void-200 rounded-xl border border-white/5">
            <strong>3. Fausett, L. V. (1994).</strong> <em>Fundamentals of Neural Networks: Architectures, Algorithms, and Applications</em>. Prentice-Hall. Chapter 4: Hamming Networks.
          </div>
        </div>
      </Section>
    </div>
  );
}
