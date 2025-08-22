'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showCustomToast } from '@/components/common/custom-toast';
import { PixieEditor } from '@/components/image-editor';
import { TemplateHeader } from '../components';
import { useTemplateImage } from '@/hooks/use-template-image';


function EditTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // Will be set from template or upload
  const [templateImageLoading, setTemplateImageLoading] = useState(false); // Track template image loading state
  const [uploadedImageFile, setUploadedImageFile] = useState(null); // Store uploaded file for later saving
  const [uploadedImagePath, setUploadedImagePath] = useState(''); // Store uploaded image path
  const [templateImagePath, setTemplateImagePath] = useState(''); // Store template image path
  const [pixieDataCaptured, setPixieDataCaptured] = useState(false); // Track if Pixie data has been captured
  const [pixieEditorReady, setPixieEditorReady] = useState(false); // Track if Pixie editor is ready
  const latestUserEditsRef = useRef(null); // Track the latest user edits for testing
  const pixieSaveFunctionRef = useRef(null); // Store the Pixie save function
  
  // Template image operations
  const { 
    getTemplateImage, 
    saveTemplateImage, 
    uploadTemplateImage, 
    loading: imageLoading, 
    error: imageError 
  } = useTemplateImage();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    isPremium: false,
    price: 0,
    background: '#FFFFFF', // Default white canvas background
    pageBackground: '#e2e8f0', // Default light gray page background
    content: [], // This will be populated from the canvas
    backgroundStyle: {}, // This will be populated from the canvas
    htmlContent: '', // This will be populated from the canvas
  });

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle template name change (for header input)
  const handleTemplateNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: value,
    }));
  };

  // Handle radio button change
  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      isPremium: value === 'premium',
    }));
  };

  // Extract only user edits from Pixie data
  const extractUserEdits = (pixieData) => {
    
    if (!pixieData) {
      return null;
    }

    // Parse the data if it's a string
    let parsedData = pixieData;
    if (typeof pixieData === 'string') {
      try {
        parsedData = JSON.parse(pixieData);
      } catch (error) {
        return null;
      }
    }


    let canvasData = null;
    let objects = [];
    
    if (parsedData.canvas && parsedData.canvas.objects) {
      canvasData = parsedData.canvas;
      objects = parsedData.canvas.objects;
    } else {
      return null;
    }


    const userEdits = {
      canvas: {
        version: canvasData.version || "5.3.0",
        objects: [],
        width: parsedData.canvasWidth || canvasData.width || 500,
        height: parsedData.canvasHeight || canvasData.height || 389
      },
      editor: {
        zoom: parsedData.editor?.zoom || 1,
        activeObjectId: parsedData.editor?.activeObjectId || null
      }
    };

    // Process objects to find user-created content
    if (Array.isArray(objects)) {
      objects.forEach((obj, index) => {
        
        
        // Skip the main image object (it's the base image)
        if (obj.name === 'mainImage' || obj.type === 'image') {
          return;
        }
        
                // Include all objects except the base image
        if (obj.type !== 'image') {
          
          // Optimize the object by keeping only essential properties
          const optimizedObj = {
            type: obj.type,
            left: obj.left,
            top: obj.top,
            width: obj.width,
            height: obj.height,
            angle: obj.angle || 0,
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            fill: obj.fill,
            opacity: obj.opacity || 1,
            visible: obj.visible !== false
          };

          // Add type-specific properties
          if (obj.type === 'i-text' || obj.type === 'text') {
            optimizedObj.text = obj.text;
            optimizedObj.fontFamily = obj.fontFamily;
            optimizedObj.fontSize = obj.fontSize;
            optimizedObj.fontWeight = obj.fontWeight || 'normal';
            optimizedObj.textAlign = obj.textAlign || 'initial';
            optimizedObj.underline = obj.underline || false;
            optimizedObj.fontStyle = obj.fontStyle || 'normal';
          } else if (obj.type === 'path') {
            optimizedObj.path = obj.path;
            optimizedObj.stroke = obj.stroke;
            optimizedObj.strokeWidth = obj.strokeWidth;
            optimizedObj.strokeLineCap = obj.strokeLineCap;
            optimizedObj.strokeLineJoin = obj.strokeLineJoin;
          } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'triangle' || obj.type === 'polygon') {
            optimizedObj.stroke = obj.stroke;
            optimizedObj.strokeWidth = obj.strokeWidth;
            if (obj.type === 'circle') {
              optimizedObj.radius = obj.radius;
            }
          }

          userEdits.canvas.objects.push(optimizedObj);
        } 
      });
    }

    return userEdits;
  };

  // Pixie editor handlers
  const handleSave = async (editedImageData) => {
    try {
      setIsLoading(true);

      // Extract only user edits
      const userEdits = extractUserEdits(editedImageData);
      
      // Store the latest user edits in ref for testing
      latestUserEditsRef.current = userEdits;
      
      // Store only the user edits in the content field
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          htmlContent: editedImageData.html || '',
          content: userEdits, // Store only user edits, not the full canvas state
          backgroundStyle: editedImageData.backgroundStyle || {},
          editedImageData: editedImageData, // Keep full data for image generation if needed
        };
        
        return newFormData;
      });

      // Set flag to indicate Pixie data has been captured
      setPixieDataCaptured(true);

      showCustomToast('Image changes saved locally. Click "Save Template" to update the template with user edits.', 'success');
    } catch (error) {
      console.error('Error saving image:', error);
      showCustomToast('Failed to save image changes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Handle cancel action - could navigate back or reset
    router.back();
  };

  // Handle background changes
  const handleBackgroundChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));

    // Apply background changes to Pixie editor if available
    if (window.pixieEditor && window.pixieEditor.applyBackground) {
      window.pixieEditor.applyBackground(type, value);
    }
  };

  // Handle Pixie editor ready
  const handlePixieEditorReady = (saveFunction) => {
    pixieSaveFunctionRef.current = saveFunction;
    setPixieEditorReady(true);
    setPixieDataCaptured(false); // Reset capture status when editor is ready
  };

  // Fallback to mark editor as ready after a timeout
  useEffect(() => {
    if (imageUrl && !pixieEditorReady) {
      const timeout = setTimeout(() => {
        setPixieEditorReady(true);
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [imageUrl, pixieEditorReady]);

  // Test function to manually capture Pixie editor data
  const handleTestPixieData = async () => {
    try {
      
      // Check if Pixie editor is ready
      if (!pixieEditorReady) {
        showCustomToast('Pixie editor is still loading. Please wait a moment and try again.', 'error');
        return;
      }
      
      // Check if Pixie editor is available (try ref first, then window as fallback)
      const saveFunction = pixieSaveFunctionRef.current || window.pixieSaveFunction;
      if (saveFunction) {
        const success = await saveFunction();
        if (success) {
          
          // Show the latest user edits from ref
          const latestUserEdits = latestUserEditsRef.current;
      
          
          // Also show current formData for comparison
          
          showCustomToast('User edits captured! Check console for details.', 'success');
        } else {
          showCustomToast('Failed to capture Pixie data', 'error');
        }
      } else {
        showCustomToast('Pixie editor not ready yet. Please wait for it to load.', 'error');
      }
    } catch (error) {
      console.error('Error testing Pixie data capture:', error);
      showCustomToast('Error testing Pixie data capture', 'error');
    }
  };

  // Handle image upload - store file for later upload on form submit
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showCustomToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showCustomToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      // Store the file for later upload
      setUploadedImageFile(file);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      
      // Reset editor state when image changes
      setPixieEditorReady(false);
      setPixieDataCaptured(false);
      pixieSaveFunctionRef.current = null;
    } catch (error) {
      console.error('Error handling image:', error);
      showCustomToast(`Failed to process image: ${error.message}`, 'error');
    }
  };

  // Get CSS background value for styling
  const getBackgroundStyle = (value) => {
    if (!value) return {};

    // Check if it's a URL
    if (value.startsWith('http') || value.startsWith('/')) {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // Check if it's a gradient
    if (value.includes('gradient')) {
      return { background: value };
    }

    // Default to color
    return { backgroundColor: value };
  };

  // Fetch template data
  const fetchTemplateData = async () => {
    if (!templateId || templateId === 'new') {
      return; // Don't fetch for new templates
    }

    try {
      setFetchingTemplate(true);
      setError(null);

      const response = await apiFetch(`/api/template/${templateId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch template');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const template = result.data;

        // Prefill form with template data
        setFormData({
          name: template.name || '',
          category: template.category || '',
          isPremium: template.isPremium || false,
          price: template.price || 0,
          background: template.background || '',
          pageBackground: template.pageBackground || '',
          content: template.content || [], // This contains the saved Pixie user edits
          backgroundStyle: template.backgroundStyle || {},
          htmlContent: template.htmlContent || '',
        });

        // Log the retrieved Pixie data
        if (template.content) {
       
          // Show toast notification about loading saved edits
          showCustomToast(`Loading ${template.content?.canvas?.objects?.length || 0} saved user edits...`, 'info');
        }

        // Set image URL if template has one
        if (template.imagePath) {
          try {
            setTemplateImageLoading(true);
            // Get the full S3 URL for the template image
            const imageData = await getTemplateImage(templateId);
            setImageUrl(imageData.imageUrl);
            setTemplateImagePath(template.imagePath);
          } catch (err) {
            console.error('❌ Failed to load template image:', err);
            // Try to construct the URL manually as fallback
            try {
              const fallbackUrl = `https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/${template.imagePath}`;
              setImageUrl(fallbackUrl);
              setTemplateImagePath(template.imagePath);
            } catch (fallbackErr) {
              console.error('❌ Fallback URL also failed:', fallbackErr);
            }
          } finally {
            setTemplateImageLoading(false);
          }
        } 



      } else {
        throw new Error(result.error || 'Failed to load template');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError(err.message);
      showCustomToast('Failed to load template', 'error');
    } finally {
      setFetchingTemplate(false);
    }
  };

  // Load template data on component mount
  useEffect(() => {
    fetchTemplateData();

  }, [templateId]);

  // Save template function
  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      let userEdits={}
      const saveFunction = pixieSaveFunctionRef.current || window.pixieSaveFunction;
      if (saveFunction) {
        const success = await saveFunction();
        if (success) {
          const latestUserEdits = latestUserEditsRef.current;
           userEdits = extractUserEdits(latestUserEdits);
        
        }
      }

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Template name is required');
      }
      if (!formData.category.trim()) {
        throw new Error('Category is required');
      }

      // Prepare the data for API
      const templateData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        isPremium: formData.isPremium,
        price: formData.isPremium ? parseFloat(formData.price) || 0 : 0,
        background: formData.background || null,
        pageBackground: formData.pageBackground || null,
        content: userEdits, // This will store the optimized Pixie JSON data in jsonContent field
        backgroundStyle: formData.backgroundStyle,
        htmlContent: formData.htmlContent || null,
        imagePath: templateImagePath,
      };

      // SAVE TO DATABASE: Actual save functionality
      let response;
      let successMessage;

    
        // Update existing template
        response = await apiFetch(`/api/template/${templateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });
        successMessage = 'Template updated successfully with Pixie edits';
      
      // else {
      //   // Create new template
      //   response = await apiFetch('/api/template/create-template', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(templateData),
      //   });
      //   successMessage = 'Template created successfully with Pixie edits';
      // }

      if (!response.ok) {
        const errorData = await response.json();
    

        throw new Error(errorData.error || 'Failed to save template');
      }

      const result = await response.json();

      if (result.success) {
   
        uploadedImageFile && await uploadTemplateImage(templateId, uploadedImageFile);

        showCustomToast(successMessage, 'success');
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to save template');
      }
      
    } catch (err) {
      console.error('Error in save template function:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching template data
  if (fetchingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-700">Loading template...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateHeader
        onSave={handleSaveTemplate}
        loading={loading}
        templateName={formData.name}
        onTemplateNameChange={handleTemplateNameChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-white p-4 border-r border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
          <Tabs
            defaultValue="profile"
            className="text-sm text-muted-foreground"
          >
            <TabsList variant="line">
              <TabsTrigger value="profile">Details</TabsTrigger>
              <TabsTrigger value="security">Design</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="py-3">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Template Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={handleTemplateNameChange}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Category</Label>
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange('category', e.target.value)
                    }
                    placeholder="e.g., Birthday, Corporate, Wedding"
                  />
                </div>
                <Label className="text-muted-foreground">Type </Label>

                <RadioGroup
                  value={formData.isPremium ? 'premium' : 'free'}
                  onValueChange={handleTypeChange}
                  className="flex items-center gap-5 mb-5"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label
                      htmlFor="free"
                      className="text-foreground text-sm font-normal"
                    >
                      Free
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label
                      htmlFor="premium"
                      className="text-foreground text-sm font-normal"
                    >
                      Premium
                    </Label>
                  </div>
                </RadioGroup>
                {formData.isPremium && (
                  <div className="w-full mb-5">
                    <Label className="text-muted-foreground">
                      Price (in dollars)
                    </Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange('price', e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="security">
              <div className="py-3">
                {/* Upload Image Section */}
                <div className="mb-6">
                  <Label className="text-muted-foreground mb-2 block">Upload New Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            Click to upload new image
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB (uploads immediately to S3)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Current Image Section */}
                {(templateImagePath || imageUrl) && (
                  <div className="mb-4">
                    <Label className="text-muted-foreground mb-2 block">
                      Current Template Image
                    </Label>
                    <div className="relative">
                      <img
                        src={imageUrl || templateImagePath}
                        alt="Template Image"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          // console.error('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <span className="text-gray-500 text-xs">
                          Image failed to load
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">
                          Current Template Image
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This is the current template image stored in S3. Upload a new image to replace it, or edit with Pixie.
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {templateImagePath 
                    ? 'Template image loaded from S3. Edit with Pixie or upload a new image to replace it.'
                    : 'Upload an image to get started. Images are stored in S3 with unique paths.'
                  }
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
        <main
          className="flex-1 overflow-auto p-8"
          style={getBackgroundStyle(formData.pageBackground)}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Image Editor
              </h1>
              <p className="text-gray-600">
                Edit your image using the powerful Pixie editor
              </p>
            </div>

            <div
              className="rounded-lg shadow-sm border border-gray-200 p-6"
              style={getBackgroundStyle(formData.background)}
            >
              {templateImageLoading ? (
                <div className="flex items-center justify-center h-[700px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">Loading Template Image</h3>
                      <p className="text-sm text-gray-500">Fetching image from S3...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <PixieEditor
                  initialImageUrl={imageUrl}
                  initialContent={formData.content} // Pass the saved Pixie user edits
                  onSave={handleSave}
                  onEditorReady={handlePixieEditorReady}
                  height="700px"
                  config={{
                    // Additional Pixie configuration options
                    ui: {
                      // Customize the UI as needed
                    },
                    // Enable external image support
                    allowExternalImages: true,
                    cors: {
                      allowExternalImages: true,
                      allowCrossOrigin: true
                    },
                    export: {
                      allowExternalImages: true,
                      ignoreExternalImageErrors: true
                    }
                  }}
                />
              )}
            </div>

            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-700">Saving image...</div>
                </div>
              </div>
            )}
          </div>
        </main>
        <aside className="w-74 flex-shrink-0 bg-white p-4 border-l border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
          <div className="space-y-6">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">
              Canvas Settings
            </h3>
            
            {/* Test Button for Pixie Data Capture */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">🧪 Testing Mode</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Click to manually capture user edits (text, drawings, shapes) and log to console
              </p>
              <div className="text-xs text-yellow-600 mb-3 p-2 bg-yellow-100 rounded">
                <strong>Note:</strong> External images (from S3) may show export warnings, but user edits will still be captured.
              </div>
              {!pixieEditorReady && (
                <div className="text-xs text-blue-600 mb-3 p-2 bg-blue-100 rounded">
                  <strong>Loading:</strong> Please wait for the Pixie editor to fully load before testing.
                </div>
              )}
              <button
                onClick={handleTestPixieData}
                className="w-full px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors text-sm font-medium mb-2"
              >
                Test Pixie Data Capture
              </button>
              
              {!pixieEditorReady && (
                <button
                  onClick={() => {
                    setPixieEditorReady(true);
                  }}
                  className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium mb-2"
                >
                  Force Editor Ready
                </button>
              )}
              
              {/* Debug: Set test image */}
              <button
                onClick={() => {
                  const testImageUrl = 'https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/templates%2Ftemplate_cme2ghnk3000354ndo7qalwb4_1755170687671_1755170688254.png';
                  setImageUrl(testImageUrl);
                }}
                className="w-full px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-sm font-medium mb-2"
              >
                Set Test Image
              </button>
              
              {pixieEditorReady && formData.content && (
                <button
                  onClick={() => {
                    if (window.pixieRef && window.pixieRef.current) {
                      // Trigger the applyInitialContent function
                      const applyContent = async () => {
                        const content = formData.content;
                        if (content && content.canvas && content.canvas.objects) {
                        
                           // Try to get the fabric canvas and fabric object from different possible locations
                           let fabricCanvas = null;
                           let fabric = null;
                           
                           // First, try to get the global fabric object (this is what we need for constructors)
                           if (window.fabric) {
                             fabric = window.fabric;
                           }
                           
                           // Then find the canvas
                           if (window.pixieRef.current.fabric && window.pixieRef.current.fabric.canvas) {
                             fabricCanvas = window.pixieRef.current.fabric.canvas;
                           }
                           // Check if pixieRef.current.canvas exists
                           else if (window.pixieRef.current.canvas) {
                             fabricCanvas = window.pixieRef.current.canvas;
                           }
                           // Check if pixieRef.current has a fabric property
                           else if (window.pixieRef.current.fabric) {
                             fabricCanvas = window.pixieRef.current.fabric;
                           }
                           
                           // If we still don't have fabric, try to get it from the Pixie instance
                           if (!fabric && window.pixieRef.current.fabric && window.pixieRef.current.fabric.fabric) {
                             fabric = window.pixieRef.current.fabric.fabric;
                           }
                           
                           if (fabricCanvas && fabricCanvas.add && fabric) {
                             
                             for (const obj of content.canvas.objects) {
                               try {
                                 // Create proper Fabric.js objects instead of adding raw objects
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
                                     visible: obj.visible
                                   });
                                   fabricCanvas.add(fabricText);
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
                                     visible: obj.visible
                                   });
                                   fabricCanvas.add(fabricPath);
                                 } else if (obj.type === 'rect') {
                                   const fabricRect = new fabric.Rect({
                                     left: obj.left,
                                     top: obj.top,
                                     width: obj.width,
                                     height: obj.height,
                                     fill: obj.fill,
                                     stroke: obj.stroke,
                                     strokeWidth: obj.strokeWidth,
                                     opacity: obj.opacity,
                                     visible: obj.visible
                                   });
                                   fabricCanvas.add(fabricRect);
                                 } else if (obj.type === 'circle') {
                                   const fabricCircle = new fabric.Circle({
                                     left: obj.left,
                                     top: obj.top,
                                     radius: obj.radius,
                                     fill: obj.fill,
                                     stroke: obj.stroke,
                                     strokeWidth: obj.strokeWidth,
                                     opacity: obj.opacity,
                                     visible: obj.visible
                                   });
                                   fabricCanvas.add(fabricCircle);
                                 }
                               } catch (addError) {
                                 console.error('❌ Failed to add object to fabric canvas:', addError);
                               }
                             }
                             
                             // Render the canvas to show changes
                             fabricCanvas.renderAll();
                           } else {
                           
                             
                             // Fallback: Try using Pixie's own API methods
                             try {
                               for (const obj of content.canvas.objects) {
                                 if (obj.type === 'i-text' || obj.type === 'text') {
                                   // Try to use Pixie's addText method if available
                                   if (window.pixieRef.current.addText) {
                                     window.pixieRef.current.addText(obj.text, {
                                       left: obj.left,
                                       top: obj.top,
                                       fontSize: obj.fontSize,
                                       fontFamily: obj.fontFamily,
                                       fill: obj.fill,
                                       fontWeight: obj.fontWeight,
                                       textAlign: obj.textAlign,
                                       angle: obj.angle,
                                       scaleX: obj.scaleX,
                                       scaleY: obj.scaleY
                                     });
                                   } else {
                                     console.warn('⚠️ Pixie addText method not available');
                                   }
                                 } else if (obj.type === 'path') {
                                   // Try to add path using Pixie's API if available
                                   if (window.pixieRef.current.addPath) {
                                     window.pixieRef.current.addPath(obj.path, {
                                       left: obj.left,
                                       top: obj.top,
                                       fill: obj.fill,
                                       stroke: obj.stroke,
                                       strokeWidth: obj.strokeWidth,
                                       strokeLineCap: obj.strokeLineCap,
                                       strokeLineJoin: obj.strokeLineJoin,
                                       angle: obj.angle,
                                       scaleX: obj.scaleX,
                                       scaleY: obj.scaleY
                                     });
                                   } else if (window.pixieRef.current.addObject) {
                                     // Try generic addObject method
                                     window.pixieRef.current.addObject(obj);
                                   } else {
                                     console.warn('⚠️ Pixie path methods not available');
                                   }
                                 }
                               }
                             } catch (fallbackError) {
                               console.error('❌ Pixie API fallback also failed:', fallbackError);
                             }
                           }
                        }
                      };
                      applyContent();
                    }
                  }}
                  className="w-full px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                >
                  Apply Saved Content
                </button>
              )}
              
              {/* Status indicator */}
              <div className="mt-3 p-2 bg-white rounded border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Pixie Editor:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pixieEditorReady
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pixieEditorReady ? '✅ Ready' : '⏳ Loading'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">User Data:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pixieDataCaptured 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pixieDataCaptured ? '✅ Captured' : '⏳ Waiting'}
                  </span>
                </div>
                {pixieDataCaptured && (
                  <p className="text-xs text-green-700 mt-1">
                    User edits ready for template save
                  </p>
                )}
              </div>
            </div>
            <div className="py-3">
              <p className="text-primary fw-500">Canvas Background</p>
              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Color, Gradient, or URL
                </Label>
                <Input
                  type="text"
                  value={formData.background}
                  onChange={(e) =>
                    handleBackgroundChange('background', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
                {/* Background preview */}
                <div
                  className="w-full h-8 mt-2 rounded border"
                  style={getBackgroundStyle(formData.background)}
                />
              </div>
              <hr className="my-3" />
              <p className="text-primary fw-500">Page Background</p>

              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Color, Gradient, or URL
                </Label>
                <Input
                  type="text"
                  value={formData.pageBackground}
                  onChange={(e) =>
                    handleBackgroundChange('pageBackground', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
                {/* Background preview */}
                <div
                  className="w-full h-8 mt-2 rounded border"
                  style={getBackgroundStyle(formData.pageBackground)}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default EditTemplate;
