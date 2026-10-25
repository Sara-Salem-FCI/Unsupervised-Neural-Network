# Neural Odyssey

> **Enter the Network. Understand the Intelligence.**  
> *An interactive, research-backed scientific journey through unsupervised neural networks.*

Neural Odyssey is a production-quality, mathematically rigorous educational platform designed to teach four classical neural network architectures and concepts:

1. **MAXNET** — *The Competition Arena*
2. **Mexican Hat Networks** — *The Field of Influence*
3. **Self-Organizing Maps (SOM / Kohonen Maps)** — *The Cartographer's Universe*
4. **Hamming Networks** — *The Hall of Memories*

---

## 🔬 Core Scientific Principles

Neural Odyssey rejects superficial AI aesthetics in favor of deep mathematical fidelity:

- **True Numerical Simulation**: Visualizations are directly driven by real underlying numerical algorithms (`src/lib/math/`), not static animations or decorative mocks.
- **Traceable Primary Literature**: Every equation, stability constraint, and historical attribution is directly cited with peer-reviewed publications and DOI links.
- **Honest Industry Qualifications**: We rigorously qualify claims regarding commercial production systems (such as YouTube and Netflix recommenders), explaining the multi-stage modern pipeline (two-tower DNNs, Approximate Nearest Neighbor search with ScaNN/HNSW, transformer rankers) while celebrating classical models as conceptual foundations.
- **Offline Reliability**: The platform functions 100% locally with zero paid API dependencies, featuring a curated offline tutor knowledge base.

---

## 🏛️ Repository Architecture

```text
master/
├── public/                 # Static assets and icons
├── src/
│   ├── components/         # Shared presentation layer
│   │   ├── ui/             # Controls, Sliders, Math (KaTeX), Sections, Cards
│   │   ├── viz/            # Dynamic Canvas neural network particle field
│   │   ├── Navbar.tsx      # Responsive navigation header
│   │   ├── Footer.tsx      # Comprehensive sitemap and credits
│   │   └── Layout.tsx      # Shell layout with route transition scroll management
│   ├── lib/
│   │   └── math/           # Pure TypeScript mathematical engines (Framework-Independent)
│   │       ├── maxnet.ts       # MAXNET winner-takes-all iterative update rules
│   │       ├── mexican-hat.ts  # Difference of Gaussians (DoG) & spatial kernels
│   │       ├── som.ts          # Kohonen SOM engine: BMU, decay, U-Matrix, quantization
│   │       ├── hamming.ts      # Hamming distance, similarity, prototype matcher
│   │       ├── datasets.ts     # Seeded synthetic manifold generators
│   │       └── __tests__/      # Automated Vitest test suite (86 passing tests)
│   ├── pages/              # Application views & interactive modules
│   │   ├── LandingPage.tsx       # Cinematic hero section & comparative distinctions
│   │   ├── FoundationsPage.tsx   # Essential vocabulary, interactive glossary, prerequisites
│   │   ├── ModelHub.tsx          # Comparative taxonomy & side-by-side scientific matrix
│   │   ├── DiscoveryPage.tsx     # "Questions That Open Worlds" inquiry explorer
│   │   ├── ChallengeLab.tsx      # Calculation, debugging, and Feynman "Teach It Back" lab
│   │   ├── ResearchLibrary.tsx   # Searchable primary literature bibliography with DOIs
│   │   ├── TutorPage.tsx         # "Ask the Network" AI research assistant
│   │   └── models/               # The Four 11-Chapter Model Journeys
│   │       ├── MaxnetJourney.tsx
│   │       ├── MexicanHatJourney.tsx
│   │       ├── SOMJourney.tsx
│   │       └── HammingJourney.tsx
│   ├── App.tsx             # React Router routing configuration
│   └── index.css           # Tailwind design tokens & dark void aesthetics
├── tailwind.config.js      # Model-specific color tokens (amber, emerald, indigo, rose)
├── vite.config.ts          # Vite & Vitest configuration
├── tsconfig.json           # TypeScript project settings
└── package.json            # Dependencies & build scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.11+ or v22+
- **npm**: v10+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/neural-odyssey.git
cd neural-odyssey

# Install dependencies
npm install
```

### Development Server

