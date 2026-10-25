import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Highlighter, ZoomIn, Copy, Check, Sparkles, X } from 'lucide-react';

interface LensPosition {
  x: number;
  y: number;
  text: string;
}

export function SelectionZoomLens() {
  const [lens, setLens] = useState<LensPosition | null>(null);
  const [copied, setCopied] = useState(false);
  const [isZoomedModalOpen, setIsZoomedModalOpen] = useState(false);
  const lensRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // If clicking inside the lens itself, do not close immediately
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText || selectedText.length < 2) {
        setLens(null);
        return;
      }

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          // Clamp x so it stays inside window bounds
          const centerX = rect.left + rect.width / 2;
          const clampedX = Math.max(160, Math.min(window.innerWidth - 160, centerX));
          // Place slightly above the selection, or below if near the top
          const posY = rect.top > 80 ? rect.top - 12 : rect.bottom + 50;

          setLens({
            x: clampedX,
            y: posY,
            text: selectedText,
          });
        }
      } catch {
        setLens(null);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // If clicking outside the lens, clear it
      if (lensRef.current && !lensRef.current.contains(e.target as Node)) {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          setLens(null);
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lens) return;
    navigator.clipboard.writeText(lens.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleAskTutor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lens) return;
    navigate(`/tutor?q=${encodeURIComponent(lens.text)}`);
    setLens(null);
  };

  const handleToggleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsZoomedModalOpen(!isZoomedModalOpen);
  };

  if (!lens) return null;

  // Short preview of text
  const previewText =
    lens.text.length > 55 ? lens.text.substring(0, 52) + '...' : lens.text;

  return (
    <>
      {/* Floating Zoom & Highlighter Pill */}
      <div
        ref={lensRef}
        style={{
          position: 'fixed',
          left: `${lens.x}px`,
          top: `${lens.y}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
        }}
        className="animate-zoom-lens select-none pointer-events-auto"
      >
        <div className="flex items-center gap-2 p-1.5 pl-3 pr-2 rounded-2xl bg-void-500/95 backdrop-blur-xl border border-yellow-400/40 shadow-[0_0_30px_rgba(250,204,21,0.35)] text-text-primary text-xs">
          {/* Highlighter Indicator Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 font-black tracking-wide shadow-sm shadow-yellow-400/30">
            <Highlighter className="w-3.5 h-3.5 animate-bounce" />
            <span className="text-[11px] uppercase">Highlighted</span>
          </div>

          {/* Zoomed Text Snippet Preview */}
          <button
            onClick={handleToggleZoom}
            title="Click to view full zoomed text"
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-void-200/80 hover:bg-yellow-400/10 hover:border-yellow-400/30 border border-transparent transition-all max-w-[220px] text-left group"
          >
            <ZoomIn className="w-3.5 h-3.5 text-yellow-400 shrink-0 group-hover:scale-125 transition-transform" />
            <span className="truncate text-yellow-200 font-semibold text-xs tracking-tight group-hover:text-yellow-100">
              "{previewText}"
            </span>
          </button>

          {/* Quick Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy highlighted text"
            className="p-1.5 rounded-lg bg-void-200 hover:bg-white/10 text-text-secondary hover:text-white transition-all active:scale-90"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Ask AI Tutor */}
          <button
            onClick={handleAskTutor}
            title="Ask AI Tutor about this selection"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600/80 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Ask Tutor</span>
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setLens(null)}
            className="p-1 text-text-dim hover:text-white rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Expanded Zoom-In Modal (when user clicks Zoom or wants extra large view) */}
      {isZoomedModalOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsZoomedModalOpen(false)}
        >
          <div
            className="relative max-w-xl w-full p-6 rounded-3xl bg-void-500 border-2 border-yellow-400/60 shadow-[0_0_60px_rgba(250,204,21,0.3)] animate-zoom-lens"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-300">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Magnified Text View
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-yellow-400 text-slate-950 font-black">
                      ZOOMED IN
                    </span>
                  </h3>
                  <p className="text-[11px] text-text-dim">
                    Highlighter selection magnified for clear reading
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsZoomedModalOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Magnified Text Body */}
            <div className="p-5 rounded-2xl bg-void-300/80 border border-yellow-400/20 text-lg sm:text-2xl font-bold leading-relaxed text-yellow-200 shadow-inner select-text">
              <mark className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                {lens.text}
              </mark>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-white/10">
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-xl bg-void-200 hover:bg-white/10 text-xs font-semibold text-text-secondary hover:text-white flex items-center gap-2 transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handleAskTutor}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ask AI Tutor About This</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}