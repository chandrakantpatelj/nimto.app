'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Loader2, Upload, Download, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { useS3Upload } from '@/hooks/use-s3-upload';

export default function S3DemoPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const { uploadFile, uploadWithProgress, uploading, uploadProgress, error: uploadError, reset } = useS3Upload();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError('');
      setSuccess('');
      reset();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await uploadFile(selectedFile, 'templates');
      
      setUploadedImageUrl(result.url);
      setSuccess('Image uploaded successfully!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  const handleUploadWithProgress = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await uploadWithProgress(selectedFile, 'templates', (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      
      setUploadedImageUrl(result.url);
      setSuccess('Image uploaded successfully with progress tracking!');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  const handleRetrieve = async () => {
    if (!uploadedImageUrl) {
      setError('No image URL to retrieve');
      return;
    }

    try {
      const response = await fetch('/api/s3/retrieve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl: uploadedImageUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Retrieval failed');
      }

      setSuccess('Image retrieved successfully!');
    } catch (err) {
      setError(err.message || 'Retrieval failed');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Secure S3 Upload Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload images to AWS S3 using pre-signed URLs (no credentials exposed to client)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-input">Select Image File</Label>
              <Input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
              </p>
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileImage className="w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleUploadWithProgress}
                disabled={!selectedFile || uploading}
                variant="outline"
                className="flex-1"
              >
                Upload with Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Upload Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedImageUrl ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Image URL:
                  </p>
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs break-all">
                    {uploadedImageUrl}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRetrieve}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Test Retrieve
                  </Button>
                  <Button
                    onClick={() => window.open(uploadedImageUrl, '_blank')}
                    variant="outline"
                    className="flex-1"
                  >
                    View Image
                  </Button>
                </div>

                <div className="mt-4">
                  <img
                    src={uploadedImageUrl}
                    alt="Uploaded"
                    className="max-w-full h-auto rounded-lg border"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      setError('Failed to load image preview');
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileImage className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No image uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Security Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Security Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                🔒 Pre-signed URLs
              </h4>
              <p className="text-green-700 dark:text-green-300">
                AWS credentials never exposed to client
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                ⏱️ Time-limited Access
              </h4>
              <p className="text-blue-700 dark:text-blue-300">
                URLs expire after 15 minutes
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                🚀 Direct Upload
              </h4>
              <p className="text-purple-700 dark:text-purple-300">
                Files upload directly to S3
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error and Success Messages */}
      {error && (
        <Alert className="mt-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert className="mt-4 border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Upload Error: {uploadError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
