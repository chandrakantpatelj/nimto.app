'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDesign, useDesignActions } from '@/store/hooks';
import { getProxiedImageUrl, isExternalImageUrl } from '@/lib/image-proxy';

let editorInstanceId = 0;

const PixieEditorRedux = ({
  initialImageUrl,
  initialContent,
  onSave,
  width = '100%',
  height = '500px',
  config = {},
  onEditorReady,
  initialCanvasState = null,
  onImageUpload,
  // Redux integration props
  useReduxState = false,
  designId = null,
}) => {
  const containerRef = useRef(null);
  const pixieRef = useRef(null);
  const activeInitId = useRef(0);

  // Redux state and actions
  const design = useDesign();
  const designActions = useDesignActions();

  // Local state (fallback when not using Redux)
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

  // Use Redux state if enabled, otherwise use local state
  const currentImageUrl = useReduxState
    ? design.currentDesign?.imageUrl || initialImageUrl
    : imageUrl;
  const currentProxiedImageUrl = useReduxState
    ? design.currentDesign?.proxiedImageUrl
    : proxiedImageUrl;
  const currentIsLoading = useReduxState
    ? design.editorState.isLoading
    : isLoading;
  const currentError = useReduxState ? design.error : error;
  const currentContentApplied = useReduxState
    ? design.editorState.contentApplied
    : contentApplied;

  // Redux actions
  const setImageUrlRedux = (url) => {
    if (useReduxState) {
      designActions.updateElement(designId, { imageUrl: url });
    } else {
      setImageUrl(url);
    }
  };

  const setProxiedImageUrlRedux = (url) => {
    if (useReduxState) {
      designActions.updateElement(designId, { proxiedImageUrl: url });
    } else {
      setProxiedImageUrl(url);
    }
  };

  const setIsLoadingRedux = (loading) => {
    if (useReduxState) {
      designActions.setLoading(loading);
    } else {
      setIsLoading(loading);
    }
  };

  const setErrorRedux = (error) => {
    if (useReduxState) {
      designActions.setError(error);
    } else {
      setError(error);
    }
  };

  const setContentAppliedRedux = (applied) => {
    if (useReduxState) {
      designActions.updateElement(designId, { contentApplied: applied });
    } else {
      setContentApplied(applied);
    }
  };

  // Track prop changes and create proxied URL for external images
  useEffect(() => {
    console.log(
      'PixieEditorRedux: useEffect - initialImageUrl changed:',
      initialImageUrl,
    );
    const newImageUrl = initialImageUrl || '';
    setImageUrlRedux(newImageUrl);
    setImageLoadError(false);

    // Create proxied URL for external images
    if (newImageUrl && isExternalImageUrl(newImageUrl)) {
      const proxied = getProxiedImageUrl(newImageUrl);
      console.log('PixieEditorRedux: Created proxied URL:', proxied);
      setProxiedImageUrlRedux(proxied);
    } else {
      setProxiedImageUrlRedux(newImageUrl);
    }
  }, [initialImageUrl]);

  // Set page ready after component mounts
  useEffect(() => {
    console.log('PixieEditorRedux: useEffect - Setting page ready timer');
    const timer = setTimeout(() => {
      console.log('PixieEditorRedux: Page ready set to true');
      setPageReady(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const cleanupPixie = () => {
    console.log('PixieEditorRedux: cleanupPixie called');
    // Clear any pending timeouts
    if (canvasCheckTimeoutRef.current) {
      console.log('PixieEditorRedux: Clearing canvasCheckTimeoutRef');
      clearTimeout(canvasCheckTimeoutRef.current);
      canvasCheckTimeoutRef.current = null;
    }

    if (imageLoadTimeoutRef.current) {
      console.log('PixieEditorRedux: Clearing imageLoadTimeoutRef');
      clearTimeout(imageLoadTimeoutRef.current);
      imageLoadTimeoutRef.current = null;
    }

    if (pixieRef.current?.close) {
      try {
        console.log('PixieEditorRedux: Closing pixieRef');
        pixieRef.current.close();
      } catch (err) {
        console.warn('Pixie close error:', err);
      }
    }
    if (containerRef.current) {
      console.log('PixieEditorRedux: Clearing containerRef innerHTML');
      containerRef.current.innerHTML = '';
    }
    pixieRef.current = null;

    // Reset states
    console.log('PixieEditorRedux: Resetting all states');
    setIsLoadingRedux(false);
    setErrorRedux(null);
    setImageLoadError(false);
    setContentAppliedRedux(false);
    contentAppliedRef.current = false;
  };

  // Wait for canvas to be ready and then apply content
  const waitForCanvasAndApplyContent = (content, maxAttempts = 5) => {
    console.log(
      'PixieEditorRedux: waitForCanvasAndApplyContent called with content:',
      content,
    );
    if (contentAppliedRef.current) {
      console.log('PixieEditorRedux: Content already applied, skipping');
      return;
    }

    let attempts = 0;
    let isApplying = false;

    const checkCanvas = () => {
      console.log(
        'PixieEditorRedux: checkCanvas called, attempts:',
        attempts,
        'isApplying:',
        isApplying,
      );
      if (isApplying || contentAppliedRef.current) {
        console.log(
          'PixieEditorRedux: Content already being applied or applied, stopping',
        );
        if (canvasCheckTimeoutRef.current) {
          clearTimeout(canvasCheckTimeoutRef.current);
          canvasCheckTimeoutRef.current = null;
        }
        return;
      }

      attempts++;

      if (!pixieRef.current) {
        console.log('PixieEditorRedux: No pixieRef.current, returning');
        return;
      }

      try {
        const state = pixieRef.current.getState();
        console.log('PixieEditorRedux: Current state:', state);

        if (state && state.canvas && state.canvas.objects) {
          console.log('PixieEditorRedux: Canvas is ready, applying content');
          isApplying = true;
          applyContentDirectly(content);
          return;
        } else {
          console.log(
            'PixieEditorRedux: Canvas not ready, attempts:',
            attempts,
            'maxAttempts:',
            maxAttempts,
          );
          if (attempts < maxAttempts) {
            canvasCheckTimeoutRef.current = setTimeout(checkCanvas, 1500);
          } else {
            console.log(
              'PixieEditorRedux: Max attempts reached, trying fallback',
            );
            if (!contentAppliedRef.current && !isApplying) {
              isApplying = true;
              applyContentDirectly(content);
            }
          }
        }
      } catch (error) {
        console.log('PixieEditorRedux: Error in checkCanvas:', error);
        if (
          attempts < maxAttempts &&
          !isApplying &&
          !contentAppliedRef.current
        ) {
          canvasCheckTimeoutRef.current = setTimeout(checkCanvas, 1500);
        }
      }
    };

    console.log('PixieEditorRedux: Starting checkCanvas in 1000ms');
    setTimeout(checkCanvas, 1000);
  };

  // Apply content directly using the working method
  const applyContentDirectly = (content) => {
    console.log(
      'PixieEditorRedux: applyContentDirectly called with content:',
      content,
    );
    if (!content || !content.canvas || !content.canvas.objects) {
      console.log('PixieEditorRedux: Invalid content, returning');
      return;
    }
    if (contentAppliedRef.current) {
      console.log('PixieEditorRedux: Content already applied, returning');
      return;
    }

    try {
      let fabricCanvas = null;
      let fabric = null;

      if (window.fabric) {
        fabric = window.fabric;
        console.log('PixieEditorRedux: Found window.fabric');
      } else {
        console.log('PixieEditorRedux: No window.fabric found');
      }

      console.log('PixieEditorRedux: Finding canvas...');
      if (pixieRef.current.fabric && pixieRef.current.fabric.canvas) {
        fabricCanvas = pixieRef.current.fabric.canvas;
        console.log(
          'PixieEditorRedux: Found canvas via pixieRef.current.fabric.canvas',
        );
      } else if (pixieRef.current.canvas) {
        fabricCanvas = pixieRef.current.canvas;
        console.log(
          'PixieEditorRedux: Found canvas via pixieRef.current.canvas',
        );
      } else if (pixieRef.current.fabric) {
        fabricCanvas = pixieRef.current.fabric;
        console.log(
          'PixieEditorRedux: Found canvas via pixieRef.current.fabric',
        );
      } else {
        console.log(
          'PixieEditorRedux: Trying to find canvas from container element',
        );
        const container = document.getElementById(containerId);
        if (container && container.querySelector('canvas')) {
          const canvasElement = container.querySelector('canvas');
          if (canvasElement._fabric) {
            fabricCanvas = canvasElement._fabric;
            console.log('PixieEditorRedux: Found canvas via container element');
          }
        }
      }

      if (fabricCanvas && fabricCanvas.add && fabric) {
        console.log(
          'PixieEditorRedux: Found valid fabricCanvas, adding objects. Object count:',
          content.canvas.objects.length,
        );

        // Save to Redux history before making changes
        if (useReduxState) {
          designActions.saveToHistory();
        }

        for (const obj of content.canvas.objects) {
          try {
            console.log('PixieEditorRedux: Adding object:', obj.type, obj);
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
              console.log('PixieEditorRedux: Added text object');
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
              console.log('PixieEditorRedux: Added path object');
            }
          } catch (addError) {
            console.log('PixieEditorRedux: Error adding object:', addError);
          }
        }

        console.log('PixieEditorRedux: Rendering canvas');
        fabricCanvas.renderAll();

        console.log('PixieEditorRedux: Marking content as applied');
        setContentAppliedRedux(true);
        contentAppliedRef.current = true;

        if (canvasCheckTimeoutRef.current) {
          console.log('PixieEditorRedux: Clearing canvas check timeout');
          clearTimeout(canvasCheckTimeoutRef.current);
          canvasCheckTimeoutRef.current = null;
        }
      } else {
        console.log(
          'PixieEditorRedux: No valid fabricCanvas found, trying Pixie API as last resort',
        );
        try {
          for (const obj of content.canvas.objects) {
            console.log(
              'PixieEditorRedux: Trying to add object via Pixie API:',
              obj.type,
            );
            if (obj.type === 'i-text' || obj.type === 'text') {
              if (pixieRef.current.addText) {
                console.log(
                  'PixieEditorRedux: Adding text via pixieRef.current.addText',
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
                  'PixieEditorRedux: Adding path via pixieRef.current.addPath',
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
                  'PixieEditorRedux: Adding object via pixieRef.current.addObject',
                );
                pixieRef.current.addObject(obj);
              }
            }
          }

          console.log(
            'PixieEditorRedux: Marking content as applied (Pixie API method)',
          );
          setContentAppliedRedux(true);
          contentAppliedRef.current = true;

          if (canvasCheckTimeoutRef.current) {
            console.log(
              'PixieEditorRedux: Clearing canvas check timeout (Pixie API method)',
            );
            clearTimeout(canvasCheckTimeoutRef.current);
            canvasCheckTimeoutRef.current = null;
          }
        } catch (pixieError) {
          console.log('PixieEditorRedux: Error using Pixie API:', pixieError);
        }
      }
    } catch (error) {
      console.log('PixieEditorRedux: Error in applyContentDirectly:', error);
    }
  };

  // Load Pixie script
  const loadPixieScript = async () => {
    console.log('PixieEditorRedux: loadPixieScript called');
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/pixie-assets/pixie.umd.js';
      script.async = true;
      script.onload = () => {
        console.log('PixieEditorRedux: Pixie script loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.log('PixieEditorRedux: Failed to load Pixie script');
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
      setErrorRedux(null);
      setImageLoadError(false);

      imageLoadTimeoutRef.current = setTimeout(() => {
        if (activeInitId.current === initId && currentIsLoading) {
          setImageLoadError(true);
          setIsLoadingRedux(false);
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
      console.log('PixieEditorRedux: Pixie object:', Pixie);
      if (!Pixie?.init) {
        console.log('PixieEditorRedux: Pixie init missing');
        throw new Error('Pixie init missing');
      }

      const instance = await Pixie.init({
        selector: `#${containerId}`,
        image: currentProxiedImageUrl || currentImageUrl,
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
            allowUserZoom: false,
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
          console.log('PixieEditorRedux: onLoad callback triggered');
          if (activeInitId.current !== initId) {
            console.log('PixieEditorRedux: Active init ID mismatch, returning');
            return;
          }
          console.log('PixieEditorRedux: Setting loading to false');
          setIsLoadingRedux(false);

          if (imageLoadTimeoutRef.current) {
            console.log('PixieEditorRedux: Clearing image load timeout');
            clearTimeout(imageLoadTimeoutRef.current);
            imageLoadTimeoutRef.current = null;
          }

          try {
            const savedState = initialCanvasState || initialContent;
            console.log('PixieEditorRedux: savedState:', savedState);
            if (savedState?.canvas && savedState?.canvas?.objects?.length > 0) {
              console.log('PixieEditorRedux: Setting state with savedState');
              try {
                await editor.setState(savedState);
                console.log('PixieEditorRedux: State set successfully');
                setContentAppliedRedux(true);
                contentAppliedRef.current = true;
              } catch (err) {
                console.log(
                  'PixieEditorRedux: Error setting state, trying waitForCanvasAndApplyContent:',
                  err,
                );
                waitForCanvasAndApplyContent(initialContent);
              }
            } else {
              console.log('PixieEditorRedux: No saved state objects to apply');
            }
          } catch (error) {
            console.log(
              'PixieEditorRedux: Error in onLoad, trying waitForCanvasAndApplyContent:',
              error,
            );
            waitForCanvasAndApplyContent(initialContent);
          }

          if (pixieRef.current?.on) {
            console.log('PixieEditorRedux: Setting up event listeners');
            pixieRef.current.on('stateChange', () => {
              console.log('PixieEditorRedux: stateChange event triggered');
              try {
                const state = pixieRef?.current?.getState();
                console.log(
                  'PixieEditorRedux: Current state from stateChange:',
                  state,
                );

                // Save to Redux if enabled
                if (useReduxState) {
                  designActions.updateElement(designId, { canvasState: state });
                }

                localStorage.setItem('pixieCanvasState', JSON.stringify(state));
              } catch (error) {
                console.log(
                  'PixieEditorRedux: Error in stateChange handler:',
                  error,
                );
              }
            });

            pixieRef.current.on('crop:start', () => {
              console.log('PixieEditorRedux: crop:start event triggered');
              pixieRef.current.canvas?.renderAll();
            });
            pixieRef.current.on('crop:end', () => {
              console.log('PixieEditorRedux: crop:end event triggered');
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
          console.log('PixieEditorRedux: onError callback triggered:', err);
          if (activeInitId.current === initId) {
            console.error(
              'Pixie editor error:',
              err.message || 'Unknown Pixie error',
            );

            if (imageLoadTimeoutRef.current) {
              console.log(
                'PixieEditorRedux: Clearing image load timeout due to error',
              );
              clearTimeout(imageLoadTimeoutRef.current);
              imageLoadTimeoutRef.current = null;
            }

            const errorMessage = err.message || 'Unknown Pixie error';
            console.log('PixieEditorRedux: Error message:', errorMessage);
            if (
              errorMessage.includes('image') ||
              errorMessage.includes('load') ||
              errorMessage.includes('404') ||
              errorMessage.includes('not found')
            ) {
              console.log('PixieEditorRedux: Setting image load error');
              setImageLoadError(true);
            } else {
              console.log('PixieEditorRedux: Setting general error');
              setErrorRedux(errorMessage);
            }
            console.log(
              'PixieEditorRedux: Setting loading to false due to error',
            );
            setIsLoadingRedux(false);
          } else {
            console.log('PixieEditorRedux: Active init ID mismatch in onError');
          }
        },
      });

      if (activeInitId.current === initId) {
        console.log('PixieEditorRedux: Setting pixieRef.current to instance');
        pixieRef.current = instance;
        clearInterval(alertInterval);

        setTimeout(() => {
          if (activeInitId.current === initId) {
            console.log('PixieEditorRedux: Safety net timeout triggered');
            setIsLoadingRedux(false);
            if (currentIsLoading) {
              console.log(
                'PixieEditorRedux: Setting image load error due to timeout',
              );
              setImageLoadError(true);
            }
          }
        }, 10000);
      } else {
        console.log(
          'PixieEditorRedux: Active init ID mismatch, closing instance',
        );
        instance?.close?.();
        clearInterval(alertInterval);
      }
    } catch (err) {
      console.log('PixieEditorRedux: Error in main initialization:', err);
      if (activeInitId.current === initId) {
        const errorMessage = err.message || 'Unknown error';
        console.log('PixieEditorRedux: Error message:', errorMessage);

        if (imageLoadTimeoutRef.current) {
          console.log(
            'PixieEditorRedux: Clearing image load timeout due to main error',
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
            'PixieEditorRedux: Setting image load error due to main error',
          );
          setImageLoadError(true);
        } else {
          console.log(
            'PixieEditorRedux: Setting general error due to main error',
          );
          setErrorRedux(errorMessage);
        }
        console.log(
          'PixieEditorRedux: Setting loading to false due to main error',
        );
        setIsLoadingRedux(false);
      } else {
        console.log(
          'PixieEditorRedux: Active init ID mismatch in main error handler',
        );
      }
    }
  };

  // Generate containerId when component mounts or imageUrl changes
  useEffect(() => {
    console.log(
      'PixieEditorRedux: useEffect - imageUrl/proxiedImageUrl changed:',
      {
        imageUrl: currentImageUrl,
        proxiedImageUrl: currentProxiedImageUrl,
      },
    );
    if (currentImageUrl || currentProxiedImageUrl) {
      console.log(
        'PixieEditorRedux: Cleaning up and generating new container ID',
      );
      cleanupPixie();
      setIsLoadingRedux(false);
      setErrorRedux(null);
      setContentAppliedRedux(false);
      contentAppliedRef.current = false;

      editorInstanceId++;
      activeInitId.current = editorInstanceId;
      const newContainerId = `pixie-editor-container-${editorInstanceId}`;
      console.log('PixieEditorRedux: Setting container ID:', newContainerId);
      setContainerId(newContainerId);
    } else {
      console.log('PixieEditorRedux: No image URL, clearing container ID');
      setContainerId('');
    }
  }, [currentImageUrl, currentProxiedImageUrl]);

  // Init Pixie after container renders AND image URL is available AND page is ready
  useEffect(() => {
    console.log('PixieEditorRedux: useEffect - Init Pixie check:', {
      containerId,
      imageUrl: currentImageUrl,
      proxiedImageUrl: currentProxiedImageUrl,
      pageReady,
    });
    if (!containerId) {
      console.log('PixieEditorRedux: No containerId, returning');
      return;
    }
    if (!currentImageUrl && !currentProxiedImageUrl) {
      console.log('PixieEditorRedux: No image URL, returning');
      return;
    }
    if (!pageReady) {
      console.log('PixieEditorRedux: Page not ready, returning');
      return;
    }

    const currentInitId = activeInitId.current;
    console.log('PixieEditorRedux: Current init ID:', currentInitId);

    const initTimeout = setTimeout(() => {
      console.log('PixieEditorRedux: Init timeout triggered, checking init ID');
      if (activeInitId.current === currentInitId) {
        console.log('PixieEditorRedux: Init ID matches, calling initPixie');
        initPixie(currentInitId);
      } else {
        console.log('PixieEditorRedux: Init ID mismatch, skipping initPixie');
      }
    }, 200);

    return () => {
      console.log('PixieEditorRedux: Cleaning up init timeout');
      clearTimeout(initTimeout);
      activeInitId.current++;
    };
  }, [containerId, currentImageUrl, currentProxiedImageUrl, pageReady]);

  // Expose save function and ref to parent component
  useEffect(() => {
    if (pixieRef.current) {
      const saveFunction = async () => {
        console.log('PixieEditorRedux: saveFunction called');
        if (pixieRef.current?.getState) {
          try {
            const state = pixieRef.current.getState();
            console.log(
              'PixieEditorRedux: saveFunction - Current state:',
              state,
            );

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

            // Save to Redux if enabled
            if (useReduxState) {
              designActions.updateElement(designId, { canvasState: state });
            }

            if (onSave) {
              console.log(
                'PixieEditorRedux: saveFunction - Calling onSave with state',
              );
              await onSave(state);
            }
            console.log(
              'PixieEditorRedux: saveFunction - Save completed successfully',
            );
            return true;
          } catch (error) {
            console.error(
              'PixieEditorRedux: saveFunction - Failed to save image state:',
              error,
            );
            return false;
          }
        } else {
          console.error(
            'PixieEditorRedux: saveFunction - Editor not initialized',
          );
          return false;
        }
      };

      console.log(
        'PixieEditorRedux: Setting window.pixieRef and window.pixieSaveFunction',
      );
      window.pixieRef = pixieRef;
      window.pixieSaveFunction = saveFunction;

      if (onEditorReady) {
        console.log(
          'PixieEditorRedux: Calling onEditorReady with saveFunction',
        );
        onEditorReady(saveFunction);
      }
    }

    return () => {
      console.log(
        'PixieEditorRedux: Cleanup - Removing window.pixieSaveFunction and window.pixieRef',
      );
      delete window.pixieSaveFunction;
      delete window.pixieRef;
    };
  }, [onSave, onEditorReady, useReduxState, designId]);

  // Reset content applied ref when initialContent changes
  useEffect(() => {
    console.log(
      'PixieEditorRedux: useEffect - initialContent changed, resetting content applied ref',
    );
    contentAppliedRef.current = false;
    setContentAppliedRedux(false);
  }, [initialContent]);

  // Handle image upload
  const handleImageUpload = (event) => {
    console.log('PixieEditorRedux: handleImageUpload called');
    const file = event.target.files[0];
    if (file) {
      console.log('PixieEditorRedux: File selected:', file.name, file.size);
      if (onImageUpload) {
        console.log('PixieEditorRedux: Calling onImageUpload callback');
        onImageUpload(file);
      } else {
        console.log(
          'PixieEditorRedux: Creating temporary URL for uploaded image',
        );
        const tempUrl = URL.createObjectURL(file);
        setImageUrlRedux(tempUrl);
        setProxiedImageUrlRedux(tempUrl);
        setImageLoadError(false);
        setErrorRedux(null);

        setTimeout(() => {
          console.log('PixieEditorRedux: Revoking temporary URL');
          URL.revokeObjectURL(tempUrl);
        }, 1000);
      }
    } else {
      console.log('PixieEditorRedux: No file selected');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    console.log('PixieEditorRedux: Component mounted, setting up cleanup');
    return () => {
      console.log('PixieEditorRedux: Component unmounting, cleaning up');
      if (canvasCheckTimeoutRef.current) {
        console.log(
          'PixieEditorRedux: Clearing canvas check timeout on unmount',
        );
        clearTimeout(canvasCheckTimeoutRef.current);
      }
      if (imageLoadTimeoutRef.current) {
        console.log('PixieEditorRedux: Clearing image load timeout on unmount');
        clearTimeout(imageLoadTimeoutRef.current);
      }
      console.log('PixieEditorRedux: Resetting all states on unmount');
      setIsLoadingRedux(false);
      setErrorRedux(null);
      setImageLoadError(false);
      setContentAppliedRedux(false);
      contentAppliedRef.current = false;
    };
  }, []);

  return (
    <div className="relative">
      {/* Enhanced Loading State */}
      {currentIsLoading && (
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
      {currentError && (
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
              <p className="text-sm text-red-600 mb-4">{currentError}</p>
              <button
                onClick={() => setImageUrlRedux(currentImageUrl)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* No Image State */}
      {!currentError &&
        !currentIsLoading &&
        (!currentImageUrl || imageLoadError) && (
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

export default PixieEditorRedux;
