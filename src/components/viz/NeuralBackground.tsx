import { useEffect, useRef, useCallback } from 'react';

interface Neuron {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  activation: number;
  targetActivation: number;
  hue: number;
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const neuronsRef = useRef<Neuron[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const prefersReducedMotion = typeof window !== 'undefined' 
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const init = useCallback((canvas: HTMLCanvasElement) => {
    const count = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));
    const neurons: Neuron[] = [];

    for (let i = 0; i < count; i++) {
      neurons.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 2 + Math.random() * 3,
        activation: Math.random() * 0.5,
        targetActivation: Math.random() * 0.5,
        hue: 220 + Math.random() * 60, // indigo to purple range
      });
    }

    neuronsRef.current = neurons;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (neuronsRef.current.length === 0) {
        init(canvas);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouse);

    if (prefersReducedMotion) {
      // Static render for reduced motion
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const neurons = neuronsRef.current;
      neurons.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue}, 70%, 60%, 0.3)`;
        ctx.fill();
      });
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMouse);
      };
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const neurons = neuronsRef.current;
      const mouse = mouseRef.current;
      const connectionDistance = 150;

      // Update neurons
      for (const n of neurons) {
        // Move
        n.x += n.vx;
        n.y += n.vy;

        // Bounce off walls
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // Mouse interaction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          n.targetActivation = 1 - dist / 200;
        } else {
          n.targetActivation = 0.15 + Math.sin(Date.now() * 0.001 + n.x * 0.01) * 0.1;
        }

        // Smooth activation transition
        n.activation += (n.targetActivation - n.activation) * 0.05;
      }

      // Draw connections
      for (let i = 0; i < neurons.length; i++) {
        for (let j = i + 1; j < neurons.length; j++) {
          const dx = neurons[i].x - neurons[j].x;
          const dy = neurons[i].y - neurons[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.15 * Math.max(neurons[i].activation, neurons[j].activation);
            ctx.beginPath();
            ctx.moveTo(neurons[i].x, neurons[i].y);
            ctx.lineTo(neurons[j].x, neurons[j].y);
            ctx.strokeStyle = `hsla(230, 70%, 60%, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw neurons
      for (const n of neurons) {
        // Glow
        const glowRadius = n.radius * 4 * n.activation;
        if (glowRadius > 0.5) {
          const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowRadius);
          gradient.addColorStop(0, `hsla(${n.hue}, 80%, 60%, ${n.activation * 0.4})`);
          gradient.addColorStop(1, 'hsla(0, 0%, 0%, 0)');
          ctx.beginPath();
          ctx.arc(n.x, n.y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * (0.8 + n.activation * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${n.hue}, 70%, ${50 + n.activation * 30}%, ${0.4 + n.activation * 0.6})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [init, prefersReducedMotion]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-void/30 via-transparent to-void" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/50 via-transparent to-void/50" />
    </div>
  );
}