```bash
# Start local development server with Hot Module Replacement
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Running Automated Mathematical Unit Tests

```bash
# Run Vitest test suite across all 4 math engines
npm test
```

All 86 test cases verify hand-calculated numerical steps, boundary clamping, parameter constraints, tie conditions, and deterministic reproducibility.

### Production Build

```bash
# Compile TypeScript and generate minified production bundles
npm run build

# Preview production build locally
npm run preview
```

---

## 📐 Mathematical Engines Overview

| Architecture | Governing Equation | Primary Constraints | File Location |
| :--- | :--- | :--- | :--- |
| **MAXNET** | $a_i(t+1) = \max\left(0, a_i(t) - \varepsilon \sum_{j \ne i} a_j(t)\right)$ | $0 < \varepsilon < \frac{1}{m}$ | [`src/lib/math/maxnet.ts`](file:///d:/FCAI/master/src/lib/math/maxnet.ts) |
| **Mexican Hat** | $h(r) = A_e e^{-r^2 / 2\sigma_e^2} - A_i e^{-r^2 / 2\sigma_i^2}$ | $\sigma_i > \sigma_e, \, A_e > A_i$ | [`src/lib/math/mexican-hat.ts`](file:///d:/FCAI/master/src/lib/math/mexican-hat.ts) |
| **SOM (Kohonen)** | $w_i(t+1) = w_i(t) + \eta(t) h_{ci}(t) [x - w_i(t)]$ | Monotonic $\eta(t), \sigma(t)$ decay | [`src/lib/math/som.ts`](file:///d:/FCAI/master/src/lib/math/som.ts) |
| **Hamming Network**| $d_H(x, p) = \sum \mathbf{1}[x_k \ne p_k], \, s = n - d_H$ | Binary $\{0, 1\}$ or Bipolar $\{-1, +1\}$ | [`src/lib/math/hamming.ts`](file:///d:/FCAI/master/src/lib/math/hamming.ts) |

---

## 🤖 Connecting a Live AI Provider to the Tutor

The AI Tutor (`src/pages/TutorPage.tsx`) operates out-of-the-box using a **curated, hallucination-free knowledge base** for common technical inquiries.

To attach a live Large Language Model (e.g. Google Gemini or OpenAI):

1. Set the following environment variable in a `.env.local` file:
   ```env
   VITE_AI_PROVIDER=gemini # or "openai"
   VITE_AI_API_KEY=your_api_key_here
   ```
2. The tutor will route open-ended questions through the provider while preserving verified grounding instructions.
3. If no key is set, the tutor automatically displays verified literature answers with zero broken states.

---

## ⚠️ Scientifically Important Caveats & Limitations

1. **MAXNET Ties**: In deterministic symmetric implementations, identical maximum activations decay at the exact same rate until both reach zero. Ties must be handled through random perturbation or explicit tie-breaking registers.
2. **Static vs. Dynamic Mexican Hat**: A Difference of Gaussians is a spatial interaction kernel. It does not constitute a self-contained neural network unless paired with a differential activation update law (such as Amari neural fields).
3. **SOM Topology**: If the initial neighborhood radius $\sigma_0$ is chosen too small relative to the grid dimensions, the map can develop topological knots (folds) that cannot untangle in later epochs.
4. **Continuous Embeddings**: Classical Hamming networks cannot process floating-point continuous embeddings (e.g., modern BERT/CLIP vectors) without lossy binarization or Locality Sensitive Hashing.

---

## 📚 Key References

- **Lippmann, R. P. (1987).** *An Introduction to Computing with Neural Nets.* IEEE ASSP Magazine, 4(4), 4–22.
- **Kohonen, T. (1982).** *Self-Organized Formation of Topologically Correct Feature Maps.* Biological Cybernetics, 43(1), 59–69.
- **Fausett, L. V. (1994).** *Fundamentals of Neural Networks: Architectures, Algorithms, and Applications.* Prentice-Hall.
- **Marr, D., & Hildreth, E. (1980).** *Theory of Edge Detection.* Proc. R. Soc. Lond. B, 207(1167), 187–217.
- **Hamming, R. W. (1950).** *Error Detecting and Error Correcting Codes.* Bell System Tech. J., 29(2), 147–160.

---

## 📄 License

This educational platform is released under the **MIT License**.
