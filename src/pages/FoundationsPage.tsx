import { useState } from 'react';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { EquationBlock, TeX } from '../components/ui/Math';
import { Collapsible, InfoBox } from '../components/ui/Controls';
import { Link } from 'react-router-dom';
import { BookOpen, Zap, GitBranch, Binary, ChevronRight } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  equation?: string;
  related?: string[];
}

const glossary: GlossaryTerm[] = [
  {
    term: 'Artificial Neuron',
    definition: 'A computational unit that receives inputs, multiplies each by a weight, sums the results, and applies an activation function to produce an output. It is a simplified mathematical model loosely inspired by biological neurons.',
    related: ['Activation', 'Weight', 'Weighted Sum'],
  },
  {
    term: 'Activation',
    definition: 'The output value of a neuron after applying its activation function to the weighted sum of inputs. It represents how strongly the neuron is "firing" or responding to its input.',
    related: ['Activation Function', 'Artificial Neuron'],
  },
  {
    term: 'Weight',
    definition: 'A numerical parameter on a connection between neurons (or between an input and a neuron). Weights determine how strongly one signal influences another. In learning algorithms, weights are adjusted during training.',
    related: ['Weighted Sum', 'Artificial Neuron'],
  },
  {
    term: 'Weighted Sum',
    definition: 'The sum of each input multiplied by its corresponding weight: net = Σ wᵢxᵢ. This is the most fundamental computation in a neural network before the activation function is applied.',
    equation: '\\text{net} = \\sum_{i=1}^{n} w_i x_i',
    related: ['Weight', 'Activation Function'],
  },
  {
    term: 'Activation Function',
    definition: 'A function applied to the weighted sum to determine the neuron\'s output. Common examples include the step function, sigmoid, ReLU (max(0, x)), and the identity function. In MAXNET, the activation function clamps negative values to zero.',
    equation: 'f(\\text{net}) = \\max(0, \\text{net})',
    related: ['Activation', 'Weighted Sum'],
  },
  {
    term: 'Inhibition',
    definition: 'A negative influence from one neuron to another, reducing the target neuron\'s activation. In competitive networks, mutual inhibition helps select a winner by suppressing weaker candidates.',
    related: ['Excitation', 'Competitive Learning'],
  },
  {
    term: 'Excitation',
    definition: 'A positive influence from one neuron to another, increasing the target neuron\'s activation. In neighborhood-based learning, nearby neurons may excite each other.',
    related: ['Inhibition', 'Mexican Hat'],
  },
  {
    term: 'Competitive Learning',
    definition: 'A learning paradigm where neurons compete with each other, and typically only the "winner" (the neuron most activated by the input) is updated. Used in SOMs and other unsupervised networks.',
    related: ['Winner-Takes-All', 'Best Matching Unit'],
  },
  {
    term: 'Winner-Takes-All',
    definition: 'A mechanism where the neuron with the highest activation is selected as the winner, and all others are suppressed. MAXNET is a specific implementation of this principle using iterative lateral inhibition.',
    related: ['Competitive Learning', 'MAXNET'],
  },
  {
    term: 'Binary Vector',
    definition: 'A vector whose elements are restricted to two values, typically 0 and 1 (binary) or -1 and +1 (bipolar). Used in Hamming networks for pattern representation.',
    related: ['Hamming Distance', 'Bipolar Vector'],
  },
  {
    term: 'Hamming Distance',
    definition: 'The number of positions at which two binary vectors differ. For vectors x and p of length n: d_H(x,p) = Σ 1[xₖ ≠ pₖ]. It measures how many bits must be flipped to transform one pattern into the other.',
    equation: 'd_H(x, p) = \\sum_{k=1}^{n} \\mathbf{1}[x_k \\ne p_k]',
    related: ['Binary Vector', 'Hamming Network'],
  },
  {
    term: 'Prototype / Exemplar',
    definition: 'A reference pattern stored in memory that represents a category or class. In a Hamming network, prototypes are the patterns against which an input is compared. In a SOM, each neuron\'s weight vector serves as a prototype for the data it represents.',
    related: ['Hamming Network', 'Best Matching Unit'],
  },
  {
    term: 'Topology Preservation',
    definition: 'The property of a mapping where nearby points in the input space are mapped to nearby neurons on the map, and vice versa. SOMs learn topology-preserving maps, meaning the spatial relationships in the data are reflected in the map layout.',
    related: ['Self-Organizing Map', 'Neighborhood Function'],
  },
  {
    term: 'Training vs Inference',
    definition: 'Training is the process of adjusting network parameters (weights) using data. Inference is the process of using the trained network to process new inputs without changing parameters. Some models like MAXNET use fixed weights and only perform inference.',
    related: ['Weight', 'Unsupervised Learning'],
  },
  {
    term: 'Unsupervised vs Supervised Learning',
    definition: 'In supervised learning, the network receives input-output pairs and learns to map inputs to known correct outputs. In unsupervised learning, the network receives only inputs and must discover structure (clusters, patterns, topology) without labeled answers.',
    related: ['Competitive Learning', 'Self-Organizing Map'],
  },
  {
    term: 'Best Matching Unit (BMU)',
    definition: 'In a SOM, the neuron whose weight vector is closest (by Euclidean distance) to the current input vector. The BMU and its neighborhood are updated during training.',
    equation: 'c = \\arg\\min_i \\|x - w_i\\|_2',
    related: ['Self-Organizing Map', 'Competitive Learning'],
  },
];

