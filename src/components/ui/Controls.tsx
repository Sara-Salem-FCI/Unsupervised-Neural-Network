import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, Play, Pause, RotateCcw, SkipForward, Info } from 'lucide-react';

interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  description?: string;
  unit?: string;
  color?: string;
}

export function SliderControl({ label, value, min, max, step, onChange, description, unit, color = 'indigo' }: SliderControlProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-text-secondary text-sm font-medium">{label}</label>
        <span className={`text-sm font-mono font-semibold text-${color}-400`}>
          {value.toFixed(step < 1 ? Math.max(1, -Math.floor(Math.log10(step))) : 0)}{unit || ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="control-slider w-full"
      />
      {description && <p className="text-text-dim text-xs">{description}</p>}
    </div>
  );
}

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  iteration?: number;
  maxIteration?: number;
  disabled?: boolean;
}

export function PlaybackControls({ isPlaying, onPlay, onPause, onStep, onReset, iteration, maxIteration, disabled }: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={onStep}
        disabled={disabled || isPlaying}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed text-text-secondary text-sm font-medium transition-colors"
        aria-label="Step forward"
      >
        <SkipForward className="w-4 h-4" />
        Step
      </button>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-text-secondary text-sm font-medium transition-colors"
        aria-label="Reset"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
      {iteration !== undefined && (
        <span className="ml-2 text-text-muted text-sm font-mono">
          Step {iteration}{maxIteration ? ` / ${maxIteration}` : ''}
        </span>
      )}
    </div>
  );
}

interface CollapsibleProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  icon?: ReactNode;
}

export function Collapsible({ title, children, defaultOpen = false, icon }: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-text-primary font-medium">{title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

interface InfoBoxProps {
  children: ReactNode;
  type?: 'info' | 'warning' | 'tip' | 'important';
  title?: string;
}

export function InfoBox({ children, type = 'info', title }: InfoBoxProps) {
  const styles = {
    info: 'border-indigo-500/30 bg-indigo-500/5',
    warning: 'border-amber-500/30 bg-amber-500/5',
    tip: 'border-emerald-500/30 bg-emerald-500/5',
    important: 'border-rose-500/30 bg-rose-500/5',
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    tip: '✨',
    important: '🔑',
  };

  return (
    <div className={`rounded-xl border-l-4 p-4 my-4 ${styles[type]}`}>
      {title && (
        <div className="flex items-center gap-2 mb-2">
          <span>{icons[type]}</span>
          <span className="text-text-primary font-semibold text-sm">{title}</span>
        </div>
      )}
      <div className="text-text-secondary text-sm leading-relaxed">{children}</div>
    </div>
  );
}

interface TabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-1 p-1 bg-void-200 rounded-xl ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-white/10 text-white shadow-sm'
              : 'text-text-muted hover:text-text-secondary hover:bg-white/5'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
