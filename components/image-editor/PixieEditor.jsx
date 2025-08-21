'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

let editorInstanceId = 0;

const PixieEditor = ({
  initialImageUrl,
  onSave,
  width = '100%',
  height = '600px',
  config = {}
}) => {
  const containerRef = useRef(null);
  const pixieRef = useRef(null);
  const activeInitId = useRef(0);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [containerId, setContainerId] = useState('');
  const router = useRouter();

  // Track prop changes
  useEffect(() => {
    setImageUrl(initialImageUrl || '');
  }, [initialImageUrl]);

  const cleanupPixie = () => {
    if (pixieRef.current?.close) {
      try {
        pixieRef.current.close();
      } catch (err) {
        console.warn('Pixie close error:', err);
      }
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    pixieRef.current = null;
  };

  const loadPixieScript = async () => {
    // if (window.Pixie) return;
    
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/pixie-assets/pixie.umd.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error('Failed to load Pixie script'));
      document.head.appendChild(script);
    });
  };

  const initPixie = async (initId) => {
    try {
      setIsLoading(true);
      setError(null);

      await loadPixieScript();
      const Pixie = window.Pixie;
      if (!Pixie?.init) throw new Error('Pixie init missing');

      const instance = await Pixie.init({
        selector: `#${containerId}`,
        image: imageUrl,
        ...config,
        onLoad: () => {
          if (activeInitId.current === initId) {
            setIsLoading(false);
          }
        },
        onError: (err) => {
          if (activeInitId.current === initId) {
            setError(err.message || 'Unknown Pixie error');
            setIsLoading(false);
          }
        },
      });

      if (activeInitId.current === initId) {
        pixieRef.current = instance;
      } else {
        instance?.close?.();
      }
    } catch (err) {
      if (activeInitId.current === initId) {
        setError(err.message);
        setIsLoading(false);
      }
    }
  };

  // Generate containerId on image change
  useEffect(() => {
    if (imageUrl) {
      cleanupPixie();
      editorInstanceId++;
      activeInitId.current = editorInstanceId;
      setContainerId(`pixie-editor-container-${editorInstanceId}`);
    } else {
      setContainerId('');
    }
  }, [imageUrl]);

  // Init Pixie after container renders
  useEffect(() => {
    if (!containerId) return;
    
    const currentInitId = activeInitId.current;
    initPixie(currentInitId);
    
    return () => {
      activeInitId.current++;
    };
  }, [containerId]);

  // Expose save function and ref to parent component
  useEffect(() => {
    if (pixieRef.current) {
      window.pixieRef = pixieRef;
      window.pixieSaveFunction = async () => {
        if (pixieRef.current?.getState) {
          try {
            const state = pixieRef.current.getState();
            console.log('saving image:', state);
            if (onSave) await onSave(state);
            return true;
          } catch (error) {
            console.error('Failed to save image:', error);
            return false;
          }
        } else {
          console.error('Editor not initialized');
          return false;
        }
      };
    }
    
    return () => {
      delete window.pixieSaveFunction;
      delete window.pixieRef;
    };
  }, [onSave]);

  return (
    <div className="relative">
      {/* Enhanced Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-20 rounded-lg">
          <div className="text-center space-y-4">
            {/* Animated Logo/Icon */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-xl animate-spin"></div>
            </div>
            
            {/* Loading Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Loading Image Editor</h3>
              <p className="text-sm text-gray-600">Preparing your workspace...</p>
            </div>
            
            {/* Progress Dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg z-10">
          <div className="text-center space-y-4 p-6">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Editor Error</h3>
              <p className="text-sm text-red-600 mb-4">{error}</p>
              <button
                onClick={() => setImageUrl(imageUrl)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Image State - Full Canvas */}
      {!error && !isLoading && !imageUrl && (
        <div 
          style={{ width, height }}
          className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center"
        >
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-xl flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Image Selected</h3>
              <p className="text-sm text-gray-500 mb-4">Please upload an image to get started</p>
              <div className="text-xs text-gray-400">
                Canvas Size: {width} × {height}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pixie Editor Container */}
      {containerId && (
        <div
          ref={containerRef}
          id={containerId}
          style={{ width, height }}
          className="border border-gray-200 rounded-lg overflow-hidden bg-white"
        />
      )}


    </div>
  );
};

export default PixieEditor;
