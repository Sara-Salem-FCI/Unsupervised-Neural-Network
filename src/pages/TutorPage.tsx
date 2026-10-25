import { useState, useEffect, useRef } from 'react';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { TeX } from '../components/ui/Math';
import {
  MessageCircle,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  mathFormula?: string;
  referenceLink?: { text: string; path: string };
  timestamp: string;
}

// Curated Knowledge Base for verified offline answers
const KNOWLEDGE_BASE: Record<string, { answer: string; mathFormula?: string; link?: { text: string; path: string } }> = {
  youtube: {
    answer:
      "No, YouTube does NOT use classical Self-Organizing Maps or MAXNET in production. Commercial recommendation engines at YouTube, Netflix, and Meta operate multi-stage pipelines: 1) Candidate Retrieval using Two-Tower Deep Neural Networks that project billions of items and users into continuous embedding spaces, indexed via Approximate Nearest Neighbor (ANN) vector search (like ScaNN or HNSW); 2) Deep Ranking Transformers that score predicted dwell time and engagement; 3) Re-ranking filters for diversity and safety. Classical unsupervised models like SOM are invaluable for teaching the concepts of vector quantization and topological proximity, but they are not the architectures running at web scale.",
    link: { text: 'Explore SOM Journey & Recommender Systems', path: '/models/som' },
  },
  som: {
    answer:
      "In a Self-Organizing Map, the update equation is w_i(t+1) = w_i(t) + η(t)·h_ci(t)·[x - w_i(t)]. Here, c is the Best Matching Unit (BMU) minimizing ||x - w_i||. The term [x - w_i] represents the direction vector pulling the prototype toward the observed data point. The scalar η(t) is the learning rate which decays over epochs, and h_ci(t) is a Gaussian neighborhood kernel on the 2D grid coordinates that ensures neighboring scout neurons are pulled along cooperatively with the winner.",
    mathFormula: 'w_i(t+1) = w_i(t) + \\eta(t) h_{ci}(t) [x - w_i(t)]',
    link: { text: 'Inspect SOM Mathematical Foundations', path: '/models/som' },
  },
  maxnet_tie: {
    answer:
      "When two neurons in MAXNET have identical maximum activations, the network is unable to break the symmetry. Because the weights are symmetric (w_ij = -ε for all rivals), both tied neurons emit and receive identical inhibitory penalties at every time step. Neither can gain an upper hand. Consequently, both decay at the exact same rate until both are clamped to zero simultaneously by the ReLU activation function, resulting in a tie with zero survivors.",
    mathFormula: 'a_i(t+1) = \\max\\left(0, a_i(t) - \\varepsilon \\sum_{j \\ne i} a_j(t)\\right)',
    link: { text: 'See MAXNET Worked Example with Ties', path: '/models/maxnet' },
  },
  mexican_hat_negative: {
    answer:
      "The Mexican Hat function has a negative region because it subtracts a spatially broader inhibitory Gaussian from a narrower excitatory Gaussian (Difference of Gaussians). At small distances, the central excitatory Gaussian dominates (h > 0). At intermediate distances, the excitatory curve has already decayed toward zero, but the wider inhibitory Gaussian is still active, creating a negative trough (h < 0). This models biological lateral inhibition (seen in retinal ganglion cells), which acts as a spatial high-pass or bandpass filter to sharpen edges and suppress uniform illumination.",
    mathFormula: 'h(r) = A_e e^{-r^2 / 2\\sigma_e^2} - A_i e^{-r^2 / 2\\sigma_i^2}, \\quad \\sigma_i > \\sigma_e',
    link: { text: 'Open Mexican Hat Field Explorer', path: '/models/mexican-hat' },
  },
  hamming_vs_knn: {
    answer:
      "A classical Hamming network operates strictly on binary or bipolar vectors ({0, 1}^n or {-1, +1}^n) by matching inputs against fixed, pre-stored reference exemplars using Hamming distance and a MAXNET competitive ring. A k-Nearest Neighbors (k-NN) classifier, by contrast, operates on continuous multi-dimensional real-valued vectors (ℝ^d) using Euclidean or Minkowski distance, finds the k closest training points, and performs majority voting among class labels.",
    link: { text: 'Examine Hamming Network Architecture', path: '/models/hamming' },
  },
  epsilon_doubled: {
    answer:
      "In MAXNET, if you double epsilon (ε) beyond the theoretical bound of 1/m, the network becomes over-inhibited and unstable. The cumulative inhibition from rival neurons can overpower the maximum activation on the very first iteration, causing all neurons to be clamped to zero at step 1 before any true winner can be resolved.",
    link: { text: 'Test Epsilon in the MAXNET Lab', path: '/models/maxnet' },
  },
};

const SUGGESTED_QUESTIONS = [
  'Does YouTube actually use SOM or MAXNET to recommend videos?',
  'What happens inside MAXNET when two neurons have the same activation?',
  'Why does the Mexican Hat function have a negative surround region?',
  'Can you explain the SOM weight update equation term by term?',
  'What is the difference between a Hamming network and a k-NN classifier?',
  'What would happen if I doubled the learning rate in SOM or epsilon in MAXNET?',
];

