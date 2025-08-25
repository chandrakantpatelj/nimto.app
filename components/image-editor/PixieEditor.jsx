'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProxiedImageUrl, isExternalImageUrl } from '@/lib/image-proxy';

let editorInstanceId = 0;

const PixieEditor = ({
  initialImageUrl,
  initialContent,
  onSave,
  width = '100%',
  height = '500px',
  config = {},
  onEditorReady,
  initialCanvasState = null, // ✅ support full JSON restore override
  onImageUpload, // Callback for when user uploads a new image
}) => {
  const containerRef = useRef(null);
  const pixieRef = useRef(null);
  const activeInitId = useRef(0);
  const [imageUrl, setImageUrl] = useState(initialImageUrl || '');
  const [proxiedImageUrl, setProxiedImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [containerId, setContainerId] = useState('');
  const [contentApplied, setContentApplied] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const canvasCheckTimeoutRef = useRef(null);
  const imageLoadTimeoutRef = useRef(null);
  const contentAppliedRef = useRef(false); // Use ref to track application status
  const router = useRouter();

  // Track prop changes and create proxied URL for external images
  useEffect(() => {
    const newImageUrl = initialImageUrl || '';
    setImageUrl(newImageUrl);
    setImageLoadError(false); // Reset error state when image URL changes

    // Create proxied URL for external images
    if (newImageUrl && isExternalImageUrl(newImageUrl)) {
      const proxied = getProxiedImageUrl(newImageUrl);
      setProxiedImageUrl(proxied);
    } else {
      setProxiedImageUrl(newImageUrl);
    }
  }, [initialImageUrl]);

  // Set page ready after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageReady(true);
    }, 500); // Wait 500ms for page to be fully loaded

    return () => clearTimeout(timer);
  }, []);

  const cleanupPixie = () => {
    // Clear any pending timeouts
    if (canvasCheckTimeoutRef.current) {
      clearTimeout(canvasCheckTimeoutRef.current);
      canvasCheckTimeoutRef.current = null;
    }

    if (imageLoadTimeoutRef.current) {
      clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }

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

    // Reset states
    setIsLoading(false);
    setError(null);
    setImageLoadError(false);
    setContentApplied(false);
    contentAppliedRef.current = false;
  };

  // Wait for canvas to be ready and then apply content
  const waitForCanvasAndApplyContent = (content, maxAttempts = 5) => {
    // Don't start if content is already applied
    if (contentAppliedRef.current) return;

    let attempts = 0;
    let isApplying = false;

    const checkCanvas = () => {
      // Stop if content is already being applied or has been applied
      if (isApplying || contentAppliedRef.current) {
        if (canvasCheckTimeoutRef.current) {
          clearTimeout(canvasCheckTimeoutRef.current);
          canvasCheckTimeoutRef.current = null;
        }
        return;
      }

      attempts++;

      if (!pixieRef.current) return;

      try {
        const state = pixieRef.current.getState();

        // Check if canvas is properly initialized
        if (state && state.canvas && state.canvas.objects) {
          // Canvas is ready, apply content
          isApplying = true;
          applyContentDirectly(content);
          return;
        } else {
          if (attempts < maxAttempts) {
            canvasCheckTimeoutRef.current = setTimeout(checkCanvas, 1500);
          } else {
            // Try fallback method
            if (!contentAppliedRef.current && !isApplying) {
              isApplying = true;
              applyContentDirectly(content);
            }
          }
        }
      } catch (error) {
        if (
          attempts < maxAttempts &&
          !isApplying &&
          !contentAppliedRef.current
        ) {
          canvasCheckTimeoutRef.current = setTimeout(checkCanvas, 1500);
        }
      }
    };

    // Start checking
    setTimeout(checkCanvas, 1000);
  };

  // Apply content directly using the working method
  const applyContentDirectly = (content) => {
    if (!content || !content.canvas || !content.canvas.objects) return;
    if (contentAppliedRef.current) return;

    try {
      let fabricCanvas = null;
      let fabric = null;

      // Get global fabric object
      if (window.fabric) {
        fabric = window.fabric;
      }

      // Find the canvas - try multiple approaches
      if (pixieRef.current.fabric && pixieRef.current.fabric.canvas) {
        fabricCanvas = pixieRef.current.fabric.canvas;
      } else if (pixieRef.current.canvas) {
        fabricCanvas = pixieRef.current.canvas;
      } else if (pixieRef.current.fabric) {
        fabricCanvas = pixieRef.current.fabric;
      } else {
        // Try to get canvas from the container element
        const container = document.getElementById(containerId);
        if (container && container.querySelector('canvas')) {
          const canvasElement = container.querySelector('canvas');
          if (canvasElement._fabric) {
            fabricCanvas = canvasElement._fabric;
          }
        }
      }

      if (fabricCanvas && fabricCanvas.add && fabric) {
        for (const obj of content.canvas.objects) {
          try {
            if (obj.type === 'i-text' || obj.type === 'text') {
              const fabricText = new fabric.IText(obj.text, {
                left: obj.left,
                top: obj.top,
                fontSize: obj.fontSize,
                fontFamily: obj.fontFamily,
                fill: obj.fill,
                fontWeight: obj.fontWeight,
                textAlign: obj.textAlign,
                angle: obj.angle,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                opacity: obj.opacity,
                visible: obj.visible,
              });
              fabricCanvas.add(fabricText);
            } else if (obj.type === 'path') {
              // Handle path objects (drawings)
              const fabricPath = new fabric.Path(obj.path, {
                left: obj.left,
                top: obj.top,
                fill: obj.fill,
                stroke: obj.stroke,
                strokeWidth: obj.strokeWidth,
                strokeLineCap: obj.strokeLineCap,
                strokeLineJoin: obj.strokeLineJoin,
                angle: obj.angle,
                scaleX: obj.scaleX,
                scaleY: obj.scaleY,
                opacity: obj.opacity,
                visible: obj.visible,
              });
              fabricCanvas.add(fabricPath);
            }
          } catch (addError) {
            // Silent fail for individual objects
          }
        }

        // Render the canvas to show changes
        fabricCanvas.renderAll();

        // Mark as applied
        setContentApplied(true);
        contentAppliedRef.current = true;

        // Clear any ongoing canvas checks
        if (canvasCheckTimeoutRef.current) {
          clearTimeout(canvasCheckTimeoutRef.current);
          canvasCheckTimeoutRef.current = null;
        }
      } else {
        // Try using Pixie's own API as last resort
        try {
          for (const obj of content.canvas.objects) {
            if (obj.type === 'i-text' || obj.type === 'text') {
              if (pixieRef.current.addText) {
                pixieRef.current.addText(obj.text, {
                  left: obj.left,
                  top: obj.top,
                  fontSize: obj.fontSize,
                  fontFamily: obj.fontFamily,
                  fill: obj.fill,
                  fontWeight: obj.fontWeight,
                  textAlign: obj.textAlign,
                  angle: obj.angle,
                  scaleX: obj.scaleX,
                  scaleY: obj.scaleY,
                });
              }
            } else if (obj.type === 'path') {
              // Try to add path using Pixie's API if available
              if (pixieRef.current.addPath) {
                pixieRef.current.addPath(obj.path, {
                  left: obj.left,
                  top: obj.top,
                  fill: obj.fill,
                  stroke: obj.stroke,
                  strokeWidth: obj.strokeWidth,
                  strokeLineCap: obj.strokeLineCap,
                  strokeLineJoin: obj.strokeLineJoin,
                  angle: obj.angle,
                  scaleX: obj.scaleX,
                  scaleY: obj.scaleY,
                });
              } else if (pixieRef.current.addObject) {
                // Try generic addObject method
                pixieRef.current.addObject(obj);
              }
            }
          }

          // Mark as applied
          setContentApplied(true);
          contentAppliedRef.current = true;

          // Clear any ongoing canvas checks
          if (canvasCheckTimeoutRef.current) {
            clearTimeout(canvasCheckTimeoutRef.current);
            canvasCheckTimeoutRef.current = null;
          }
        } catch (pixieError) {
          // Silent fail for Pixie API
        }
      }
    } catch (error) {
      // Silent fail for overall function
    }
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

    // Add global error handler to suppress external image alerts
    window.addEventListener('error', (event) => {
      if (
        event.message &&
        event.message.includes('Could not export canvas with external image')
      ) {
        event.preventDefault();
        console.warn('External image export error suppressed');
        return false;
      }
    });

    // Also suppress console errors related to external images
    // const originalConsoleError = console.error;
    // console.error = function (...args) {
    //   const message = args.join(' ');
    //   if (message.includes('Could not export canvas with external image')) {
    //     console.warn('External image export error suppressed:', ...args);
    //     return;
    //   }
    //   originalConsoleError.apply(console, args);
    // };
  };

  const initPixie = async (initId) => {
    try {
      setError(null);
      setImageLoadError(false);

      // Set a timeout to detect image load failures
      imageLoadTimeoutRef.current = setTimeout(() => {
        if (activeInitId.current === initId && isLoading) {
          setImageLoadError(true);
          setIsLoading(false);
        }
      }, 15000); // 15 seconds timeout

      // Suppress Pixie export alerts
      const suppressAlerts = () => {
        document
          .querySelectorAll('.pixie-alert, [data-pixie-alert]')
          .forEach((alert) => {
            if (
              alert.textContent.includes(
                'Could not export canvas with external image',
              )
            ) {
              alert.remove();
            }
          });
      };
      const alertInterval = setInterval(suppressAlerts, 1000);

      await loadPixieScript();
      const Pixie = window.Pixie;
      if (!Pixie?.init) throw new Error('Pixie init missing');

      const instance = await Pixie.init({
        selector: `#${containerId}`,
        image:
          proxiedImageUrl ||
          imageUrl ||
          'https://via.placeholder.com/400x300?text=No+Image+Provided',
        ...config,
        baseUrl: '/pixie-assets',
        allowExternalImages: true,
        cors: {
          allowExternalImages: true,
          allowCrossOrigin: true,
          allowCredentials: true,
        },
        export: {
          allowExternalImages: true,
          ignoreExternalImageErrors: true,
          format: 'png',
          quality: 1,
        },
        tools: {
          crop: { allowExternalImages: true, ignoreExternalImageErrors: true },
        },
        ui: { ...config.ui, showExportErrors: false, showCropErrors: false },

        onLoad: async (editor) => {
          if (activeInitId.current !== initId) return;
          setIsLoading(false);

          // Clear the image load timeout since loading succeeded
          if (imageLoadTimeoutRef.current) {
            clearTimeout(imageLoadTimeoutRef.current);
            imageLoadTimeoutRef.current = null;
          }

          try {
            const savedState = initialCanvasState || initialContent;
            if (savedState.canvas.objects.length > 0) {
              try {
                await editor.setState(savedState);
                setContentApplied(true);
                contentAppliedRef.current = true;
              } catch (err) {
                waitForCanvasAndApplyContent(initialContent);
              }
            }
          } catch {
            waitForCanvasAndApplyContent(initialContent);
          }

          if (pixieRef.current?.on) {
            pixieRef.current.on('stateChange', () => {
              try {
                const state = pixieRef.current.getState();
                localStorage.setItem('pixieCanvasState', JSON.stringify(state));
              } catch {
                /* silent */
              }
            });

            pixieRef.current.on('crop:start', () =>
              pixieRef.current.canvas?.renderAll(),
            );
            pixieRef.current.on('crop:end', () =>
              pixieRef.current.canvas?.renderAll(),
            );
            pixieRef.current.on('export:error', (error) => {
              console.warn(
                'Export error suppressed for external image:',
                error,
              );
            });

            if (pixieRef.current.export) {
              const originalExport = pixieRef.current.export;
              pixieRef.current.export = async (options = {}) => {
                try {
                  return await originalExport.call(pixieRef.current, {
                    ...options,
                    allowExternalImages: true,
                    ignoreExternalImageErrors: true,
                  });
                } catch (error) {
                  console.warn('Export failed, trying fallback method:', error);
                  return pixieRef.current.canvas?.toDataURL('image/png');
                }
              };
            }
          }
        },

        onError: (err) => {
          if (activeInitId.current === initId) {
            console.error(
              'Pixie editor error:',
              err.message || 'Unknown Pixie error',
            );

            // Clear the image load timeout since we got an error
            if (imageLoadTimeoutRef.current) {
              clearTimeout(imageLoadTimeoutRef.current);
              imageLoadTimeoutRef.current = null;
            }

            // Check if error is related to image loading
            const errorMessage = err.message || 'Unknown Pixie error';
            if (
              errorMessage.includes('image') ||
              errorMessage.includes('load') ||
              errorMessage.includes('404') ||
              errorMessage.includes('not found')
            ) {
              setImageLoadError(true);
            } else {
              setError(errorMessage);
            }
            setIsLoading(false);
          }
        },
      });

      if (activeInitId.current === initId) {
        pixieRef.current = instance;
        clearInterval(alertInterval);

        // Safety net in case loading never finishes
        setTimeout(() => {
          if (activeInitId.current === initId) {
            setIsLoading(false);
            // If still loading after 10 seconds, mark as image load error
            if (isLoading) {
              setImageLoadError(true);
            }
          }
        }, 10000);
      } else {
        instance?.close?.();
        clearInterval(alertInterval);
      }
    } catch (err) {
      if (activeInitId.current === initId) {
        const errorMessage = err.message || 'Unknown error';

        // Clear the image load timeout since we got an error
        if (imageLoadTimeoutRef.current) {
          clearTimeout(imageLoadTimeoutRef.current);
          imageLoadTimeoutRef.current = null;
        }

        // Check if error is related to image loading
        if (
          errorMessage.includes('image') ||
          errorMessage.includes('load') ||
          errorMessage.includes('404') ||
          errorMessage.includes('not found')
        ) {
          setImageLoadError(true);
        } else {
          setError(errorMessage);
        }
        setIsLoading(false);
      }
    }
  };

  // Generate containerId when component mounts or imageUrl changes
  useEffect(() => {
    // Only generate container ID if we have an image URL
    if (imageUrl || proxiedImageUrl) {
      cleanupPixie();
      // Reset loading and error states
      setIsLoading(false);
      setError(null);
      setContentApplied(false);
      contentAppliedRef.current = false;

      editorInstanceId++;
      activeInitId.current = editorInstanceId;
      setContainerId(`pixie-editor-container-${editorInstanceId}`);
    } else {
      // Clear container ID if no image URL
      setContainerId('');
    }
  }, [imageUrl, proxiedImageUrl]);

  // Init Pixie after container renders AND image URL is available AND page is ready
  useEffect(() => {
    if (!containerId) return;
    if (!imageUrl && !proxiedImageUrl) {
      return;
    }
    if (!pageReady) {
      return;
    }

    const currentInitId = activeInitId.current;

    // Add a small delay to ensure everything is ready
    const initTimeout = setTimeout(() => {
      if (activeInitId.current === currentInitId) {
        initPixie(currentInitId);
      }
    }, 200); // 200ms delay

    return () => {
      clearTimeout(initTimeout);
      activeInitId.current++;
    };
  }, [containerId, imageUrl, proxiedImageUrl, pageReady]);

  // Expose save function and ref to parent component
  useEffect(() => {
    if (pixieRef.current) {
      const saveFunction = async () => {
        if (pixieRef.current?.getState) {
          try {
            const state = pixieRef.current.getState();
            console.log('state', state);
            try {
              const exportedImage = await pixieRef.current.export({
                format: 'png',
                quality: 1,
                allowExternalImages: true,
                ignoreExternalImageErrors: true,
              });
              state.exportedImage = exportedImage;
            } catch (exportError) {
              console.warn(
                'Could not export image (external image restriction):',
                exportError.message,
              );
              try {
                if (pixieRef.current.handleExternalImage) {
                  const dataUrl = await pixieRef.current.handleExternalImage();
                  if (dataUrl) {
                    state.exportedImage = dataUrl;
                  }
                } else if (
                  pixieRef.current.canvas &&
                  pixieRef.current.canvas.toDataURL
                ) {
                  const dataUrl =
                    pixieRef.current.canvas.toDataURL('image/png');
                  state.exportedImage = dataUrl;
                }
              } catch (fallbackError) {
                console.warn(
                  'Fallback export also failed:',
                  fallbackError.message,
                );
              }
            }

            if (onSave) await onSave(state);
            return true;
          } catch (error) {
            console.error('Failed to save image state:', error);
            return false;
          }
        } else {
          console.error('Editor not initialized');
          return false;
        }
      };

      window.pixieRef = pixieRef;
      window.pixieSaveFunction = saveFunction;

      if (onEditorReady) {
        onEditorReady(saveFunction);
      }
    }

    return () => {
      delete window.pixieSaveFunction;
      delete window.pixieRef;
    };
  }, [onSave, onEditorReady]);

  // Reset content applied ref when initialContent changes
  useEffect(() => {
    contentAppliedRef.current = false;
    setContentApplied(false);
  }, [initialContent]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Call parent callback if provided
      if (onImageUpload) {
        onImageUpload(file);
      } else {
        // Create a temporary URL for the uploaded image
        const tempUrl = URL.createObjectURL(file);
        setImageUrl(tempUrl);
        setProxiedImageUrl(tempUrl);
        setImageLoadError(false);
        setError(null);

        // Clean up the temporary URL after a delay
        setTimeout(() => {
          URL.revokeObjectURL(tempUrl);
        }, 1000);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (canvasCheckTimeoutRef.current) {
        clearTimeout(canvasCheckTimeoutRef.current);
      }
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
      // Reset all states on unmount
      setIsLoading(false);
      setError(null);
      setImageLoadError(false);
      setContentApplied(false);
      contentAppliedRef.current = false;
    };
  }, []);

  return (
    <div className="relative">
      {/* Enhanced Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-20 rounded-lg">
          <div className="text-center space-y-4">
            {/* Animated Logo/Icon */}
            <div className="relative">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-8 h-8 text-white animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-xl animate-spin"></div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Loading Image Editor
              </h3>
              <p className="text-sm text-gray-600">
                Initializing Pixie editor...
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.1s' }}
              ></div>
              <div
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: '0.2s' }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 border border-red-200 rounded-lg z-10">
          <div className="text-center space-y-4 p-6">
            <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Editor Error
              </h3>
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

      {/* No Image State - Simple Display */}
      {!error && !isLoading && (!imageUrl || imageLoadError) && (
        <div
          style={{ width, height }}
          className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center"
        >
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No Image
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                No image available for editing
              </p>
            </div>

            <div className="text-xs text-gray-400">
              Canvas Size: {width} × {height}
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
