"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  delay: number;
  active: boolean;
  frame: number;
}

export default function HeartParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Spawn particles periodically
    const spawnInterval = setInterval(() => {
      if (particlesRef.current.length > 18) return;
      particlesRef.current.push({
        x:       Math.random() * window.innerWidth,
        y:       window.innerHeight + 20,
        size:    8 + Math.random() * 16,
        speed:   0.4 + Math.random() * 0.6,
        opacity: 0.15 + Math.random() * 0.35,
        drift:   (Math.random() - 0.5) * 0.5,
        delay:   0,
        active:  true,
        frame:   0,
      });
    }, 1800);

    const drawHeart = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      opacity: number
    ) => {
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#f0a0b8";
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      ctx.bezierCurveTo(x, y, x - size, y, x - size, y + size * 0.4);
      ctx.bezierCurveTo(x - size, y + size * 0.8, x, y + size * 1.1, x, y + size * 1.3);
      ctx.bezierCurveTo(x, y + size * 1.1, x + size, y + size * 0.8, x + size, y + size * 0.4);
      ctx.bezierCurveTo(x + size, y, x, y, x, y + size * 0.3);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter((p) => {
        p.y      -= p.speed;
        p.x      += p.drift;
        p.frame  += 1;
        p.opacity = p.opacity * (1 - p.frame / 3000);
        drawHeart(ctx, p.x, p.y, p.size, p.opacity);
        return p.y > -50 && p.opacity > 0.01;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(spawnInterval);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}