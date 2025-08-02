'use client';

import * as React from 'react';

const MOBILE_BREAKPOINT = 992;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false); // Default to false for consistent hydration
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Return false during SSR and initial render to avoid hydration mismatch
  // Only return the actual value after the component has mounted
  return mounted ? isMobile : false;
}
