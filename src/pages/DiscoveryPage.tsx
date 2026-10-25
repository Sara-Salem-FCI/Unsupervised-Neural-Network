import { useState } from 'react';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { EquationBlock, TeX } from '../components/ui/Math';
import { Link } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  Zap,
  Map,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface DiscoveryQuestion {
  id: string;
  question: string;
  tagline: string;
  model: string;
  modelPath: string;
  color: string;
  icon: any;
  scenario: string;
  keyInsight: string;
  mathConnection: string;
  realWorldReality: string;
}

const questions: DiscoveryQuestion[] = [
  {
    id: 'winner-selection',
    question: 'How can a network choose one winner out of thousands of candidates without a central sorting algorithm?',
    tagline: 'Decentralized Competitive Selection',
    model: 'MAXNET',
    modelPath: '/models/maxnet',
    color: 'text-maxnet',
    icon: Zap,
    scenario:
      'Imagine 1,000 sensors simultaneously reporting conflicting confidence scores for an unknown signal. No central CPU or memory sorting register exists in the analog substrate. How can the physical network guarantee that only the strongest signal survives?',
    keyInsight:
      'Through symmetric lateral cross-inhibition: every node feeds back its own activation to inhibit its rivals. Because the largest node receives less aggregate inhibition than smaller nodes, weaker candidates are extinguished exponentially faster until only the undisputed victor fires.',
    mathConnection:
      'a_i(t+1) = \\max\\left(0, a_i(t) - \\varepsilon \\sum_{j \\ne i} a_j(t)\\right)',
    realWorldReality:
      'Used in optical processors and analog neuromorphic crossbars where sorting happens in nanoseconds at the speed of current flow, without von Neumann loop instructions.',
  },
  {
    id: 'map-emergence',
    question: 'How can a geometric map emerge from data that has no spatial or geographical coordinates?',
    tagline: 'Topology-Preserving Self-Organization',
    model: 'Self-Organizing Maps',
    modelPath: '/models/som',
    color: 'text-som',
    icon: Map,
    scenario:
      'Consider thousands of customer profiles, each described by 50 behavioral metrics (purchases, session duration, device types, return rates). There are no GPS coordinates or labels. How can a network lay these profiles onto a 2D floorplan where similar customers naturally cluster together?',
    keyInsight:
      'By coupling competitive selection (finding the Best Matching Unit) with spatial neighborhood cooperation: whenever a neuron updates toward an observation, it tugs its grid neighbors along with it, gradually unfolding the neural sheet across the nonlinear data manifold.',
    mathConnection:
      'w_i(t+1) = w_i(t) + \\eta(t) h_{ci}(t) [x - w_i(t)]',
    realWorldReality:
      'Employed in transcriptomic gene expression profiling, industrial turbine sensor telemetries, and financial credit risk clustering to transform unintelligible 50D matrices into human-readable 2D cartographic maps.',
  },
  {
    id: 'corrupted-pattern',
    question: 'How can a system recognize a stored memory when its input has been severely degraded by noise?',
    tagline: 'Associative Error-Tolerant Recall',
    model: 'Hamming Network',
    modelPath: '/models/hamming',
    color: 'text-hamming',
    icon: Shield,
    scenario:
      'A barcode scanner in an automated warehouse reads an 8-bit tracking tag where ink splatters have flipped 2 of the bits from 1 to 0. Exact database queries return zero results. How does the system instantly identify the true archetype?',
    keyInsight:
      'By projecting the noisy input through parallel prototype correlation neurons that evaluate bit matching scores (n - Hamming distance), then funneling the scores into a MAXNET competitive ring that extinguishes sub-optimal matches.',
    mathConnection:
      'd_H(x, p) = \\sum_{k=1}^n \\mathbf{1}[x_k \\ne p_k], \\quad s(x, p) = n - d_H(x, p)',
    realWorldReality:
      'The foundational principle behind modern biometric iris code matching (Daugman algorithm) and binary error-correcting decoders in satellite telecommunications.',
  },
  {
    id: 'local-excitation',
    question: 'Why would a neuron excite its close neighbors but aggressively inhibit neurons farther away?',
    tagline: 'Center-Surround Contrast Sharpening',
    model: 'Mexican Hat',
    modelPath: '/models/mexican-hat',
    color: 'text-mexhat',
    icon: Layers,
    scenario:
      'In the mammalian retina, visual light hitting photoreceptors is naturally diffuse and blurry due to eye optics and fluid dispersion. How does the nervous system prevent visual perception from dissolving into an indistinct, muddy wash?',
    keyInsight:
      'By balancing short-range excitation (strengthening the central focal signal) with a surrounding ring of lateral inhibition (carving a dark perimeter moat around the signal). This Difference-of-Gaussians profile filters out uniform background illumination while amplifying edges.',
    mathConnection:
      'h(r) = A_e e^{-r^2 / 2\\sigma_e^2} - A_i e^{-r^2 / 2\\sigma_i^2}, \\quad \\sigma_i > \\sigma_e',
    realWorldReality:
      'Directly maps to the Laplacian of Gaussian (LoG) filter in computer vision edge detection and biological receptive fields in retinal ganglion cells.',
  },
  {
    id: 'recommender-truth',
    question: 'How does a modern recommendation engine really decide what to show you next?',
    tagline: 'Deconstructing Commercial Production Systems',
    model: 'Comparative Synthesis',
    modelPath: '/models/som',
    color: 'text-indigo-400',
    icon: Sparkles,
    scenario:
      'You open YouTube or Netflix, and the home feed instantly serves personalized videos from a library of 1 billion items. Did a classical neural network (like SOM or MAXNET) pick these videos?',
    keyInsight:
      'Commercial systems use multi-stage pipelines: 1) Candidate Retrieval (Two-Tower Deep Neural Networks mapping users and items into 256D continuous embeddings, searched via Approximate Nearest Neighbor graphs like HNSW/ScaNN in 10ms); 2) Heavy Ranking (Deep multi-task Transformer models scoring predicted watch time); 3) Diversity & Business Rule Filtering.',
    mathConnection:
      'P(\\text{click}) = \\sigma\\left(\\text{DeepRanker}\\big(\\text{UserEmbedding}, \\text{VideoEmbedding}, \\text{Context}\\big)\\right)',
    realWorldReality:
      'Classical unsupervised models like SOM provide clear mental models for understanding vector quantization and neighborhood proximity, but production systems operate on billions of continuous vectors with GPU/TPU clusters.',
  },
];

