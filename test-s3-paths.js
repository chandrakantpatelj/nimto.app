// Test script to verify S3 path standardization
import { generateProxyUrl, generateS3Url } from './lib/s3-utils.js';

console.log('=== S3 Path Standardization Test ===');
console.log('Test path: templates/test_image.png');
console.log('Direct S3 URL:', generateS3Url('templates/test_image.png'));
console.log('Proxy URL:', generateProxyUrl('templates/test_image.png'));
console.log('=== Test Complete ===');
