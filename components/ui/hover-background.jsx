'use client';

import * as React from 'react';
import { motion, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';

function HoverBackground({
  className,
  objectCount = 12,
  children,
  colors = {},
  ...props
}) {
  const {
    background = 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    objects = [
      'bg-blue-500/20',
      'bg-purple-500/20',
      'bg-pink-500/20',
      'bg-cyan-500/20',
      'bg-emerald-500/20',
      'bg-yellow-500/20',
    ],
  } = colors;

  const [isHovered, setIsHovered] = React.useState(false);
  const [mouseX, setMouseX] = React.useState(0);
  const [mouseY, setMouseY] = React.useState(0);

  const springX = useSpring(mouseX, {
    stiffness: 300,
    damping: 30,
    restSpeed: 0.1,
    restDelta: 0.1,
  });
  const springY = useSpring(mouseY, {
    stiffness: 300,
    damping: 30,
    restSpeed: 0.1,
    restDelta: 0.1,
  });

  // Use state to store animated objects to avoid hydration mismatch
  const [animatedObjects, setAnimatedObjects] = React.useState([]);

  // Generate animated objects after mount to avoid hydration issues
  React.useEffect(() => {
    const generateObjects = () =>
      Array.from({ length: objectCount }, (_, i) => {
        const shape = Math.random() > 0.5 ? 'circle' : 'square';
        return {
          id: i,
          x: Math.random() * 90 + 5, // 5-95% to avoid edges
          y: Math.random() * 90 + 5,
          size: Math.random() * 60 + 20, // 20-80px
          color: objects[i % objects.length],
          delay: Math.random() * 2,
          shape,
          floatDirection: Math.random() > 0.5 ? 1 : -1,
          breathDuration: Math.random() * 3 + 3, // 3-6 seconds
          parallaxStrength: Math.random() * 0.5 + 0.3, // 0.3-0.8 for more varied parallax depth
          baseRotation: Math.random() * 360, // Random starting rotation offset
        };
      });

    setAnimatedObjects(generateObjects());
  }, [objectCount, objects]);

  const handleMouseMove = (event) => {
    if (!isHovered) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate mouse position relative to center (-1 to 1)
    const x = (event.clientX - rect.left - centerX) / centerX;
    const y = (event.clientY - rect.top - centerY) / centerY;

    setMouseX(x * 15); // Slightly reduced parallax range
    setMouseY(y * 15);
  };

  const handleHoverStart = () => {
    setIsHovered(true);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    // Smooth return to center
    setMouseX(0);
    setMouseY(0);
  };

  return (
    <motion.div
      data-slot="hover-background"
      className={cn(
        'relative size-full overflow-hidden',
        background,
        className,
      )}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      onMouseMove={handleMouseMove}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      style={{
        backgroundSize: '200% 200%',
      }}
      {...props}
    >
      {/* Subtle ambient glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Animated Objects */}
      {animatedObjects.map((obj) => (
        <motion.div
          key={obj.id}
          className={cn(
            'absolute backdrop-blur-sm border border-white/10',
            obj.color,
            obj.shape === 'circle' ? 'rounded-full' : 'rounded-lg rotate-45',
          )}
          style={{
            width: obj.size,
            height: obj.size,
            left: `${obj.x}%`,
            top: `${obj.y}%`,
            transform: `translate(-50%, -50%) rotate(${obj.baseRotation}deg)`,
          }}
          animate={{
            y: [0, obj.floatDirection * 20, 0],
            rotate: [obj.baseRotation, obj.baseRotation + 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: obj.breathDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: obj.delay,
          }}
          whileHover={{
            scale: 1.2,
            transition: { duration: 0.2 },
          }}
        />
      ))}

      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export { HoverBackground };
