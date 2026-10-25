import { Link } from 'react-router-dom';
import { Brain, Github, BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-void-300 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-text-primary">Neural Odyssey</span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              An interactive journey through unsupervised neural networks. 
              Research-backed, mathematically rigorous, visually immersive.
            </p>
          </div>

          {/* Models */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Models</h4>
            <ul className="space-y-2">
              <li><Link to="/models/maxnet" className="text-text-muted text-sm hover:text-maxnet transition-colors">MAXNET</Link></li>
              <li><Link to="/models/mexican-hat" className="text-text-muted text-sm hover:text-mexhat transition-colors">Mexican Hat</Link></li>
              <li><Link to="/models/som" className="text-text-muted text-sm hover:text-som transition-colors">Self-Organizing Maps</Link></li>
              <li><Link to="/models/hamming" className="text-text-muted text-sm hover:text-hamming transition-colors">Hamming Networks</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Learn</h4>
            <ul className="space-y-2">
              <li><Link to="/foundations" className="text-text-muted text-sm hover:text-white transition-colors">Foundations</Link></li>
              <li><Link to="/discover" className="text-text-muted text-sm hover:text-white transition-colors">Discovery Questions</Link></li>
              <li><Link to="/challenges" className="text-text-muted text-sm hover:text-white transition-colors">Challenge Lab</Link></li>
              <li><Link to="/research" className="text-text-muted text-sm hover:text-white transition-colors">Research Library</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-text-primary font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/tutor" className="text-text-muted text-sm hover:text-white transition-colors">AI Tutor</Link></li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-text-muted text-sm hover:text-white transition-colors flex items-center gap-1">
                  <Github className="w-3.5 h-3.5" /> Source Code
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="section-divider !my-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-dim text-xs">
            © {new Date().getFullYear()} Neural Odyssey — An educational project. 
            All mathematical content is research-backed and cited.
          </p>
          <div className="flex items-center gap-1 text-text-dim text-xs">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Built for learning, not for production deployment of these classical networks.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
