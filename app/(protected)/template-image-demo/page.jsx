'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import TemplateImageEditor from '@/components/template-image-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image as ImageIcon, Download, ExternalLink } from 'lucide-react';

export default function TemplateImageDemoPage() {
  const params = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savedImageData, setSavedImageData] = useState(null);

  // Use a default template ID for demo, or get from URL params
  const templateId = params.id || 'demo-template-123';

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/template/${templateId}`);
      const result = await response.json();

      if (response.ok) {
        setTemplate(result.data);
      } else {
        // Create a demo template if it doesn't exist
        setTemplate({
          id: templateId,
          name: 'Demo Template',
          category: 'Demo',
          imagePath: null,
        });
      }
    } catch (err) {
      setError('Failed to load template');
      console.error('Error loading template:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSaved = (imageData) => {
    setSavedImageData(imageData);
    // Reload template to get updated data
    loadTemplate();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Template Image Editor Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload, edit, and save images for templates using Pixie editor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Template Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template ID:
              </label>
              <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded">
                {template?.id}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name:
              </label>
              <p className="text-sm text-gray-900">
                {template?.name}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category:
              </label>
              <p className="text-sm text-gray-900">
                {template?.category}
              </p>
            </div>

            {template?.imagePath && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Image Path:
                </label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
                  {template.imagePath}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Image Info */}
        {savedImageData && (
          <Card>
            <CardHeader>
              <CardTitle>Last Saved Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL:
                </label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
                  {savedImageData.imageUrl}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image Path:
                </label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 p-2 rounded break-all">
                  {savedImageData.imagePath}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(savedImageData.imageUrl, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Image
                </Button>
                <Button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = savedImageData.imageUrl;
                    link.download = 'template-image.png';
                    link.click();
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Image Editor */}
      <div className="mt-6">
        <TemplateImageEditor
          templateId={templateId}
          onImageSaved={handleImageSaved}
        />
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-1">1. Upload Image</h4>
              <p className="text-blue-700">
                Select an image file (JPG, PNG, GIF, WebP) up to 5MB
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-1">2. Edit with Pixie</h4>
              <p className="text-green-700">
                Use the powerful Pixie editor to modify your image
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-1">3. Save to S3</h4>
              <p className="text-purple-700">
                Save the edited image to S3 and update the template
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
