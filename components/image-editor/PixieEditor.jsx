'use client';

import { toAbsoluteUrl } from '@/lib/helpers';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

let editorInstanceId = 0;

// UI Configuration constants
const NAV_ITEMS = [
  {
    name: 'text',
    action: 'text',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXR5cGUtaWNvbiBsdWNpZGUtdHlwZSI+PHBhdGggZD0iTTEyIDR2MTYiLz48cGF0aCBkPSJNNCA3VjVhMSAxIDAgMCAxIDEtMWgxNGExIDEgMCAwIDEgMSAxdjIiLz48cGF0aCBkPSJNOSAyMGg2Ii8+PC9zdmc+',
  },
  {
    name: 'shapes',
    action: 'shapes',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXB1enpsZS1pY29uIGx1Y2lkZS1wdXp6bGUiPjxwYXRoIGQ9Ik0xNS4zOSA0LjM5YTEgMSAwIDAgMCAxLjY4LS40NzQgMi41IDIuNSAwIDEgMSAzLjAxNCAzLjAxNSAxIDEgMCAwIDAtLjQ3NCAxLjY4bDEuNjgzIDEuNjgyYTIuNDE0IDIuNDE0IDAgMCAxIDAgMy40MTRMMTkuNjEgMTUuMzlhMSAxIDAgMCAxLTEuNjgtLjQ3NCAyLjUgMi41IDAgMSAwLTMuMDE0IDMuMDE1IDEgMSAwIDAgMSAuNDc0IDEuNjhsLTEuNjgzIDEuNjgyYTIuNDE0IDIuNDE0IDAgMCAxLTMuNDE0IDBMOC42MSAxOS42MWExIDEgMCAwIDAtMS42OC40NzQgMi41IDIuNSAwIDEgMS0zLjAxNC0zLjAxNSAxIDEgMCAwIDAgLjQ3NC0xLjY4bC0xLjY4My0xLjY4MmEyLjQxNCAyLjQxNCAwIDAgMSAwLTMuNDE0TDQuMzkgOC42MWExIDEgMCAwIDEgMS42OC40NzQgMi41IDIuNSAwIDEgMCAzLjAxNC0zLjAxNSAxIDEgMCAwIDEtLjQ3NC0xLjY4bDEuNjgzLTEuNjgyYTIuNDE0IDIuNDE0IDAgMCAxIDMuNDE0IDB6Ii8+PC9zdmc+',
  },
  {
    name: 'stickers',
    action: 'stickers',
    icon: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXNtaWxlLXBsdXMtaWNvbiBsdWNpZGUtc21pbGUtcGx1cyI+PHBhdGggZD0iTTIyIDExdjFhMTAgMTAgMCAxIDEtOS0xMCIvPjxwYXRoIGQ9Ik04IDE0czEuNSAyIDQgMiA0LTIgNC0yIi8+PGxpbmUgeDE9IjkiIHgyPSI5LjAxIiB5MT0iOSIgeTI9IjkiLz48bGluZSB4MT0iMTUiIHgyPSIxNS4wMSIgeTE9IjkiIHkyPSI5Ii8+PHBhdGggZD0iTTE2IDVoNiIvPjxwYXRoIGQ9Ik0xOSAydjYiLz48L3N2Zz4=',
  },
];

