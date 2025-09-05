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
  initialCanvasState = null,
  onImageUpload,
}) => {
  const containerRef = useRef(null);
  const pixieRef = useRef(null);
  const activeInitId = useRef(0);

  // Local state
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
  const contentAppliedRef = useRef(false);
  const router = useRouter();

  // Track prop changes and create proxied URL for external images
  useEffect(() => {
    console.log(
      'PixieEditor: useEffect - initialImageUrl changed:',
      initialImageUrl,
    );
    const newImageUrl = initialImageUrl || '';
    setImageUrl(newImageUrl);
    setImageLoadError(false);

    // Create proxied URL for external images
    if (newImageUrl && isExternalImageUrl(newImageUrl)) {
      const proxied = getProxiedImageUrl(newImageUrl);
      console.log('PixieEditor: Created proxied URL:', proxied);
      setProxiedImageUrl(proxied);
    } else {
      setProxiedImageUrl(newImageUrl);
    }
  }, [initialImageUrl]);

  // Set page ready after component mounts
  useEffect(() => {
    console.log('PixieEditor: useEffect - Setting page ready timer');
    const timer = setTimeout(() => {
      console.log('PixieEditor: Page ready set to true');
      setPageReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const cleanupPixie = () => {
    console.log('PixieEditor: cleanupPixie called');
    // Clear any pending timeouts
    if (canvasCheckTimeoutRef.current) {
      console.log('PixieEditor: Clearing canvasCheckTimeoutRef');
      clearTimeout(canvasCheckTimeoutRef.current);
      canvasCheckTimeoutRef.current = null;
    }

    if (imageLoadTimeoutRef.current) {
      console.log('PixieEditor: Clearing imageLoadTimeoutRef');
      clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }

    if (pixieRef.current?.close) {
      try {
        console.log('PixieEditor: Closing pixieRef');
        pixieRef.current.close();
      } catch (err) {
        console.warn('Pixie close error:', err);
      }
    }
    if (containerRef.current) {
      console.log('PixieEditor: Clearing containerRef innerHTML');
      containerRef.current.innerHTML = '';
    }
    pixieRef.current = null;

    // Reset states
    console.log('PixieEditor: Resetting all states');
    setIsLoading(false);
    setError(null);
    setImageLoadError(false);
    setContentApplied(false);
    contentAppliedRef.current = false;
  };

  // Wait for canvas to be ready and then apply content
  const waitForCanvasAndApplyContent = (content, maxAttempts = 5) => {
    console.log(
      'PixieEditor: waitForCanvasAndApplyContent called with content:',
      content,
    );
    if (contentAppliedRef.current) {
      console.log('PixieEditor: Content already applied, skipping');
      return;
    }

    let attempts = 0;
    let isApplying = false;

    const checkCanvas = () => {
      console.log(
        'PixieEditor: checkCanvas called, attempts:',
        attempts,
        'isApplying:',
        isApplying,
      );
      if (isApplying || contentAppliedRef.current) {
        console.log(
          'PixieEditor: Content already being applied or applied, stopping',
        );
        if (canvasCheckTimeoutRef.current) {
          clearTimeout(canvasCheckTimeoutRef.current);
          canvasCheckTimeoutRef.current = null;
        }
        return;
      }

      attempts++;

      if (!pixieRef.current) {
        console.log('PixieEditor: No pixieRef.current, returning');
        return;
      }

      try {
        const state = pixieRef.current.getState();
        console.log('PixieEditor: Current state:', state);

        if (state && state.canvas && state.canvas.objects) {
          console.log('PixieEditor: Canvas is ready, applying content');
          isApplying = true;
          applyContentDirectly(content);
          return;
        } else {
          console.log(
            'PixieEditor: Canvas not ready, attempts:',
            attempts,
            'maxAttempts:',
            maxAttempts,
          );
          if (attempts < maxAttempts) {
            canvasCheckTimeoutRef.current = setTimeout(checkCanvas, 1500);
          } else {
            console.log('PixieEditor: Max attempts reached, trying fallback');
            if (!contentAppliedRef.current && !isApplying) {
              isApplying = true;
              applyContentDirectly(content);
            }
          }
        }
      } catch (error) {
        console.log('PixieEditor: Error in checkCanvas:', error);
        if (
          attempts < maxAttempts &&
          !isApplying &&
          !contentAppliedRef.current
        ) {
          canvasCheckTimeoutRef.current = setTimeout(checkCanvas, 1500);
        }
      }
    };

    console.log('PixieEditor: Starting checkCanvas in 1000ms');
    setTimeout(checkCanvas, 1000);
  };

  // Apply content directly using the working method
  const applyContentDirectly = (content) => {
    console.log(
      'PixieEditor: applyContentDirectly called with content:',
      content,
    );
    if (!content || !content.canvas || !content.canvas.objects) {
      console.log('PixieEditor: Invalid content, returning');
      return;
    }
    if (contentAppliedRef.current) {
      console.log('PixieEditor: Content already applied, returning');
      return;
    }

    try {
      let fabricCanvas = null;
      let fabric = null;

      if (window.fabric) {
        fabric = window.fabric;
        console.log('PixieEditor: Found window.fabric');
      } else {
        console.log('PixieEditor: No window.fabric found');
      }

      console.log('PixieEditor: Finding canvas...');
      if (pixieRef.current.fabric && pixieRef.current.fabric.canvas) {
        fabricCanvas = pixieRef.current.fabric.canvas;
        console.log(
          'PixieEditor: Found canvas via pixieRef.current.fabric.canvas',
        );
      } else if (pixieRef.current.canvas) {
        fabricCanvas = pixieRef.current.canvas;
        console.log('PixieEditor: Found canvas via pixieRef.current.canvas');
      } else if (pixieRef.current.fabric) {
        fabricCanvas = pixieRef.current.fabric;
        console.log('PixieEditor: Found canvas via pixieRef.current.fabric');
      } else {
        console.log(
          'PixieEditor: Trying to find canvas from container element',
        );
        const container = document.getElementById(containerId);
        if (container && container.querySelector('canvas')) {
          const canvasElement = container.querySelector('canvas');
          if (canvasElement._fabric) {
            fabricCanvas = canvasElement._fabric;
            console.log('PixieEditor: Found canvas via container element');
          }
        }
      }

      if (fabricCanvas && fabricCanvas.add && fabric) {
        console.log(
          'PixieEditor: Found valid fabricCanvas, adding objects. Object count:',
          content.canvas.objects.length,
        );

        for (const obj of content.canvas.objects) {
          try {
            console.log('PixieEditor: Adding object:', obj.type, obj);
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
              console.log('PixieEditor: Added text object');
            } else if (obj.type === 'path') {
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
              console.log('PixieEditor: Added path object');
            }
          } catch (addError) {
            console.log('PixieEditor: Error adding object:', addError);
          }
        }

        console.log('PixieEditor: Rendering canvas');
        fabricCanvas.renderAll();

        console.log('PixieEditor: Marking content as applied');
        setContentApplied(true);
        contentAppliedRef.current = true;

        if (canvasCheckTimeoutRef.current) {
          console.log('PixieEditor: Clearing canvas check timeout');
          clearTimeout(canvasCheckTimeoutRef.current);
          canvasCheckTimeoutRef.current = null;
        }
      } else {
        console.log(
          'PixieEditor: No valid fabricCanvas found, trying Pixie API as last resort',
        );
        try {
          for (const obj of content.canvas.objects) {
            console.log(
              'PixieEditor: Trying to add object via Pixie API:',
              obj.type,
            );
            if (obj.type === 'i-text' || obj.type === 'text') {
              if (pixieRef.current.addText) {
                console.log(
                  'PixieEditor: Adding text via pixieRef.current.addText',
                );
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
              if (pixieRef.current.addPath) {
                console.log(
                  'PixieEditor: Adding path via pixieRef.current.addPath',
                );
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
                console.log(
                  'PixieEditor: Adding object via pixieRef.current.addObject',
                );
                pixieRef.current.addObject(obj);
              }
            }
          }

          console.log(
            'PixieEditor: Marking content as applied (Pixie API method)',
          );
          setContentApplied(true);
          contentAppliedRef.current = true;

          if (canvasCheckTimeoutRef.current) {
            console.log(
              'PixieEditor: Clearing canvas check timeout (Pixie API method)',
            );
            clearTimeout(canvasCheckTimeoutRef.current);
            canvasCheckTimeoutRef.current = null;
          }
        } catch (pixieError) {
          console.log('PixieEditor: Error using Pixie API:', pixieError);
        }
      }
    } catch (error) {
      console.log('PixieEditor: Error in applyContentDirectly:', error);
    }
  };

  // Load Pixie script
  const loadPixieScript = async () => {
    console.log('PixieEditor: loadPixieScript called');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/pixie-assets/pixie.umd.js';
      script.async = true;
      script.onload = () => {
        console.log('PixieEditor: Pixie script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.log('PixieEditor: Failed to load Pixie script');
        reject(new Error('Failed to load Pixie script'));
      };
      document.head.appendChild(script);
    });
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
  };

  // Initialize Pixie
  const initPixie = async (initId) => {
    try {
      setError(null);
      setImageLoadError(false);

      imageLoadTimeoutRef.current = setTimeout(() => {
        if (activeInitId.current === initId && isLoading) {
          setImageLoadError(true);
          setIsLoading(false);
        }
      }, 15000);

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
      console.log('PixieEditor: Pixie object:', Pixie);
      if (!Pixie?.init) {
        console.log('PixieEditor: Pixie init missing');
        throw new Error('Pixie init missing');
      }

      const instance = await Pixie.init({
        selector: `#${containerId}`,
        image: proxiedImageUrl || imageUrl,
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
          zoom: {
            allowUserZoom: true,
          },
          crop: {
            allowExternalImages: true,
            ignoreExternalImageErrors: true,
          },
          openImageDialog: {
            show: true,
          },
          ...config?.tools,
        },
        ui: {
          nav: {
            replaceDefault: true,
            items: [
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
            ],
          },
        },
        onLoad: async (editor) => {
          console.log('PixieEditor: onLoad callback triggered');
          if (activeInitId.current !== initId) {
            console.log('PixieEditor: Active init ID mismatch, returning');
            return;
          }
          console.log('PixieEditor: Setting loading to false');
          setIsLoading(false);

          if (imageLoadTimeoutRef.current) {
            console.log('PixieEditor: Clearing image load timeout');
            clearTimeout(imageLoadTimeoutRef.current);
            imageLoadTimeoutRef.current = null;
          }

          try {
            const savedState = initialCanvasState || initialContent;
            console.log('PixieEditor: savedState:', savedState);
            if (savedState?.canvas && savedState?.canvas?.objects?.length > 0) {
              console.log('PixieEditor: Setting state with savedState');
              try {
                await editor.setState(savedState);
                console.log('PixieEditor: State set successfully');
                setContentApplied(true);
                contentAppliedRef.current = true;
              } catch (err) {
                console.log(
                  'PixieEditor: Error setting state, trying waitForCanvasAndApplyContent:',
                  err,
                );
                waitForCanvasAndApplyContent(initialContent);
              }
            } else {
              console.log('PixieEditor: No saved state objects to apply');
            }
          } catch (error) {
            console.log(
              'PixieEditor: Error in onLoad, trying waitForCanvasAndApplyContent:',
              error,
            );
            waitForCanvasAndApplyContent(initialContent);
          }

          if (pixieRef.current?.on) {
            console.log('PixieEditor: Setting up event listeners');
            pixieRef.current.on('stateChange', () => {
              console.log('PixieEditor: stateChange event triggered');
              try {
                const state = pixieRef?.current?.getState();
                console.log(
                  'PixieEditor: Current state from stateChange:',
                  state,
                );

                localStorage.setItem('pixieCanvasState', JSON.stringify(state));
              } catch (error) {
                console.log(
                  'PixieEditor: Error in stateChange handler:',
                  error,
                );
              }
            });

            pixieRef.current.on('crop:start', () => {
              console.log('PixieEditor: crop:start event triggered');
              pixieRef.current.canvas?.renderAll();
            });
            pixieRef.current.on('crop:end', () => {
              console.log('PixieEditor: crop:end event triggered');
              pixieRef.current.canvas?.renderAll();
            });
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
          console.log('PixieEditor: onError callback triggered:', err);
          if (activeInitId.current === initId) {
            console.error(
              'Pixie editor error:',
              err.message || 'Unknown Pixie error',
            );

            if (imageLoadTimeoutRef.current) {
              console.log(
                'PixieEditor: Clearing image load timeout due to error',
              );
              clearTimeout(imageLoadTimeoutRef.current);
              imageLoadTimeoutRef.current = null;
            }

            const errorMessage = err.message || 'Unknown Pixie error';
            console.log('PixieEditor: Error message:', errorMessage);
            if (
              errorMessage.includes('image') ||
              errorMessage.includes('load') ||
              errorMessage.includes('404') ||
              errorMessage.includes('not found')
            ) {
              console.log('PixieEditor: Setting image load error');
              setImageLoadError(true);
            } else {
              console.log('PixieEditor: Setting general error');
              setError(errorMessage);
            }
            console.log('PixieEditor: Setting loading to false due to error');
            setIsLoading(false);
          } else {
            console.log('PixieEditor: Active init ID mismatch in onError');
          }
        },
      });

      if (activeInitId.current === initId) {
        console.log('PixieEditor: Setting pixieRef.current to instance');
        pixieRef.current = instance;
        clearInterval(alertInterval);

        setTimeout(() => {
          if (activeInitId.current === initId) {
            console.log('PixieEditor: Safety net timeout triggered');
            setIsLoading(false);
            if (isLoading) {
              console.log(
                'PixieEditor: Setting image load error due to timeout',
              );
              setImageLoadError(true);
            }
          }
        }, 10000);
      } else {
        console.log('PixieEditor: Active init ID mismatch, closing instance');
        instance?.close?.();
        clearInterval(alertInterval);
      }
    } catch (err) {
      console.log('PixieEditor: Error in main initialization:', err);
      if (activeInitId.current === initId) {
        const errorMessage = err.message || 'Unknown error';
        console.log('PixieEditor: Error message:', errorMessage);

        if (imageLoadTimeoutRef.current) {
          console.log(
            'PixieEditor: Clearing image load timeout due to main error',
          );
          clearTimeout(imageLoadTimeoutRef.current);
          imageLoadTimeoutRef.current = null;
        }

        if (
          errorMessage.includes('image') ||
          errorMessage.includes('load') ||
          errorMessage.includes('404') ||
          errorMessage.includes('not found')
        ) {
          console.log(
            'PixieEditor: Setting image load error due to main error',
          );
          setImageLoadError(true);
        } else {
          console.log('PixieEditor: Setting general error due to main error');
          setError(errorMessage);
        }
        console.log('PixieEditor: Setting loading to false due to main error');
        setIsLoading(false);
      } else {
        console.log(
          'PixieEditor: Active init ID mismatch in main error handler',
        );
      }
    }
  };

  // Generate containerId when component mounts or imageUrl changes
  useEffect(() => {
    console.log('PixieEditor: useEffect - imageUrl/proxiedImageUrl changed:', {
      imageUrl: imageUrl,
      proxiedImageUrl: proxiedImageUrl,
    });
    if (imageUrl || proxiedImageUrl) {
      console.log('PixieEditor: Cleaning up and generating new container ID');
      cleanupPixie();
      setIsLoading(false);
      setError(null);
      setContentApplied(false);
      contentAppliedRef.current = false;

      editorInstanceId++;
      activeInitId.current = editorInstanceId;
      const newContainerId = `pixie-editor-container-${editorInstanceId}`;
      console.log('PixieEditor: Setting container ID:', newContainerId);
      setContainerId(newContainerId);
    } else {
      console.log('PixieEditor: No image URL, clearing container ID');
      setContainerId('');
    }
  }, [imageUrl, proxiedImageUrl]);

  // Init Pixie after container renders AND image URL is available AND page is ready
  useEffect(() => {
    console.log('PixieEditor: useEffect - Init Pixie check:', {
      containerId,
      imageUrl: imageUrl,
      proxiedImageUrl: proxiedImageUrl,
      pageReady,
    });
    if (!containerId) {
      console.log('PixieEditor: No containerId, returning');
      return;
    }
    if (!imageUrl && !proxiedImageUrl) {
      console.log('PixieEditor: No image URL, returning');
      return;
    }
    if (!pageReady) {
      console.log('PixieEditor: Page not ready, returning');
      return;
    }

    const currentInitId = activeInitId.current;
    console.log('PixieEditor: Current init ID:', currentInitId);

    const initTimeout = setTimeout(() => {
      console.log('PixieEditor: Init timeout triggered, checking init ID');
      if (activeInitId.current === currentInitId) {
        console.log('PixieEditor: Init ID matches, calling initPixie');
        initPixie(currentInitId);
      } else {
        console.log('PixieEditor: Init ID mismatch, skipping initPixie');
      }
    }, 200);

    return () => {
      console.log('PixieEditor: Cleaning up init timeout');
      clearTimeout(initTimeout);
      activeInitId.current++;
    };
  }, [containerId, imageUrl, proxiedImageUrl, pageReady]);

  // Expose save function and ref to parent component
  useEffect(() => {
    if (pixieRef.current) {
      const saveFunction = async () => {
        console.log('PixieEditor: saveFunction called');
        if (pixieRef.current?.getState) {
          try {
            const state = pixieRef.current.getState();
            console.log('PixieEditor: saveFunction - Current state:', state);

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

            if (onSave) {
              console.log(
                'PixieEditor: saveFunction - Calling onSave with state',
              );
              await onSave(state);
            }
            console.log(
              'PixieEditor: saveFunction - Save completed successfully',
            );
            return true;
          } catch (error) {
            console.error(
              'PixieEditor: saveFunction - Failed to save image state:',
              error,
            );
            return false;
          }
        } else {
          console.error('PixieEditor: saveFunction - Editor not initialized');
          return false;
        }
      };

      console.log(
        'PixieEditor: Setting window.pixieRef and window.pixieSaveFunction',
      );
      window.pixieRef = pixieRef;
      window.pixieSaveFunction = saveFunction;

      if (onEditorReady) {
        console.log('PixieEditor: Calling onEditorReady with saveFunction');
        onEditorReady(saveFunction);
      }
    }

    return () => {
      console.log(
        'PixieEditor: Cleanup - Removing window.pixieSaveFunction and window.pixieRef',
      );
      delete window.pixieSaveFunction;
      delete window.pixieRef;
    };
  }, [onSave, onEditorReady]);

  // Reset content applied ref when initialContent changes
  useEffect(() => {
    console.log(
      'PixieEditor: useEffect - initialContent changed, resetting content applied ref',
    );
    contentAppliedRef.current = false;
    setContentApplied(false);
  }, [initialContent]);

  // Handle image upload
  const handleImageUpload = (event) => {
    console.log('PixieEditor: handleImageUpload called');
    const file = event.target.files[0];
    if (file) {
      console.log('PixieEditor: File selected:', file.name, file.size);
      if (onImageUpload) {
        console.log('PixieEditor: Calling onImageUpload callback');
        onImageUpload(file);
      } else {
        console.log('PixieEditor: Creating temporary URL for uploaded image');
        const tempUrl = URL.createObjectURL(file);
        setImageUrl(tempUrl);
        setProxiedImageUrl(tempUrl);
        setImageLoadError(false);
        setError(null);

        setTimeout(() => {
          console.log('PixieEditor: Revoking temporary URL');
          URL.revokeObjectURL(tempUrl);
        }, 1000);
      }
    } else {
      console.log('PixieEditor: No file selected');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log('PixieEditor: Component mounted, setting up cleanup');
    return () => {
      console.log('PixieEditor: Component unmounting, cleaning up');
      if (canvasCheckTimeoutRef.current) {
        console.log('PixieEditor: Clearing canvas check timeout on unmount');
        clearTimeout(canvasCheckTimeoutRef.current);
      }
      if (imageLoadTimeoutRef.current) {
        console.log('PixieEditor: Clearing image load timeout on unmount');
        clearTimeout(imageLoadTimeoutRef.current);
      }
      console.log('PixieEditor: Resetting all states on unmount');
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
                Initializing Pixie editor...
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
                onClick={() => setImageUrl(imageUrl)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Image State */}
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
