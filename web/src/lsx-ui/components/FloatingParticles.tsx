import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export type FloatingParticlesProps = {
  icons?: React.ReactNode[];
  particleCount?: number;
  color?: string;
  size?: number;
  speed?: 'slow' | 'medium' | 'fast';
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  mouseRepelDistance?: number;
  mouseRepelStrength?: number;
  backgroundColor?: string;
}

export type ParticleState = {
  id: number;
  baseX: number;
  baseY: number;
  currentX: number;
  currentY: number;
  icon: React.ReactNode | null;
  animationDuration: number;
}



export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  icons = [],
  particleCount = 55,
  color = '#00a552ff',
  size = 32,
  speed = 'slow',
  opacity = 0.3,
  style = {},
  mouseRepelDistance = 150,
  mouseRepelStrength = 50,
  backgroundColor = 'transparent',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<ParticleState[]>([]);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const durationMap = {
    slow: { base: 10, variance: 10 },
    medium: { base: 2, variance: 2},
    fast: { base: 4, variance: 2 },
  };

  const duration = durationMap[speed];

  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();

    const newParticles: ParticleState[] = [...Array(particleCount)].map((_, i) => {
      const seedX = i * 123.456;
      const seedY = i * 789.012;
      const seedDuration = i * 345.678;
      
      const baseX = seededRandom(seedX) * bounds.width;
      const baseY = seededRandom(seedY) * bounds.height;
      
      return {
        id: i,
        baseX,
        baseY,
        currentX: baseX,
        currentY: baseY,
        icon: icons.length > 0 ? icons[i % icons.length] : null,
        animationDuration: duration.base + seededRandom(seedDuration) * duration.variance,
      };
    });

    setParticles(newParticles);
  }, [particleCount, icons.length, duration.base, duration.variance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const bounds = containerRef.current!.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      
      mouseX.set(x);
      mouseY.set(y);

      setParticles(prevParticles => 
        prevParticles.map(particle => {
          const dx = x - particle.baseX;
          const dy = y - particle.baseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRepelDistance && distance > 0) {
            const force = (mouseRepelDistance - distance) / mouseRepelDistance;
            const repelX = (dx / distance) * force * mouseRepelStrength * -1;
            const repelY = (dy / distance) * force * mouseRepelStrength * -1;

            return {
              ...particle,
              currentX: particle.baseX + repelX,
              currentY: particle.baseY + repelY,
            };
          } else {
            return {
              ...particle,
              currentX: particle.baseX,
              currentY: particle.baseY,
            };
          }
        })
      );
    };

    const handleMouseLeave = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => ({
          ...particle,
          currentX: particle.baseX,
          currentY: particle.baseY,
        }))
      );
    };

    const container = containerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, mouseRepelDistance, mouseRepelStrength]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      
      const bounds = containerRef.current.getBoundingClientRect();
      
      setParticles(prevParticles =>
        prevParticles.map((particle, i) => {
          const seedX = i * 123.456 + bounds.width;
          const seedY = i * 789.012 + bounds.height;
          
          const newBaseX = seededRandom(seedX) * bounds.width;
          const newBaseY = seededRandom(seedY) * bounds.height;
          
          return {
            ...particle,
            baseX: newBaseX,
            baseY: newBaseY,
            currentX: newBaseX,
            currentY: newBaseY,
          };
        })
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'absolute',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        zIndex: -1,
      
        backgroundColor,
        ...style,
      }}
    >
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              color,
              opacity,
              left: 0,
              top: 0,
            }}
            animate={{
              x: particle.currentX,
              y: particle.currentY,
              scale: [0.8, 1.1, 0.8],
              opacity: [opacity * 0.5, opacity, opacity * 0.5],
              // random rotate between 0 and 360 so that not all particles rotate the same
              rotate: particle.id % 2 === 0 ? [0, 360] : [360, 0],
            }}
            transition={{
              x: { type: "spring", stiffness: 150, damping: 20 },
              y: { type: "spring", stiffness: 150, damping: 20 },
              rotate: {
                duration: particle.animationDuration,
                repeat: Infinity,
                ease: 'linear',
                
              },
              scale: {
                duration: particle.animationDuration,
                repeat: Infinity,
                delay: seededRandom(particle.id * 111.222) * 5,
                ease: 'easeInOut',
              },
              opacity: {
                duration: particle.animationDuration,
                repeat: Infinity,
                delay: seededRandom(particle.id * 333.444) * 5,
                ease: 'easeInOut',
              },
            }}
          >
            {particle.icon ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesomeIcon icon={particle.icon as any} style={{ width: '70%', height: '70%' }} />
              </div>
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

