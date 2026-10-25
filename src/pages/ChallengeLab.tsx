import { useState, useEffect } from 'react';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { TeX } from '../components/ui/Math';
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface Challenge {
  id: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Conceptual' | 'Calculation' | 'Prediction' | 'Debugging' | 'Model Selection';
  question: string;
  mathPrompt?: string;
  codeSnippet?: string;
  options: string[];
  correct: number;
  explanation: string;
  hint: string;
}

const challenges: Challenge[] = [
  {
    id: 1,
    level: 'Beginner',
    category: 'Conceptual',
    question: 'Why does MAXNET require the parameter constraint 0 < ε < 1/m, where m is the number of competing neurons?',
    options: [
      'To prevent the weight matrix from becoming non-invertible.',
      'To ensure that total inhibition from all rivals does not immediately overpower and decimate the maximum activation in a single step.',
      'Because analog circuits cannot handle fractions less than 1/m.',
      'To force the network to select exactly two winners.',
    ],
    correct: 1,
    explanation:
      'If ε ≥ 1/m, then if all m-1 competitors have activations close to the maximum, the sum of their inhibitions ε·(S - a_i) will exceed a_i itself on the very first iteration, extinguishing all nodes simultaneously.',
    hint: 'Think about what happens to the sum of m-1 rivals when ε is set too high.',
  },
  {
    id: 2,
    level: 'Beginner',
    category: 'Calculation',
    question: 'Calculate the Hamming distance and similarity score between x = [1, 0, 1, 1, 0] and p = [1, 1, 1, 0, 0].',
    mathPrompt: 'n = 5',
    options: [
      'd_H = 1, Similarity = 4',
      'd_H = 2, Similarity = 3',
      'd_H = 3, Similarity = 2',
      'd_H = 0, Similarity = 5',
    ],
    correct: 1,
    explanation:
      'The vectors differ at bit index 1 (0 vs 1) and bit index 3 (1 vs 0). Total mismatched bits d_H = 2. Similarity score s = n - d_H = 5 - 2 = 3.',
    hint: 'Compare each index: index 0 matches (1=1), index 1 differs (0≠1)...',
  },
  {
    id: 3,
    level: 'Intermediate',
    category: 'Prediction',
    question: 'In a 1D Mexican Hat kernel h(r) = A_e·exp(-r²/2σ_e²) - A_i·exp(-r²/2σ_i²), what occurs to the zero-crossing radius r₀ if you decrease the inhibitory width σ_i so that it approaches σ_e?',
    options: [
      'The zero-crossing radius r₀ pushes infinitely far outward.',
      'The zero-crossing radius r₀ shrinks toward zero, extinguishing the surrounding inhibitory trough.',
      'The kernel flips upside down and becomes purely negative.',
      'The network converts into a MAXNET.',
    ],
    correct: 1,
    explanation:
      'As σ_i approaches σ_e, the difference of Gaussians collapses because both curves have identical spatial variances. The negative surround disappears completely.',
    hint: 'Inspect the denominator of r₀ = √[ 2σ_e²σ_i² / (σ_i² - σ_e²) · ln(A_e/A_i) ].',
  },
  {
    id: 4,
    level: 'Intermediate',
    category: 'Calculation',
    question: 'Given a 2D SOM with BMU at coordinate (2, 3) and current radius σ(t) = 1.0. What is the neighborhood influence factor h_ci for a neuron located at coordinate (2, 4)?',
    mathPrompt: 'h_{ci} = \\exp\\left(-\\frac{d_{\\text{grid}}^2}{2\\sigma^2}\\right)',
    options: [
      'h_ci = 1.000',
      'h_ci = exp(-1/2) ≈ 0.6065',
      'h_ci = exp(-2) ≈ 0.1353',
      'h_ci = 0.000',
    ],
    correct: 1,
    explanation:
      'The distance on the grid between (2,3) and (2,4) is 1 unit. With σ = 1.0, h_ci = exp(-1² / (2 · 1²)) = exp(-0.5) ≈ 0.6065.',
    hint: 'Grid distance = √((2-2)² + (3-4)²) = 1.',
  },
  {
    id: 5,
    level: 'Advanced',
    category: 'Debugging',
    question: 'Identify the critical scientific bug in this student\'s implementation of MAXNET:',
    codeSnippet: `def maxnet_step(a, epsilon):\n    new_a = []\n    for i in range(len(a)):\n        # student computes sum of all elements\n        inhib = epsilon * sum(a)\n        new_a.append(max(0, a[i] - inhib))\n    return new_a`,
    options: [
      'The student forgot to convert epsilon to a float.',
      'The student included neuron i in its own inhibition sum (sum(a)), meaning the neuron inhibits itself instead of only receiving inhibition from rivals (sum_{j≠i} a_j).',
      'The activation function max(0, ·) should be replaced with sigmoid.',
      'The loop should run in reverse order.',
    ],
    correct: 1,
    explanation:
      'In MAXNET, diagonal weights are strictly w_ii = +1 (self-excitation/retention). Lateral inhibition must only be applied across rivals j ≠ i. The correct inhibition sum is (sum(a) - a[i]).',
    hint: 'Look closely at what is inside inhib: does a[i] penalize itself?',
  },
  {
    id: 6,
    level: 'Advanced',
    category: 'Model Selection',
    question: 'A robotics company has 20 continuous motor sensor signals. They need to visualize clustering of flight stability regimes in real time on a cockpit dashboard. Which model is scientifically appropriate?',
    options: [
      'Hamming Network (with thresholded binary bits)',
      'MAXNET alone',
      'Self-Organizing Map (SOM) projected onto a 2D U-Matrix',
      'A static Mexican Hat convolution kernel',
    ],
    correct: 2,
    explanation:
      'SOM is specifically engineered for unsupervised continuous multivariate data projection onto a low-dimensional topological grid, with U-Matrix visualization of cluster boundaries.',
    hint: 'The data is continuous and high-dimensional, requiring 2D visual map projection.',
  },
];

