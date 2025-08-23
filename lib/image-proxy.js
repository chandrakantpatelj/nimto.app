/**
 * Convert external image URLs to proxied URLs to avoid CORS issues
 * @param {string} imageUrl - The original image URL
 * @returns {string} - The proxied image URL
 */
export function getProxiedImageUrl(imageUrl) {
  if (!imageUrl) return imageUrl;
  
  // If it's already a data URL or relative URL, return as is
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('/')) {
    return imageUrl;
  }
  
  // If it's an external URL, proxy it through our API
  if (imageUrl.startsWith('http')) {
    const encodedUrl = encodeURIComponent(imageUrl);
    return `/api/proxy-image?url=${encodedUrl}`;
  }
  
  return imageUrl;
}

/**
 * Check if an image URL is external (needs proxying)
 * @param {string} imageUrl - The image URL to check
 * @returns {boolean} - True if the URL is external
 */
export function isExternalImageUrl(imageUrl) {
  if (!imageUrl) return false;
  
  // Data URLs and relative URLs are not external
  if (imageUrl.startsWith('data:') || imageUrl.startsWith('/')) {
    return false;
  }
  
  // URLs starting with http are external
  return imageUrl.startsWith('http');
}

/**
 * Convert a proxied URL back to the original URL
 * @param {string} proxiedUrl - The proxied image URL
 * @returns {string} - The original image URL
 */
export function getOriginalImageUrl(proxiedUrl) {
  if (!proxiedUrl) return proxiedUrl;
  
  // If it's a proxied URL, extract the original URL
  if (proxiedUrl.includes('/api/proxy-image?url=')) {
    const urlParam = proxiedUrl.split('url=')[1];
    return decodeURIComponent(urlParam);
  }
  
  return proxiedUrl;
}