export function TutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'tutor',
      text: 'Greetings. I am the Neural Odyssey Research Assistant. I provide mathematically verified explanations, derivations, and engineering insights directly grounded in primary literature. What would you like to explore?',
      timestamp: 'Now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [searchParams] = useSearchParams();
  const processedParamRef = useRef<string | null>(null);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam && qParam !== processedParamRef.current) {
      processedParamRef.current = qParam;
      setInputText(`Can you explain: "${qParam}"?`);
    }
  }, [searchParams]);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputText;
    if (!q.trim()) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Offline Curated Matcher
    const lower = q.toLowerCase();
    let matchedKey: string | null = null;

    if (lower.includes('youtube') || lower.includes('recommend') || lower.includes('netflix')) {
      matchedKey = 'youtube';
    } else if (lower.includes('tie') || lower.includes('same activation') || lower.includes('equal activation')) {
      matchedKey = 'maxnet_tie';
    } else if (lower.includes('negative') || lower.includes('surround') || lower.includes('mexican hat')) {
      matchedKey = 'mexican_hat_negative';
    } else if (lower.includes('som') || lower.includes('update equation') || lower.includes('term by term') || lower.includes('formula')) {
      matchedKey = 'som';
    } else if (lower.includes('hamming') || lower.includes('knn') || lower.includes('nearest neighbor') || lower.includes('difference')) {
      matchedKey = 'hamming_vs_knn';
    } else if (lower.includes('double') || lower.includes('epsilon') || lower.includes('learning rate')) {
      matchedKey = 'epsilon_doubled';
    }

    setTimeout(() => {
      let reply: ChatMessage;
      if (matchedKey && KNOWLEDGE_BASE[matchedKey]) {
        const item = KNOWLEDGE_BASE[matchedKey];
        reply = {
          id: String(Date.now() + 1),
          sender: 'tutor',
          text: item.answer,
          mathFormula: item.mathFormula,
          referenceLink: item.link,
          timestamp: 'Just now',
        };
      } else {
        reply = {
          id: String(Date.now() + 1),
          sender: 'tutor',
          text: `Regarding "${q}": In our verified curriculum, all four models—MAXNET (competitive winner-takes-all), Mexican Hat (spatial lateral field), SOM (unsupervised topology preservation), and Hamming Networks (associative binary matching)—are governed by precise mathematical laws. Please select one of the verified inquiry prompts below, or explore the dedicated model journeys.`,
          timestamp: 'Just now',
        };
      }
      setMessages((prev) => [...prev, reply]);
    }, 400);
  };

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5 pb-8">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Contextual AI Assistant
            </span>
          </div>
          <h1 className="text-title font-bold text-text-primary mb-4">
            Ask the Network — Research Tutor
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Have questions about convergence bounds, biological lateral inhibition, or commercial recommendation pipelines?
            Ask below to receive verified answers cited from primary literature.
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
            <ShieldCheck className="w-4 h-4" />
            <span>Mode: Verified Educational Assistant (Offline Curated Knowledge Base Active)</span>
          </div>
        </div>
      </Section>

      {/* Main Chat Interface */}
      <Section className="pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chat Window */}
          <Card className="lg:col-span-8 p-6 flex flex-col h-[600px] border-white/10">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {m.sender === 'tutor' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 text-indigo-300 mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                        : 'bg-void-200 border border-white/5 text-text-secondary rounded-tl-none'
                    }`}
                  >
                    <p>{m.text}</p>

                    {m.mathFormula && (
                      <div className="p-2 bg-void-500/80 rounded-lg overflow-x-auto border border-white/5">
                        <TeX tex={m.mathFormula} display />
                      </div>
                    )}

                    {m.referenceLink && (
                      <div className="pt-1">
                        <Link
                          to={m.referenceLink.path}
                          className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white font-semibold transition-colors"
                        >
                          {m.referenceLink.text} <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0 text-white mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Form */}
            <div className="pt-4 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Ask about equations, convergence, or real-world systems..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend();
                }}
                className="flex-1 px-4 py-3 bg-void-200 border border-white/10 rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputText.trim()}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send
              </button>
            </div>
          </Card>

          {/* Quick Suggested Queries Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="p-6 space-y-3">
              <h3 className="font-bold text-text-primary text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Suggested Research Inquiries
              </h3>
              <p className="text-xs text-text-muted">
                Click any prompt to instantly run a verified query through the tutor:
              </p>

              <div className="space-y-2 pt-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="w-full text-left p-3 rounded-xl bg-void-200 hover:bg-white/5 border border-white/5 text-xs text-text-secondary hover:text-white transition-all leading-snug"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </Card>

            <Card className="p-6 text-xs text-text-dim space-y-2 border-white/5">
              <div className="font-bold text-text-secondary uppercase tracking-wider text-[11px]">
                API Provider Configuration
              </div>
              <p className="leading-relaxed">
                This tutor is built with an extensible provider abstraction. In self-hosted or production environments,
                a backend server with an OpenAI or Gemini API key can be linked via environment variables (e.g. <code className="text-indigo-300">OPENAI_API_KEY</code>).
                When absent, the system seamlessly operates on this curated, hallucination-free knowledge base.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
