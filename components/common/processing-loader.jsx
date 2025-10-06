'use client';

import React from 'react';

function ProcessingLoader({ message = 'Processing...', isVisible = true }) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-background/20 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-md p-6 flex flex-col items-center border border-border">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

export default ProcessingLoader;
