import { useCallback, useState } from 'react';
import { getPublicUrl } from '@/lib/s3-presigned';

export function useS3Upload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadFile = useCallback(async (file, directory = 'templates') => {
    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Step 1: Get pre-signed URL from our API
      const presignedResponse = await fetch('/api/s3/presigned-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          directory,
        }),
      });

      if (!presignedResponse.ok) {
        const errorData = await presignedResponse.json();
        throw new Error(errorData.error || 'Failed to get upload URL');
      }

      const { presignedUrl, key, bucket, region } =
        await presignedResponse.json();

      // Step 2: Upload directly to S3 using pre-signed URL
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('S3 Upload Error:', {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          errorText,
          presignedUrl: presignedUrl.substring(0, 100) + '...',
          key,
        });
        throw new Error(
          `Failed to upload file to S3: ${uploadResponse.status} ${uploadResponse.statusText}`,
        );
      }

      // Step 3: Generate public URL using clean path format
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

      setUploadProgress(100);
      return {
        success: true,
        url: publicUrl,
        key,
        fileName: file.name,
      };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const uploadWithProgress = useCallback(
    async (file, directory = 'templates', onProgress) => {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // Step 1: Get pre-signed URL
        const presignedResponse = await fetch('/api/s3/presigned-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            directory,
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json();
          throw new Error(errorData.error || 'Failed to get upload URL');
        }

        const { presignedUrl, key, bucket, region } =
          await presignedResponse.json();

        // Step 2: Upload with progress tracking
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(progress);
              if (onProgress) onProgress(progress);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
              const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
              setUploadProgress(100);
              resolve({
                success: true,
                url: publicUrl,
                key,
                fileName: file.name,
              });
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Upload failed'));
          });

          xhr.open('PUT', presignedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setError(null);
  }, []);

  return {
    uploadFile,
    uploadWithProgress,
    uploading,
    uploadProgress,
    error,
    reset,
  };
}