const concepts = [
  {
    title: 'The Artificial Neuron',
    icon: <Zap className="w-5 h-5" />,
    content: `An artificial neuron is the basic computational building block. It receives several input signals, multiplies each by a weight, adds them up, and passes the result through an activation function.

This is not a faithful model of a biological neuron — it is a mathematical abstraction designed for computation. A biological neuron is vastly more complex.`,
    equation: 'y = f\\left(\\sum_{i=1}^{n} w_i x_i + b\\right)',
    example: 'Given inputs x₁ = 0.5, x₂ = 0.8 with weights w₁ = 0.6, w₂ = 0.3 and bias b = 0.1: net = (0.5)(0.6) + (0.8)(0.3) + 0.1 = 0.3 + 0.24 + 0.1 = 0.64',
  },
  {
    title: 'Weights and Connections',
    icon: <GitBranch className="w-5 h-5" />,
    content: `Weights determine the strength and polarity of connections between neurons. A positive weight means excitation (the connection strengthens the signal). A negative weight means inhibition (the connection weakens or opposes the signal). A zero weight means no connection.

In some networks (like MAXNET), weights are fixed by design. In others (like SOM), weights are learned from data.`,
    equation: 'w_{ij} \\in \\mathbb{R}',
    example: 'In MAXNET: self-weights = 1 (preserve own activation), cross-weights = -ε (inhibit competitors)',
  },
  {
    title: 'Competitive Learning',
    icon: <Zap className="w-5 h-5" />,
    content: `In competitive learning, neurons compete to respond to each input. The neuron that responds most strongly — the "winner" — gets to update its weights, while the losers remain unchanged (or update less).

This is fundamentally different from supervised learning, where a teacher signal tells every output neuron what its target should be.

The SOM extends pure competitive learning by also updating the winner's neighbors, creating a cooperative effect that preserves topology.`,
    equation: 'c = \\arg\\min_i \\|x - w_i\\|_2',
    example: 'If neuron A is distance 1.2 from the input and neuron B is distance 0.8, then B wins the competition.',
  },
  {
    title: 'Hamming Distance',
    icon: <Binary className="w-5 h-5" />,
    content: `The Hamming distance between two binary strings of equal length is the number of positions where the corresponding bits differ.

It was introduced by Richard Hamming in 1950 in the context of error-detecting and error-correcting codes.

In neural networks, it provides a natural way to measure the "closeness" of two binary patterns.`,
    equation: 'd_H(x, p) = \\sum_{k=1}^{n} \\mathbf{1}[x_k \\ne p_k]',
    example: 'x = [1,0,1,1,0], p = [1,1,1,0,0]: differences at positions 2 and 4, so d_H = 2',
  },
];

