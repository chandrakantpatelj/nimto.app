'use client';

import { useEffect, useMemo, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

export default function TemplateImageDisplay({
  template,
  className = 'w-full h-32 object-cover',
}) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoize the image URL to prevent unnecessary re-renders
  const imageUrl = useMemo(() => {
    // Debug logging
    console.log('TemplateImageDisplay - Template:', template?.name);
    console.log('TemplateImageDisplay - s3ImageUrl:', template?.s3ImageUrl);

    // Use S3 URL directly from template data (should be provided by API)
    if (template?.s3ImageUrl) {
      console.log('TemplateImageDisplay - Using URL:', template.s3ImageUrl);
      return template.s3ImageUrl;
    }

    // If no s3ImageUrl is provided, we can't generate it on client side
    // This indicates an issue with the API
    console.warn(`Template ${template?.id} missing s3ImageUrl from API`);
    return null;
  }, [template?.s3ImageUrl, template?.id]);

  // Reset error state when template changes
  useEffect(() => {
    setError(false);
    setLoading(true);

    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeoutId);
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

  // Show loading state only briefly, then show image
  if (loading) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center rounded-t-xl`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-xs text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Show the image immediately when we have a URL
  if (!imageUrl) {
    return (
      <div
        className={`${className} bg-gray-100 flex items-center justify-center rounded-t-xl`}
      >
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No Image URL</p>
        </div>
      </div>
    );
  }

  // Show image with error handling overlay
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

      {/* Show loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-t-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        </div>
      )}

      {/* Show error overlay */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-t-xl">
          <div className="text-center">
            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500">Image Failed to Load</p>
          </div>
        </div>
      )}
    </div>
  );
}
