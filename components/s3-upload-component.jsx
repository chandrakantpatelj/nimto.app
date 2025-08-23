'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { useS3Upload } from '@/hooks/use-s3-upload';

export function S3UploadComponent({ 
  onUploadComplete, 
  directory = 'templates',
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/*'],
  className = ''
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [error, setError] = useState('');
  
  const { uploadFile, uploading, uploadProgress, error: uploadError, reset } = useS3Upload();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      setSelectedFile(null);
      return;
    }
    
    // Validate file size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError('');
    reset();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setError('');

    try {
      const result = await uploadFile(selectedFile, directory);
      
      setUploadedImageUrl(result.url);
      
      // Call the callback with upload result
      if (onUploadComplete) {
        onUploadComplete({
          url: result.url,
          key: result.key,
          fileName: result.fileName,
          file: selectedFile
        });
      }
      
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('s3-file-input');
      if (fileInput) fileInput.value = '';
      
    } catch (err) {
      setError(err.message || 'Upload failed');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="s3-file-input">Upload Image</Label>
        <Input
          id="s3-file-input"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="mt-1"
        />
        <p className="text-sm text-gray-500 mt-1">
          Supported formats: JPG, PNG, GIF, WebP (Max {(maxSize / 1024 / 1024).toFixed(0)}MB)
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

      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload to S3
          </>
        )}
      </Button>

      {uploadedImageUrl && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Image uploaded successfully!
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Upload Error: {uploadError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
