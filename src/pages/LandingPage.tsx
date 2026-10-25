import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Map, Shield, Layers, ChevronRight, Brain, Sparkles } from 'lucide-react';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { NeuralBackground } from '../components/viz/NeuralBackground';

const models = [
  {
    id: 'maxnet',
    title: 'MAXNET',
    subtitle: 'The Competition Arena',
    description: 'A fixed-weight competitive network that selects the strongest activation through mutual inhibition. Neurons compete until only the winner survives.',
    icon: Zap,
    color: 'maxnet',
    gradient: 'from-amber-500 to-yellow-400',
    path: '/models/maxnet',
    features: ['Winner-takes-all selection', 'Fixed inhibitory weights', 'Iterative competition'],
  },
  {
    id: 'mexican-hat',
    title: 'Mexican Hat',
    subtitle: 'The Field of Influence',
    description: 'A lateral interaction pattern where nearby neurons excite each other while more distant neurons are inhibited. The foundation of spatial neural organization.',
    icon: Layers,
    color: 'mexhat',
    gradient: 'from-emerald-500 to-teal-400',
    path: '/models/mexican-hat',
    features: ['Local excitation', 'Surround inhibition', 'Spatial interaction kernel'],
  },
  {
    id: 'som',
    title: 'Self-Organizing Maps',
    subtitle: "The Cartographer's Universe",
    description: 'An unsupervised competitive learning algorithm that creates a low-dimensional, topology-preserving map of high-dimensional input data.',
    icon: Map,
    color: 'som',
    gradient: 'from-indigo-500 to-purple-500',
    path: '/models/som',
    features: ['Unsupervised topology learning', 'Competitive BMU selection', 'Neighborhood cooperation'],
  },
  {
    id: 'hamming',
    title: 'Hamming Networks',
    subtitle: 'The Hall of Memories',
    description: 'A pattern-matching network that compares binary inputs against stored prototypes using Hamming distance, then selects the closest match.',
    icon: Shield,
    color: 'hamming',
    gradient: 'from-rose-500 to-pink-400',
    path: '/models/hamming',
    features: ['Binary pattern matching', 'Hamming distance scoring', 'Prototype selection'],
  },
];

const distinctions = [
  {
    label: 'MAXNET',
    type: 'Competitive selection mechanism',
    learns: 'No — uses fixed weights',
    purpose: 'Select the largest activation from a set of competing neurons',
  },
  {
    label: 'Mexican Hat',
    type: 'Lateral interaction pattern',
    learns: 'Depends on context — the kernel itself is typically prescribed',
    purpose: 'Define local excitation and surround inhibition among spatially arranged neurons',
  },
  {
    label: 'SOM',
    type: 'Unsupervised competitive learning algorithm',
    learns: 'Yes — learns prototype vectors from data',
    purpose: 'Create a topology-preserving map of high-dimensional data',
  },
  {
    label: 'Hamming Network',
    type: 'Similarity-based pattern matcher',
    learns: 'Prototypes are typically supplied, not learned from data',
    purpose: 'Find the stored reference pattern closest to an input',
  },
];

