'use client';

import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function TemplateImageDisplay({
  template,
  className = 'w-full h-32 object-cover',
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use image proxy for validation
  const imageUrl = useMemo(() => {
    if (template?.s3ImageUrl) {
      // If s3ImageUrl is already a proxy URL, use it directly
      if (template.s3ImageUrl.startsWith('/api/image-proxy')) {
        return template.s3ImageUrl;
      }
      // If it's a direct S3 URL, wrap it with image proxy
      return `/api/image-proxy?url=${template.s3ImageUrl}`;
    }
    return null;
  }, [template?.s3ImageUrl]);

  // Reset states when template changes
  useEffect(() => {
    setError(false);
    setLoading(true);
  }, [template?.id]);

  // Show "No Image" when there's no s3ImageUrl
  if (!template?.s3ImageUrl) {
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