const PixieEditor = forwardRef(
  (
    {
      initialImageUrl,
      initialContent,
      width = '100%',
      height = '500px',
      onImageSelect,
      config = {},
    },
    ref,
  ) => {
    console.log('initialImageUrl', initialImageUrl);
    const pixieRef = useRef(null);
    const [containerId, setContainerId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Helper function to load image into Pixie
    const loadImageIntoPixie = (imageUrl) => {
      if (pixieRef.current?.tools?.import?.openBackgroundImage) {
        return pixieRef.current.tools.import.openBackgroundImage(imageUrl);
      } else if (pixieRef.current?.loadImage) {
        return pixieRef.current.loadImage(imageUrl);
      } else if (pixieRef.current?.setImage) {
        return pixieRef.current.setImage(imageUrl);
      }
    };

    // Expose API to parent
    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!pixieRef.current?.getState) return null;

        const state = JSON.parse(pixieRef.current.getState());
        // Separate image object (main background) from other objects
        const imageObj = state.canvas?.objects?.find((o) => o.type === 'image');

        const otherObjects = state.canvas?.objects?.filter(
          (o) => o.type !== 'image',
        );

        const cleanedState = {
          ...state,
          canvas: {
            objects: otherObjects || [],
          },
        };

        return JSON.stringify(cleanedState);
      },

      export: async () => {
        try {
          // Try different ways to access the canvas
          let canvas = null;

          // Method 1: Try to get canvas from fabric instance (most likely to work)
          if (pixieRef.current?.fabric) {
            canvas = pixieRef.current.fabric;
          }

          // Method 2: Try to get canvas from tools (but validate it has toDataURL)
          if (!canvas && pixieRef.current?.tools?.canvas) {
            const toolsCanvas = pixieRef.current.tools.canvas;
            if (typeof toolsCanvas.toDataURL === 'function') {
              canvas = toolsCanvas;
            }
          }

          // Method 3: Try to get canvas from the main instance
          if (!canvas && pixieRef.current?.canvas) {
            const mainCanvas = pixieRef.current.canvas;
            if (typeof mainCanvas.toDataURL === 'function') {
              canvas = mainCanvas;
            }
          }

          // Method 4: Try to get the HTML canvas element
          if (!canvas && pixieRef.current?.getCanvas) {
            const htmlCanvas = pixieRef.current.getCanvas();
            if (typeof htmlCanvas.toDataURL === 'function') {
              canvas = htmlCanvas;
            }
          }

          if (!canvas) {
            return null;
          }

          // Check if canvas has toDataURL method
          if (typeof canvas.toDataURL !== 'function') {
            return null;
          }

          // Export as data URL with high quality
          const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 1.0,
            multiplier: 2,
          });

          // Convert Data URL → Blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();

          // Create object URL for preview
          const objectUrl = URL.createObjectURL(blob);

          return {
            blob,
            url: dataUrl,
            objectUrl,
            size: blob.size,
            type: blob.type,
          };
        } catch (err) {
          return null;
        }
      },

      // Replace image while preserving existing content
      replaceImage: async (newImageUrl) => {
        if (!pixieRef.current?.getState) return;

        try {
          // Get current state to preserve existing content
          const currentState = JSON.parse(pixieRef.current.getState());

          // Get all non-image objects (text, shapes, etc.)
          const existingObjects =
            currentState.canvas?.objects?.filter((o) => o.type !== 'image') ||
            [];

          // Load the new image
          await loadImageIntoPixie(newImageUrl);

          // Wait a moment for the image to load, then restore the content
          setTimeout(() => {
            const newState = JSON.parse(pixieRef.current.getState());
            const newImageObj = newState.canvas?.objects?.find(
              (o) => o.type === 'image',
            );

            if (newImageObj && existingObjects.length > 0) {
              // Merge: new image + existing content
              const mergedState = {
                ...newState,
                canvas: {
                  ...newState.canvas,
                  objects: [newImageObj, ...existingObjects],
                },
              };

              pixieRef.current.setState(mergedState);
            }
          }, 500); // Wait for image to load
        } catch (err) {
          // Fallback: just load the new image without preserving content
          loadImageIntoPixie(newImageUrl);
        }
      },
      // Manually show the image dialog
      showImageDialog: () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            // Call the callback with the selected file
            if (onImageSelect) {
              onImageSelect(file);
            }

            // Also load the image into Pixie
            const imageUrl = URL.createObjectURL(file);
            loadImageIntoPixie(imageUrl);
          }
        };
        input.click();
      },
      // Get current image data
      getCurrentImage: () => {
        if (pixieRef.current?.canvas?.toDataURL) {
          return pixieRef.current.canvas.toDataURL('image/png');
        }
        return null;
      },

      // Get thumbnail data for upload (without making API call)
      getThumbnailData: async () => {
        try {
          console.log('Exporting thumbnail data from Pixie');

          // Export the image using the export function defined above
          const exportResult = await (async () => {
            try {
              // Try different ways to access the canvas
              let canvas = null;

              // Method 1: Try to get canvas from fabric instance (most likely to work)
              if (pixieRef.current?.fabric) {
                canvas = pixieRef.current.fabric;
              }

              // Method 2: Try to get canvas from tools (but validate it has toDataURL)
              if (!canvas && pixieRef.current?.tools?.canvas) {
                const toolsCanvas = pixieRef.current.tools.canvas;
                if (typeof toolsCanvas.toDataURL === 'function') {
                  canvas = toolsCanvas;
                }
              }

              // Method 3: Try to get canvas from the main instance
              if (!canvas && pixieRef.current?.canvas) {
                const mainCanvas = pixieRef.current.canvas;
                if (typeof mainCanvas.toDataURL === 'function') {
                  canvas = mainCanvas;
                }
              }

              // Method 4: Try to get the HTML canvas element
              if (!canvas && pixieRef.current?.getCanvas) {
                const htmlCanvas = pixieRef.current.getCanvas();
                if (typeof htmlCanvas.toDataURL === 'function') {
                  canvas = htmlCanvas;
                }
              }

              if (!canvas) {
                return null;
              }

              // Check if canvas has toDataURL method
              if (typeof canvas.toDataURL !== 'function') {
                return null;
              }

              // Export as data URL with high quality
              const dataUrl = canvas.toDataURL({
                format: 'png',
                quality: 1.0,
                multiplier: 2,
              });

              // Convert Data URL → Blob
              const response = await fetch(dataUrl);
              const blob = await response.blob();

              // Create object URL for preview
              const objectUrl = URL.createObjectURL(blob);

              return {
                blob,
                url: dataUrl,
                objectUrl,
                size: blob.size,
                type: blob.type,
              };
            } catch (err) {
              return null;
            }
          })();
          console.log('exportResult', exportResult);
          if (!exportResult || !exportResult.blob) {
            console.error('Failed to export image from Pixie:', {
              exportResult,
            });
            throw new Error('Failed to export image from Pixie');
          }

          console.log('Image exported successfully:', {
            blobSize: exportResult.blob.size,
            blobType: exportResult.blob.type,
          });

          // Convert blob to base64 for API
          const reader = new FileReader();
          const base64Promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(exportResult.blob);
          });

          const base64Data = await base64Promise;
          console.log('Converted blob to base64:', {
            base64Length: base64Data.length,
          });

          return {
            base64Data,
            blob: exportResult.blob,
            url: exportResult.url,
            objectUrl: exportResult.objectUrl,
            size: exportResult.size,
            type: exportResult.type,
          };
        } catch (error) {
          console.error('Error getting thumbnail data:', error);
          throw error;
        }
      },
    }));

    // Load Pixie script
    const loadPixieScript = async () => {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = '/pixie-assets/pixie.umd.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // Initialize Pixie
    const initPixie = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await loadPixieScript();
        const Pixie = window.Pixie;
        if (!Pixie?.init) throw new Error('Pixie init missing');

        const instance = await Pixie.init({
          selector: `#${containerId}`,
          image: initialImageUrl,
          ...config,
          baseUrl: '/pixie-assets',
          allowExternalImages: true,
          cors: { allowExternalImages: true, allowCrossOrigin: true },
          export: {
            allowExternalImages: true,
            ignoreExternalImageErrors: true,
          },
          tools: {
            crop: {
              allowExternalImages: true,
              ignoreExternalImageErrors: true,
            },

            ...config?.tools,
          },
          ui: {
            nav: {
              replaceDefault: true,
              items: NAV_ITEMS,
          
            },
            menubar: {
              replaceDefaultItems: true,
              items: [
                {
                  type: 'image',
                  src: toAbsoluteUrl('/media/app/nimto-main-logo.svg'),
                  align: 'left',
                },
                {
                  type: 'undoWidget',
                  align: 'right',
                },
                {
                  type: 'zoomWidget',
                  align: 'center',
                  desktopOnly: true,
                },
                
              ],
            },
            openImageDialog: { show: false },
          },
          onLoad: async (editor) => {
            // Editor is ready, set loading to false
            // Content loading is now handled by the consolidated useEffect
            setIsLoading(false);
          },
        });

        pixieRef.current = instance;
      } catch (err) {
        setError('Failed to initialize image editor');
        setIsLoading(false);
      }
    };

    // Container ID + init
    useEffect(() => {
      editorInstanceId++;
      const id = `pixie-editor-container-${editorInstanceId}`;
      setContainerId(id);
    }, []);

    useEffect(() => {
      if (containerId) initPixie();

      return () => {
        try {
          // destroy the instance
          pixieRef.current?.destroy?.();
          pixieRef.current = null;

          // remove Pixie global from window
          if (window.Pixie) {
            delete window.Pixie;
          }

          // also remove the injected script to avoid duplicates
          const script = document.querySelector(
            'script[src="/pixie-assets/pixie.umd.js"]',
          );
          if (script) script.remove();
        } catch (e) {
          // Silent cleanup failure
        }
      };
    }, [containerId]);

    // Handle initialImageUrl and initialContent changes - consolidated to avoid race conditions
    useEffect(() => {
      if (pixieRef.current && !isLoading) {
        const loadContent = async () => {
          try {
            // First, load the image if provided
            if (initialImageUrl) {
              console.log(
                'PixieEditor: Loading initial image:',
                initialImageUrl,
              );
              await loadImageIntoPixie(initialImageUrl);

              // Wait a bit for image to load
              await new Promise((resolve) => setTimeout(resolve, 500));
            }

            // Then, load the content if provided
            if (initialContent) {
              console.log('PixieEditor: Loading initial content:', {
                hasContent: !!initialContent,
                contentType: typeof initialContent,
                contentPreview:
                  typeof initialContent === 'string'
                    ? initialContent.substring(0, 100)
                    : JSON.stringify(initialContent).substring(0, 100),
              });

              const initialContentJson =
                typeof initialContent === 'string'
                  ? JSON.parse(initialContent)
                  : initialContent;

              if (initialContentJson?.canvas?.objects?.length > 0) {
                // Get current state to preserve the loaded image
                const currentState = JSON.parse(pixieRef.current.getState());

                // Find the image object in current state (the one we just loaded)
                const currentImageObj = currentState.canvas?.objects?.find(
                  (o) => o.type === 'image',
                );

                // Get other objects from saved content (text, shapes, etc.)
                const savedObjects =
                  initialContentJson.canvas?.objects?.filter(
                    (o) => o.type !== 'image',
                  ) || [];

                // Create merged state: current image + saved objects
                const mergedState = {
                  ...initialContentJson,
                  canvas: {
                    ...initialContentJson.canvas,
                    objects: currentImageObj
                      ? [currentImageObj, ...savedObjects]
                      : savedObjects,
                  },
                };

                pixieRef.current.setState(mergedState);
              }
            }
          } catch (error) {
            console.error('Error loading initial content:', error);
          }
        };

        loadContent();
      }
    }, [initialImageUrl, initialContent, isLoading]);

    return (
      <div className="relative">
        {/* Enhanced Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-20 rounded-lg">
            <div className="text-center space-y-4">
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
                <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-xl animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  Loading Image Editor
                </h3>
                <p className="text-sm text-gray-600">
                  Initializing Nimto editor...
                </p>
              </div>
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
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    initPixie();
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pixie Editor Container */}
        {containerId && (
          <div
            id={containerId}
            style={{ width, height }}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white pixie-editor-container"
          />
        )}
      </div>
    );
  },
);

PixieEditor.displayName = 'PixieEditor';

export default PixieEditor;
