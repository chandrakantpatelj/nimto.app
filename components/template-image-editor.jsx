'use client';

import { useState, useEffect } from 'react';
import { useTemplateImage } from '@/hooks/use-template-image';
import PixieEditor from '@/components/image-editor/PixieEditor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, Save, Image as ImageIcon } from 'lucide-react';

export default function TemplateImageEditor({ templateId, onImageSaved }) {
  const [imageUrl, setImageUrl] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  
  const { 
    getTemplateImage, 
    saveTemplateImage, 
    uploadTemplateImage, 
    loading, 
    error 
  } = useTemplateImage();

  // Load template image on mount
  useEffect(() => {
    if (templateId) {
      loadTemplateImage();
    }
  }, [templateId]);

  const loadTemplateImage = async () => {
    try {
      const imageData = await getTemplateImage(templateId);
      setImageUrl(imageData.imageUrl);
    } catch (err) {
      console.log('No existing image found for template');
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    
    // Create temporary URL for preview
    const tempUrl = URL.createObjectURL(file);
    setImageUrl(tempUrl);
    setShowEditor(true);
  };

  const handleSaveFromPixie = async (imageData) => {
    try {
      const result = await saveTemplateImage(templateId, imageData);
      setImageUrl(result.imageUrl);
      setShowEditor(false);
      
      if (onImageSaved) {
        onImageSaved(result);
      }
      
      alert('Image saved successfully!');
    } catch (err) {
      alert('Failed to save image: ' + err.message);
    }
  };

  const handleUploadToTemplate = async () => {
    if (!uploadedFile) return;

    try {
      const result = await uploadTemplateImage(templateId, uploadedFile);
      setImageUrl(result.imageUrl);
      setUploadedFile(null);
      setShowEditor(false);
      
      if (onImageSaved) {
        onImageSaved(result);
      }
      
      alert('Image uploaded successfully!');
    } catch (err) {
      alert('Failed to upload image: ' + err.message);
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setUploadedFile(null);
    // Restore original image if available
    if (templateId) {
      loadTemplateImage();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Template Image Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
              Upload New Image
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
            </p>
          </div>

          {/* Current Image Preview */}
          {imageUrl && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Current Image:</h4>
              <div className="relative">
                <img
                  src={imageUrl}
                  alt="Template"
                  className="max-w-full h-auto rounded-lg border max-h-64 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {showEditor && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <Button
                      onClick={() => setShowEditor(true)}
                      className="bg-white text-black hover:bg-gray-100"
                    >
                      Continue Editing
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {uploadedFile && (
            <div className="flex gap-2">
              <Button
                onClick={() => setShowEditor(true)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Edit with Pixie
                  </>
                )}
              </Button>
              <Button
                onClick={handleUploadToTemplate}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Directly
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Pixie Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Edit Image with Pixie</h3>
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <PixieEditor
                initialImageUrl={imageUrl}
                onSave={handleSaveFromPixie}
                onCancel={handleCancel}
                height="100%"
                config={{
                  ui: {
                    // Customize Pixie UI as needed
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
