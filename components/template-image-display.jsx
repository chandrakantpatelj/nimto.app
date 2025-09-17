'use client';

import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function TemplateImageDisplay({
  template,
  className = 'w-full h-32 object-cover',
  useThumbnail = false, // New prop to control whether to use thumbnail or full image
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use image proxy for validation
  const imageUrl = useMemo(() => {
    // Choose between thumbnail and full image based on useThumbnail prop
    const sourceUrl = useThumbnail && template?.templateThumbnailUrl 
      ? template.templateThumbnailUrl 
      : template?.s3ImageUrl;
      
    if (sourceUrl) {
      // If URL is already a proxy URL, use it directly
      if (sourceUrl.startsWith('/api/image-proxy')) {
        return sourceUrl;
      }
      // If it's a direct S3 URL, wrap it with image proxy
      return `/api/image-proxy?url=${sourceUrl}`;
    }
    return null;
  }, [template?.s3ImageUrl, template?.templateThumbnailUrl, useThumbnail]);

  // Reset states when template changes
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [template?.id]);

  // Show "No Image" when there's no image URL available
  const hasImage = useThumbnail 
    ? template?.templateThumbnailUrl || template?.s3ImageUrl
    : template?.s3ImageUrl;
    
  if (!hasImage) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center rounded-t-xl`}
      >
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No Image</p>
        </div>
      </div>
    );
  }

  // Show image with error handling
  return (
    <div className={`${className} relative`}>
      <img
        src={imageUrl}
        className={`w-full h-full object-cover rounded-t-xl`}
        alt={template.name || 'Template Image'}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-t-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-t-xl">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}