export function FoundationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTerm, setExpandedTerm] = useState<string | null>(null);

  const filteredGlossary = glossary.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-void-300">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-4">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Prerequisites</span>
          </div>
          <h1 className="text-title font-bold text-text-primary mb-4">Foundations</h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Before entering the neural network models, let's build a shared vocabulary.
            These concepts appear throughout every model on this site. Each one is explained briefly here
            and explored in depth within the relevant model journey.
          </p>
        </div>
      </Section>

      {/* Core Concepts */}
      <Section>
        <SectionHeader
          title="Core Concepts"
          subtitle="The building blocks you need to understand competitive neural networks."
          badge="Essentials"
        />

        <div className="space-y-6">
          {concepts.map((concept) => (
            <Card key={concept.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  {concept.icon}
                </div>
                <h3 className="text-lg font-bold text-text-primary">{concept.title}</h3>
              </div>

              <p className="text-text-secondary leading-relaxed whitespace-pre-line">{concept.content}</p>

              {concept.equation && (
                <EquationBlock tex={concept.equation} label="Key equation" />
              )}

              <div className="p-3 rounded-lg bg-void-200 border border-white/5">
                <p className="text-text-muted text-sm font-medium mb-1">Example</p>
                <p className="text-text-secondary text-sm font-mono">{concept.example}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Unsupervised vs Supervised */}
      <Section className="bg-void-300">
        <SectionHeader
          title="Unsupervised vs. Supervised Learning"
          subtitle="Understanding this distinction is essential for placing these four models in the right context."
          badge="Key distinction"
          badgeColor="from-amber-500 to-orange-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-text-primary mb-3">Supervised Learning</h3>
            <ul className="space-y-2 text-text-secondary text-sm leading-relaxed">
              <li className="flex gap-2"><span className="text-indigo-400 font-bold">•</span> Training data includes both inputs and correct outputs</li>
              <li className="flex gap-2"><span className="text-indigo-400 font-bold">•</span> The network learns to minimize the error between its output and the target</li>
              <li className="flex gap-2"><span className="text-indigo-400 font-bold">•</span> Examples: image classification, speech recognition, language translation</li>
              <li className="flex gap-2"><span className="text-indigo-400 font-bold">•</span> Requires labeled data, which can be expensive to obtain</li>
            </ul>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-text-primary mb-3">Unsupervised Learning</h3>
            <ul className="space-y-2 text-text-secondary text-sm leading-relaxed">
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">•</span> Training data has inputs only — no labels, no teacher signal</li>
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">•</span> The network discovers patterns, clusters, or topology in the data</li>
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">•</span> Examples: clustering, dimensionality reduction, anomaly detection</li>
              <li className="flex gap-2"><span className="text-emerald-400 font-bold">•</span> Does not require labeled data but may produce harder-to-interpret results</li>
            </ul>
          </Card>
        </div>

        <InfoBox type="important" title="Not everything here is unsupervised learning">
          The four models on this site are often taught together in an "unsupervised networks" module, 
          but they are not all unsupervised learning algorithms in the same sense. SOM genuinely learns 
          from data without labels. MAXNET is a competitive selection mechanism that typically uses fixed weights. 
          The Mexican Hat describes a lateral interaction pattern. A Hamming network matches patterns against 
          supplied prototypes. Each model is explained within its proper context.
        </InfoBox>
      </Section>

      {/* Interactive Glossary */}
      <Section>
        <SectionHeader
          title="Interactive Glossary"
          subtitle="Search for any term. Click to expand its definition and related concepts."
          badge="Reference"
        />

        <div className="mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search terms..."
            className="w-full max-w-md px-4 py-2.5 rounded-xl bg-void-200 border border-white/10 text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredGlossary.map((item) => (
            <div
              key={item.term}
              className="glass-card overflow-hidden cursor-pointer"
              onClick={() => setExpandedTerm(expandedTerm === item.term ? null : item.term)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setExpandedTerm(expandedTerm === item.term ? null : item.term); }}
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-text-primary">{item.term}</h4>
                  <ChevronRight className={`w-4 h-4 text-text-dim transition-transform ${expandedTerm === item.term ? 'rotate-90' : ''}`} />
                </div>

                {expandedTerm === item.term && (
                  <div className="mt-3 space-y-3">
                    <p className="text-text-secondary text-sm leading-relaxed">{item.definition}</p>
                    {item.equation && (
                      <div className="flex justify-center">
                        <TeX tex={item.equation} display />
                      </div>
                    )}
                    {item.related && (
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-text-dim text-xs">Related:</span>
                        {item.related.map((rel) => (
                          <button
                            key={rel}
                            onClick={(e) => { e.stopPropagation(); setExpandedTerm(rel); }}
                            className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                          >
                            {rel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Next Steps */}
      <Section className="bg-void-300">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-text-primary mb-4">Ready to Enter the Networks?</h2>
          <p className="text-text-secondary mb-8">
            Now that you have the vocabulary, choose a model to explore in depth.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/models" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:scale-[1.02] transition-transform">
              Explore All Models <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/models/maxnet" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-colors">
              Start with MAXNET <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}
