import { useState } from 'react';
import { Section, SectionHeader, Card } from '../components/ui/Section';
import { Library, ExternalLink, BookOpen, Search, Filter } from 'lucide-react';

interface ReferenceEntry {
  id: string;
  category: 'Foundational Paper' | 'Academic Textbook' | 'Engineering Application' | 'Neuroscience';
  model: 'MAXNET' | 'Mexican Hat' | 'Self-Organizing Maps' | 'Hamming Networks' | 'General Theory';
  title: string;
  authors: string;
  year: number;
  publication: string;
  doiOrUrl: string;
  annotation: string;
  keyClaimSupported: string;
}

const bibliography: ReferenceEntry[] = [
  {
    id: 'lippmann-1987',
    category: 'Foundational Paper',
    model: 'Hamming Networks',
    title: 'An Introduction to Computing with Neural Nets',
    authors: 'Richard P. Lippmann',
    year: 1987,
    publication: 'IEEE ASSP Magazine, 4(4), 4–22',
    doiOrUrl: 'https://doi.org/10.1109/MASSP.1987.1165576',
    annotation:
      'Seminal tutorial paper that synthesized classical neural computing, introducing the two-stage Hamming network architecture that combines linear prototype scoring with a MAXNET competitive stage.',
    keyClaimSupported:
      'Defines the canonical Hamming Network architecture and MAXNET winner-takes-all competitive update law.',
  },
  {
    id: 'fausett-1994',
    category: 'Academic Textbook',
    model: 'MAXNET',
    title: 'Fundamentals of Neural Networks: Architectures, Algorithms, and Applications',
    authors: 'Laurene V. Fausett',
    year: 1994,
    publication: 'Prentice-Hall, Inc., Englewood Cliffs, NJ',
    doiOrUrl: 'https://books.google.com/books?id=bKkQAQAAIAAJ',
    annotation:
      'The authoritative textbook reference detailing step-by-step algorithms, worked numerical examples, and convergence bounds for MAXNET, Mexican Hat networks, and Kohonen maps.',
    keyClaimSupported:
      'Proves the stability constraint 0 < ε < 1/m for MAXNET and provides hand-verifiable worked numerical steps.',
  },
  {
    id: 'kohonen-1982',
    category: 'Foundational Paper',
    model: 'Self-Organizing Maps',
    title: 'Self-Organized Formation of Topologically Correct Feature Maps',
    authors: 'Teuvo Kohonen',
    year: 1982,
    publication: 'Biological Cybernetics, 43(1), 59–69',
    doiOrUrl: 'https://doi.org/10.1007/BF00337288',
    annotation:
      'The seminal paper introducing Self-Organizing Maps (SOM). Demonstrates how a simple competitive learning rule combined with spatial neighborhood interactions preserves continuous topology.',
    keyClaimSupported:
      'Formulates the Best Matching Unit (BMU) selection rule and the cooperative neighborhood weight update law.',
  },
  {
    id: 'kohonen-1990',
    category: 'Foundational Paper',
    model: 'Self-Organizing Maps',
    title: 'The Self-Organizing Map',
    authors: 'Teuvo Kohonen',
    year: 1990,
    publication: 'Proceedings of the IEEE, 78(9), 1464–1480',
    doiOrUrl: 'https://doi.org/10.1109/5.58325',
    annotation:
      'Comprehensive review covering mathematical proofs of convergence, optimal learning rate schedules, vector quantization relationships, and early speech phoneme recognition applications.',
    keyClaimSupported:
      'Distinguishes SOM from standard clustering and establishes the mathematical necessity of decaying learning rates.',
  },
  {
    id: 'marr-hildreth-1980',
    category: 'Foundational Paper',
    model: 'Mexican Hat',
    title: 'Theory of Edge Detection',
    authors: 'David Marr & Ellen Hildreth',
    year: 1980,
    publication: 'Proceedings of the Royal Society of London. Series B. Biological Sciences, 207(1167), 187–217',
    doiOrUrl: 'https://doi.org/10.1098/rspb.1980.0020',
    annotation:
      'Foundational paper in computational vision demonstrating that the Laplacian of a 2D Gaussian filter (LoG) is closely approximated by a Difference of Gaussians (Mexican Hat profile), isolating intensity zero-crossings.',
    keyClaimSupported:
      'Establishes the mathematical equivalence between Mexican Hat spatial interaction and optimal edge filtering.',
  },
  {
    id: 'amari-1977',
    category: 'Neuroscience',
    model: 'Mexican Hat',
    title: 'Dynamics of Pattern Formation in Lateral-Inhibition Type Neural Fields',
    authors: 'Shun-ichi Amari',
    year: 1977,
    publication: 'Biological Cybernetics, 27(2), 77–87',
    doiOrUrl: 'https://doi.org/10.1007/BF00337259',
    annotation:
      'Rigorous mathematical formulation of continuous neural field dynamics where spatial coupling is governed by Mexican Hat interaction kernels, proving the emergence of solitary localized activity bumps.',
    keyClaimSupported:
      'Proves that local excitation with surround inhibition generates persistent localized activity bubbles in continuous neural sheets.',
  },
  {
    id: 'hamming-1950',
    category: 'Foundational Paper',
    model: 'Hamming Networks',
    title: 'Error Detecting and Error Correcting Codes',
    authors: 'Richard W. Hamming',
    year: 1950,
    publication: 'Bell System Technical Journal, 29(2), 147–160',
    doiOrUrl: 'https://doi.org/10.1002/j.1538-7305.1950.tb00463.x',
    annotation:
      'Foundational information theory paper that formalized the Hamming distance metric for binary codewords, defining minimum-distance decoding.',
    keyClaimSupported:
      'Formalizes the metric d_H(x, p) as the count of differing coordinates between two binary strings.',
  },
  {
    id: 'daugman-1993',
    category: 'Engineering Application',
    model: 'Hamming Networks',
    title: 'High Confidence Visual Recognition of Persons by a Test of Statistical Independence',
    authors: 'John G. Daugman',
    year: 1993,
    publication: 'IEEE Transactions on Pattern Analysis and Machine Intelligence, 15(11), 1148–1161',
    doiOrUrl: 'https://doi.org/10.1109/34.244676',
    annotation:
      'Seminal biometric engineering paper detailing the extraction of 2,048-bit binary iris codes and real-time identification via fractional Hamming distance matching.',
    keyClaimSupported:
      'Documents a real-world industrial application of binary Hamming distance comparison for large-scale biometric lookup.',
  },
  {
    id: 'optical-maxnet-1992',
    category: 'Engineering Application',
    model: 'MAXNET',
    title: 'Optical Implementation of a Winner-Take-All Neural Network',
    authors: 'T. Lu, F. T. S. Yu, & D. A. Gregory',
    year: 1992,
    publication: 'Applied Optics, 31(20), 3999–4005',
    doiOrUrl: 'https://doi.org/10.1364/AO.31.003999',
    annotation:
      'Demonstrates physical analog optical fabrication of MAXNET using liquid-crystal spatial light modulators and photorefractive feedback for sub-nanosecond winner selection.',
    keyClaimSupported:
      'Confirms documented physical hardware implementations of MAXNET in analog optical computing.',
  },
  {
    id: 'tamayo-1999',
    category: 'Engineering Application',
    model: 'Self-Organizing Maps',
    title: 'Interpreting Patterns of Gene Expression with Self-Organizing Maps: Methods and Application to Hematopoietic Differentiation',
    authors: 'P. Tamayo, D. Slonim, J. Mesirov, et al.',
    year: 1999,
    publication: 'Proceedings of the National Academy of Sciences (PNAS), 96(6), 2907–2912',
    doiOrUrl: 'https://doi.org/10.1073/pnas.96.6.2907',
    annotation:
      'Seminal computational biology paper establishing SOM as an authoritative tool for clustering high-dimensional genomic microarrays and transcriptomic gene expression profiles.',
    keyClaimSupported:
      'Provides empirical proof of SOM for high-dimensional biological data visualization without human diagnostic labels.',
  },
];

