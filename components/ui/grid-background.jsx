'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function GridBackground({
  className,
  children,
  gridSize = '8:8',
  colors = {},
  beams = {},
  ...props
}) {
  const {
    count = 3,
    colors: beamColors = ['bg-blue-500/50', 'bg-purple-500/50', 'bg-pink-500/50'],
    speed = 4,
  } = beams;

  const {
    background = 'bg-background',
    borderColor = 'border-border',
    borderSize = '1px',
    borderStyle = 'solid',
    shadow = 'shadow-lg',
  } = colors;

  // Parse grid dimensions
  const [cols, rows] = gridSize.split(':').map(Number);

  // Use state to store beam configurations to avoid hydration mismatch
  const [animatedBeams, setAnimatedBeams] = React.useState([]);

  // Generate beam configurations after mount to avoid hydration issues
  React.useEffect(() => {
    const generateBeams = () =>
      Array.from({ length: Math.min(count, 12) }, (_, i) => {
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        const startPosition = Math.random() > 0.5 ? 'start' : 'end';

        return {
          id: i,
          color: beamColors[i % beamColors.length],
          direction,
          startPosition,
          // For horizontal beams: choose a row index (1 to rows-1) - exclude edges
          // For vertical beams: choose a column index (1 to cols-1) - exclude edges
          gridLine:
            direction === 'horizontal'
              ? Math.floor(Math.random() * (rows - 1)) + 1
              : Math.floor(Math.random() * (cols - 1)) + 1,
          delay: Math.random() * 2,
          duration: speed + Math.random() * 2,
        };
      });

    setAnimatedBeams(generateBeams());
  }, [count, beamColors, speed, cols, rows]);

  const gridStyle = {
    '--border-style': borderStyle,
  };

  return (
    <motion.div
      data-slot="grid-background"
      className={cn(
        'relative size-full overflow-hidden',
        background,
        className,
      )}
      style={gridStyle}
      {...props}
    >
      {/* Grid Container */}
      <div
        className={cn('absolute inset-0 size-full', borderColor)}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          borderRightWidth: borderSize,
          borderBottomWidth: borderSize,
          borderRightStyle: borderStyle,
          borderBottomStyle: borderStyle,
        }}
      >
        {/* Grid Cells */}
        {Array.from({ length: cols * rows }).map((_, index) => (
          <div
            key={index}
            className={cn('relative', borderColor)}
            style={{
              borderTopWidth: borderSize,
              borderLeftWidth: borderSize,
              borderTopStyle: borderStyle,
              borderLeftStyle: borderStyle,
            }}
          />
        ))}
      </div>

      {/* Animated Beams */}
      {animatedBeams.map((beam) => {
        // Calculate exact grid line positions as percentages
        const horizontalPosition = (beam.gridLine / rows) * 100;
        const verticalPosition = (beam.gridLine / cols) * 100;

        return (
          <motion.div
            key={beam.id}
            className={cn(
              'absolute rounded-full backdrop-blur-sm z-20',
              beam.color,
              beam.direction === 'horizontal' ? 'w-6 h-0.5' : 'w-0.5 h-6',
              shadow,
            )}
            style={{
              ...(beam.direction === 'horizontal'
                ? {
                    // Position exactly on the horizontal grid line
                    top: `${horizontalPosition}%`,
                    left:
                      beam.startPosition === 'start'
                        ? '-12px'
                        : 'calc(100% + 12px)',
                    transform: 'translateY(-50%)', // Center on the line
                  }
                : {
                    // Position exactly on the vertical grid line
                    left: `${verticalPosition}%`,
                    top:
                      beam.startPosition === 'start'
                        ? '-12px'
                        : 'calc(100% + 12px)',
                    transform: 'translateX(-50%)', // Center on the line
                  }),
            }}
            animate={{
              ...(beam.direction === 'horizontal'
                ? {
                    x: beam.startPosition === 'start' ? 'calc(100vw + 24px)' : 'calc(-100vw - 24px)',
                  }
                : {
                    y: beam.startPosition === 'start' ? 'calc(100vh + 24px)' : 'calc(-100vh - 24px)',
                  }),
            }}
            transition={{
              duration: beam.duration,
              delay: beam.delay,
              ease: 'linear',
              repeat: Infinity,
              repeatDelay: Math.random() * 3 + 2, // 2-5s pause between repeats
            }}
          />
        );
      })}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export { GridBackground };
