import React, { useEffect, useRef } from 'react';
import { Particle } from '../types';

interface ParticleEffectProps {
  particles: Particle[];
  emoji: string;
  onComplete: () => void;
}

const ParticleEffect: React.FC<ParticleEffectProps> = ({ particles, emoji, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Используем useRef для хранения состояния частиц, чтобы избежать ре-рендеров React
  const particlesRef = useRef(particles.map(p => ({ ...p })));
  const requestRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Обработка Retina дисплеев (iPhone) для четкости
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Устанавливаем реальный размер буфера
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Масштабируем контекст
    ctx.scale(dpr, dpr);

    // Конвертируем проценты координат в пиксели для отрисовки
    // x и y приходят в диапазоне 0-100 (проценты от ширины/высоты контейнера)
    const width = rect.width;
    const height = rect.height;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const duration = 800;
      const progress = elapsed / duration;

      if (progress >= 1) {
        onComplete();
        return;
      }

      // Очистка холста
      ctx.clearRect(0, 0, width, height);

      // Обновление и отрисовка каждой частицы
      particlesRef.current.forEach(p => {
        // Физика
        const drag = 0.95;
        const gravity = 0.2;
        
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= drag;
        p.vy = (p.vy * drag) + gravity;
        p.rotation += p.vr;
        
        const currentLife = 1 - progress;

        // Отрисовка
        ctx.save();
        
        // Преобразуем координаты из процентов (как они были в App.tsx) в пиксели
        // Изначально логика была заточена под absolute positioning в процентах
        // Но для canvas нам нужны пиксели внутри canvas
        // Координаты в types.ts задаются относительно центра плитки в процентах?
        // В App.tsx: centerX = (c * 12.5) + 6.25 (это проценты 0-100)
        
        const pixelX = (p.x / 100) * width;
        const pixelY = (p.y / 100) * height;

        ctx.translate(pixelX, pixelY);
        ctx.rotate((p.rotation * Math.PI) / 180);
        
        const size = p.size; // Размер в пикселях
        const scale = currentLife + 0.3;
        
        ctx.globalAlpha = currentLife;
        ctx.fillStyle = p.color;
        
        // Рисуем квадрат ("пиксель")
        ctx.fillRect(-size * scale / 2, -size * scale / 2, size * scale, size * scale);
        
        ctx.restore();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Пустой массив зависимостей, эффект запускается один раз при маунте

  return (
    <canvas 
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-40 w-full h-full"
    />
  );
};

export default ParticleEffect;