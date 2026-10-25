import { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface TeXProps {
  tex: string;
  display?: boolean;
  className?: string;
}

export function TeX({ tex, display = false, className = '' }: TeXProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      try {
        katex.render(tex, ref.current, {
          displayMode: display,
          throwOnError: false,
          trust: true,
          strict: false,
        });
      } catch (e) {
        if (ref.current) {
          ref.current.textContent = tex;
        }
      }
    }
  }, [tex, display]);

  return (
    <span
      ref={ref}
      className={`${display ? 'equation-block' : 'inline-block align-middle'} ${className}`}
    />
  );
}

export { TeX as Formula, TeX as MathView };

interface EquationBlockProps {
  tex: string;
  label?: string;
  description?: string;
  className?: string;
}

export function EquationBlock({ tex, label, description, className = '' }: EquationBlockProps) {
  return (
    <div className={`my-6 ${className}`}>
      {label && (
        <div className="text-text-muted text-xs font-mono mb-2 uppercase tracking-wider">{label}</div>
      )}
      <div className="equation-block">
        <TeX tex={tex} display />
      </div>
      {description && (
        <p className="text-text-secondary text-sm mt-2 text-center">{description}</p>
      )}
    </div>
  );
}