export function DiscoveryPage() {
  const [activeQuestion, setActiveQuestion] = useState<string>(questions[0].id);

  const current = questions.find((q) => q.id === activeQuestion) || questions[0];
  const Icon = current.icon;

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 mb-4">
            <Compass className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Inquiry-Driven Exploration
            </span>
          </div>
          <h1 className="text-title font-bold text-text-primary mb-4">
            Questions That Open Worlds
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Every breakthrough neural architecture was conceived to answer an intuitive computational puzzle.
            Select a question below to unlock its underlying mechanism, mathematical formulation, and real-world reality.
          </p>
        </div>
      </Section>

      {/* Discovery Navigator */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Question List (Left Column) */}
          <div className="lg:col-span-5 space-y-3">
            {questions.map((q) => {
              const QIcon = q.icon;
              const isSelected = q.id === activeQuestion;
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQuestion(q.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/10 scale-[1.02]'
                      : 'border-white/5 bg-void-200/60 hover:bg-white/5 text-text-secondary'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg border mt-0.5 ${
                      isSelected
                        ? 'border-indigo-400/40 bg-indigo-400/20 text-indigo-300'
                        : 'border-white/5 bg-void-300 text-text-dim'
                    }`}
                  >
                    <QIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-text-dim mb-1">
                      {q.tagline}
                    </div>
                    <div className="text-sm font-semibold text-text-primary leading-snug">
                      {q.question}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Deep Exploration Card (Right Column) */}
          <div className="lg:col-span-7">
            <Card className="p-8 space-y-6 border-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <Icon className={`w-6 h-6 ${current.color}`} />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-text-dim">
                      Target Architecture: {current.model}
                    </span>
                    <h2 className="text-lg font-bold text-text-primary">{current.tagline}</h2>
                  </div>
                </div>
                <Link
                  to={current.modelPath}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Full Lesson <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Scenario */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
                  The Computational Scenario
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed bg-void-200 p-4 rounded-xl border border-white/5">
                  {current.scenario}
                </p>
              </div>

              {/* Key Insight */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
                  The Core Architectural Mechanism
                </h3>
                <p className="text-sm text-text-primary leading-relaxed">
                  {current.keyInsight}
                </p>
              </div>

              {/* Mathematical Bridge */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
                  The Governing Mathematical Relationship
                </h3>
                <EquationBlock tex={current.mathConnection} />
              </div>

              {/* Real World Reality */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-wider text-text-dim mb-2">
                  Production Engineering Context
                </h3>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-text-secondary leading-relaxed">
                  {current.realWorldReality}
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={current.modelPath}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all"
                >
                  Enter Interactive Journey for {current.model}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
