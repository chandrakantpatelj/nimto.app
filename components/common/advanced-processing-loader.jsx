'use client';

import React from 'react';

function AdvancedProcessingLoader({
  isVisible = true,
  title = 'Processing...',
  description = 'Please wait while we process your request...',
  tasks = [
    { icon: '✨', text: 'Processing data...' },
    { icon: '🎨', text: 'Optimizing assets...' },
    { icon: '💾', text: 'Saving to database...' },
  ],
}) {
  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        className="absolute bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/30 dark:border-slate-700/30 max-w-xs sm:max-w-sm md:max-w-md w-full mx-4"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'fade-in 0.3s ease-out forwards',
        }}
      >
        <div className="text-center space-y-6 sm:space-y-7 md:space-y-8">
          {/* Animated Logo/Icon */}
          <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl animate-pulse shadow-lg"></div>
            <div className="absolute inset-2 sm:inset-3 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            {/* Spinning Ring */}
            <div className="absolute inset-0 border-3 sm:border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-2xl sm:rounded-3xl animate-spin shadow-lg"></div>
            {/* Outer Glow */}
            <div className="absolute inset-[-3px] sm:inset-[-4px] bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-600/20 rounded-2xl sm:rounded-3xl blur-sm animate-pulse"></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2 sm:space-y-3">
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">
              {title}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2">
              {description}
            </p>
          </div>

          {/* Animated Progress Dots */}
          <div className="flex justify-center space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full animate-bounce shadow-lg"></div>
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-500 rounded-full animate-bounce shadow-lg"
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse shadow-lg"></div>
          </div>

          {/* Status Messages */}
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1 sm:space-y-2">
            {tasks.map((task, index) => (
              <p
                key={index}
                className="flex items-center justify-center space-x-2"
              >
                <span className="text-purple-500 text-sm sm:text-base">
                  {task.icon}
                </span>
                <span className="truncate">{task.text}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedProcessingLoader;