export function ResearchLibrary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filteredEntries = bibliography.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.annotation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keyClaimSupported.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModel = selectedModel === 'All' || item.model === selectedModel;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesModel && matchesCategory;
  });

  return (
    <div className="pt-20">
      {/* Hero Header */}
      <Section className="bg-void-300 border-b border-white/5">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-500/10 mb-4">
            <Library className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              Primary Research & Bibliography
            </span>
          </div>
          <h1 className="text-title font-bold text-text-primary mb-4">
            Research Library & Citation Index
          </h1>
          <p className="text-text-secondary text-lg leading-relaxed">
            Every equation, architecture, parameter constraint, and historical claim on Neural Odyssey
            is traceable to authoritative, peer-reviewed literature. Browse our curated bibliography with DOI links.
          </p>
        </div>
      </Section>

      {/* Filter and Search Bar */}
      <Section className="pb-6">
        <div className="p-6 glass-card border-white/10 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 text-text-dim absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Search by author, title, or claim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-void-200 border border-white/10 rounded-xl text-xs text-text-primary placeholder:text-text-dim focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2.5 bg-void-200 border border-white/10 rounded-xl text-xs text-text-secondary focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Architectures</option>
                <option value="MAXNET">MAXNET</option>
                <option value="Mexican Hat">Mexican Hat</option>
                <option value="Self-Organizing Maps">Self-Organizing Maps</option>
                <option value="Hamming Networks">Hamming Networks</option>
              </select>
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-void-200 border border-white/10 rounded-xl text-xs text-text-secondary focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Publication Categories</option>
                <option value="Foundational Paper">Foundational Papers</option>
                <option value="Academic Textbook">Academic Textbooks</option>
                <option value="Engineering Application">Engineering Applications</option>
                <option value="Neuroscience">Neuroscience Literature</option>
              </select>
            </div>
          </div>
        </div>
      </Section>

      {/* Bibliography Entries */}
      <Section className="pt-0">
        <div className="space-y-4">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="p-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold uppercase">
                    {entry.model}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-text-muted border border-white/10">
                    {entry.category}
                  </span>
                </div>
                <span className="text-xs font-mono text-text-dim">{entry.year}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-text-primary leading-snug">
                  {entry.title}
                </h3>
                <p className="text-xs font-mono text-indigo-300 mt-0.5">
                  {entry.authors} ({entry.year}) — <em>{entry.publication}</em>
                </p>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                {entry.annotation}
              </p>

              <div className="p-3 rounded-lg bg-void-200 border border-white/5 text-xs">
                <span className="text-text-dim font-mono uppercase tracking-wider block mb-1">
                  Key Scientific Claim Supported:
                </span>
                <span className="text-text-primary italic">{entry.keyClaimSupported}</span>
              </div>

              <div className="pt-1 flex justify-end">
                <a
                  href={entry.doiOrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  View Publication / DOI Record <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </Card>
          ))}

          {filteredEntries.length === 0 && (
            <div className="text-center py-12 text-text-dim text-sm">
              No references matched your search filter.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