export function LandingPage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <NeuralBackground />

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-8">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-300 text-sm font-medium">Interactive Neural Network Explorer</span>
          </div>

          {/* Title */}
          <h1 className="text-hero font-black text-text-primary mb-6 tracking-tight">
            Neural{' '}
            <span className="text-gradient bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Odyssey
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-subtitle text-text-secondary max-w-2xl mx-auto mb-4">
            Enter the Network. Understand the Intelligence.
          </p>
          <p className="text-text-muted max-w-xl mx-auto mb-10 leading-relaxed">
            Watch mathematics unfold, experiment with neural mechanisms, and build intuition 
            for competitive learning, self-organization, and pattern matching — 
            through interactive visualizations backed by primary research.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/foundations"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02]"
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/models"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 hover:bg-white/5 font-medium text-lg transition-all duration-300"
            >
              Explore the Models
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-text-dim text-xs uppercase tracking-widest">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Central Question */}
      <Section className="bg-void-300">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 leading-snug">
            How can a neural network discover structure, recognize patterns, or organize information{' '}
            <span className="text-gradient-indigo">without being explicitly told the correct answer?</span>
          </h2>
          <p className="text-text-secondary leading-relaxed mb-8">
            In supervised learning, a teacher provides correct outputs. But what happens when there is no teacher?
            Unsupervised neural networks find structure in data through competition, cooperation, and self-organization.
            These four models show different strategies for solving problems without labeled examples.
          </p>
          <Link
            to="/foundations"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Start with the foundations <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </Section>

      {/* Model Portals */}
      <Section>
        <SectionHeader
          title="Four Models, Four Worlds"
          subtitle="Each model represents a different strategy for neural computation. Enter any portal to begin an interactive journey through its architecture, mathematics, and applications."
          badge="Explore"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((model) => (
            <Link key={model.id} to={model.path} className="group">
              <Card hover glow={model.color as any} className="h-full">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <model.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-text-primary">{model.title}</h3>
                      <ChevronRight className="w-4 h-4 text-text-dim group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className={`text-sm font-medium bg-gradient-to-r ${model.gradient} bg-clip-text text-transparent mb-2`}>
                      {model.subtitle}
                    </p>
                    <p className="text-text-secondary text-sm leading-relaxed mb-3">
                      {model.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {model.features.map((feature) => (
                        <span key={feature} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-text-muted border border-white/5">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      {/* Distinctions Table */}
      <Section className="bg-void-300">
        <SectionHeader
          title="Understanding the Differences"
          subtitle="These four topics are not equivalent types of learning algorithms. They serve different computational purposes and have different relationships to training, data, and inference."
          badge="Critical distinctions"
          badgeColor="from-amber-500 to-orange-500"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-text-muted font-semibold">Model</th>
                <th className="text-left py-3 px-4 text-text-muted font-semibold">Type</th>
                <th className="text-left py-3 px-4 text-text-muted font-semibold">Learns from Data?</th>
                <th className="text-left py-3 px-4 text-text-muted font-semibold">Primary Purpose</th>
              </tr>
            </thead>
            <tbody>
              {distinctions.map((row, i) => (
                <tr key={row.label} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="py-3 px-4 font-semibold text-text-primary">{row.label}</td>
                  <td className="py-3 px-4 text-text-secondary">{row.type}</td>
                  <td className="py-3 px-4 text-text-secondary">{row.learns}</td>
                  <td className="py-3 px-4 text-text-secondary">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <p className="text-text-secondary text-sm leading-relaxed">
            <strong className="text-amber-400">Note:</strong> These models often appear together in neural networks courses, 
            but they are not all unsupervised learning algorithms in the same sense. MAXNET is a competitive selection mechanism, 
            the Mexican Hat describes a pattern of lateral interaction, SOM is a genuine unsupervised learning algorithm, 
            and a classical Hamming network is a similarity-based pattern matcher with supplied prototypes. 
            This site explains each model accurately within its own proper context.
          </p>
        </div>
      </Section>

      {/* Discovery Questions Preview */}
      <Section>
        <SectionHeader
          title="Questions That Open Worlds"
          subtitle="Start with a question. Discover the computation behind the answer."
          badge="Discovery"
          badgeColor="from-purple-500 to-pink-500"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { q: 'How can a network choose one winner out of thousands?', model: 'MAXNET', color: 'text-maxnet' },
            { q: 'How can a map emerge from data with no coordinates?', model: 'SOM', color: 'text-som' },
            { q: 'How can a system recognize a corrupted pattern?', model: 'Hamming', color: 'text-hamming' },
            { q: 'Why would a neuron excite neighbors but inhibit distant ones?', model: 'Mexican Hat', color: 'text-mexhat' },
            { q: 'How does a recommendation engine decide what to show?', model: 'Multiple', color: 'text-indigo-400' },
            { q: 'What makes unsupervised learning different from supervised?', model: 'Foundations', color: 'text-purple-400' },
          ].map((item) => (
            <Link to="/discover" key={item.q} className="group">
              <Card hover className="h-full">
                <p className="text-text-primary font-medium mb-3 group-hover:text-white transition-colors">
                  "{item.q}"
                </p>
                <span className={`text-xs font-semibold ${item.color}`}>→ Explore {item.model}</span>
              </Card>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