export function ChallengeLab() {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [activeTier, setActiveTier] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');

  // "Teach It Back" Challenge State
  const [teachInput, setTeachInput] = useState<string>('');
  const [teachSubmitted, setTeachSubmitted] = useState<boolean>(false);

  // Score calculation
  const totalCompleted = Object.keys(submittedAnswers).length;
  const score = Object.entries(submittedAnswers).filter(
    ([id, _]) => selectedAnswers[Number(id)] === challenges.find((c) => c.id === Number(id))?.correct
  ).length;

  const filteredChallenges = activeTier === 'All'
    ? challenges
    : challenges.filter((c) => c.level === activeTier);

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-4">
            <GraduationCap className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Verification & Assessment
            </span>
          </div>
          <h1 className="text-title font-bold text-text-primary mb-4">
            Neural Challenge Lab
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Validate your mastery through mathematical calculations, algorithm state predictions,
            code debugging puzzles, and scenario-based model selection.
          </p>
        </div>
      </Section>

      {/* Progress & Tier Filter */}
      <Section className="pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-6 glass-card border-white/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-text-dim uppercase tracking-wider">
                Laboratory Mastery Score
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {score} <span className="text-text-muted text-base">/ {challenges.length} Correct</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-void-200 rounded-xl">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setActiveTier(tier)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTier === tier
                    ? 'bg-emerald-600 text-white'
                    : 'text-text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Challenge Cards Grid */}
      <Section className="pt-0">
        <div className="space-y-6">
          {filteredChallenges.map((ch) => {
            const isSub = submittedAnswers[ch.id];
            const selected = selectedAnswers[ch.id];
            const isCorrect = selected === ch.correct;
            const hintRevealed = revealedHints[ch.id];

            return (
              <Card key={ch.id} className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                        ch.level === 'Beginner'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : ch.level === 'Intermediate'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {ch.level}
                    </span>
                    <span className="text-xs font-mono text-text-dim">
                      Category: {ch.category}
                    </span>
                  </div>

                  <span className="text-xs font-mono text-text-dim">Challenge #{ch.id}</span>
                </div>

                <div className="text-sm font-semibold text-text-primary leading-snug">
                  {ch.question}
                </div>

                {ch.mathPrompt && (
                  <div className="my-2 p-3 bg-void-200 rounded-lg inline-block border border-white/5">
                    <TeX tex={ch.mathPrompt} display />
                  </div>
                )}

                {ch.codeSnippet && (
                  <div className="code-block my-2">
                    <pre className="text-xs font-mono text-amber-300">{ch.codeSnippet}</pre>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  {ch.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      disabled={isSub}
                      onClick={() =>
                        setSelectedAnswers((prev) => ({ ...prev, [ch.id]: optIdx }))
                      }
                      className={`w-full text-left p-3.5 rounded-xl text-xs transition-all flex items-center justify-between ${
                        selected === optIdx
                          ? 'border border-emerald-400 bg-emerald-400/10 text-emerald-200'
                          : 'border border-white/5 bg-void-200 hover:bg-white/5 text-text-secondary'
                      }`}
                    >
                      <span>{opt}</span>
                      {selected === optIdx && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    {!isSub ? (
                      <button
                        disabled={selected === undefined}
                        onClick={() =>
                          setSubmittedAnswers((prev) => ({ ...prev, [ch.id]: true }))
                        }
                        className="px-4 py-2 bg-emerald-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 transition-colors"
                      >
                        Submit Response
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSubmittedAnswers((prev) => {
                            const copy = { ...prev };
                            delete copy[ch.id];
                            return copy;
                          });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-void-200 text-text-secondary rounded-lg text-xs hover:bg-white/5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Retry
                      </button>
                    )}

                    {!isSub && (
                      <button
                        onClick={() =>
                          setRevealedHints((prev) => ({ ...prev, [ch.id]: !hintRevealed }))
                        }
                        className="text-xs text-text-dim hover:text-text-secondary flex items-center gap-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        {hintRevealed ? 'Hide Hint' : 'Need a hint?'}
                      </button>
                    )}
                  </div>
                </div>

                {hintRevealed && !isSub && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                    <strong>Hint:</strong> {ch.hint}
                  </div>
                )}

                {isSub && (
                  <div
                    className={`p-4 rounded-xl text-xs space-y-1 ${
                      isCorrect
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Correct Answer
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" /> Incorrect Answer
                        </>
                      )}
                    </div>
                    <div className="text-text-secondary leading-relaxed pt-1">
                      {ch.explanation}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </Section>

      {/* "Teach It Back" Challenge Section */}
      <Section className="bg-void-300 border-t border-white/5">
        <SectionHeader
          title="The 'Teach It Back' Mastery Challenge"
          subtitle="True conceptual mastery requires explaining a concept in your own natural words without relying on memorized jargon."
          badge="Feynman Technique"
          badgeColor="from-purple-500 to-pink-500"
        />

        <Card className="p-6 space-y-4 max-w-3xl">
          <div className="space-y-1">
            <h3 className="font-bold text-text-primary text-sm">
              Prompt: Explain how a Self-Organizing Map (SOM) avoids collapsing into a single point during training.
            </h3>
            <p className="text-xs text-text-muted">
              Write a 2-4 sentence explanation as if you were explaining it to a fellow software engineer.
            </p>
          </div>

          <textarea
            rows={4}
            value={teachInput}
            onChange={(e) => setTeachInput(e.target.value)}
            placeholder="Type your explanation here..."
            className="w-full p-4 bg-void-200 border border-white/10 rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500"
          />

          <div className="flex justify-between items-center">
            <button
              disabled={teachInput.trim().length < 20}
              onClick={() => setTeachSubmitted(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 disabled:opacity-40 text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Compare with Authoritative Reference
            </button>
          </div>

          {teachSubmitted && (
            <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs space-y-2">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Authoritative Reference Answer
              </div>
              <p className="text-text-secondary leading-relaxed">
                "A SOM avoids collapsing because each training sample pulls only its closest Best Matching Unit (BMU)
                and that BMU's immediate grid neighbors. Different regions of the input manifold activate different
                neurons across the grid. Combined with an initial neighborhood radius that smoothly spans the lattice
                before shrinking, the network is compelled to stretch across the full distribution rather than collapsing."
              </p>
              <div className="text-text-dim pt-1 italic">
                Did your response emphasize competitive winner selection and spatial neighborhood constraints?
              </div>
            </div>
          )}
        </Card>
      </Section>
    </div>
  );
}
