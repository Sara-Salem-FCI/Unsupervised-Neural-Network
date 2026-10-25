import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function Section({ children, className = '', id }: SectionProps) {
  return (
    <section id={id} className={`py-16 md:py-24 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: string;
  className?: string;
}

export function SectionHeader({ title, subtitle, badge, badgeColor = 'from-indigo-500 to-purple-500', className = '' }: SectionHeaderProps) {
  return (
    <div className={`mb-12 ${className}`}>
      {badge && (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${badgeColor} bg-opacity-10 border border-white/10 mb-4`}>
          <span className={`text-xs font-semibold bg-gradient-to-r ${badgeColor} bg-clip-text text-transparent uppercase tracking-wider`}>{badge}</span>
        </div>
      )}
      <h2 className="text-title font-bold text-text-primary">{title}</h2>
      {subtitle && (
        <p className="text-text-secondary text-lg mt-3 max-w-3xl">{subtitle}</p>
      )}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: 'maxnet' | 'mexhat' | 'som' | 'hamming';
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glow, onClick }: CardProps) {
  const glowClass = glow ? `glow-${glow}` : '';
  const baseClass = hover ? 'glass-card-hover cursor-pointer' : 'glass-card';

  return (
    <div
      className={`${baseClass} ${glowClass} p-6 ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {children}
    </div>
  );
}
