'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ImageEditorDemoPage() {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState('/pixie-assets/images/samples/sample1.jpg');

  const sampleImages = [
    { url: '/pixie-assets/images/samples/sample1.jpg', name: 'Sample 1' },
    { url: '/pixie-assets/images/samples/sample2.jpg', name: 'Sample 2' },
    { url: '/pixie-assets/images/samples/sample3.jpg', name: 'Sample 3' },
    { url: '/pixie-assets/images/samples/sample4_preview.jpg', name: 'Sample 4' },
    { url: '/pixie-assets/images/samples/large_sample.jpg', name: 'Large Sample' },
  ];

  const handleImageSelect = (imageUrl) => {
    setSelectedImage(imageUrl);
  };

  const openEditor = () => {
    router.push(`/image-editor?image=${encodeURIComponent(selectedImage)}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Editor Demo</h1>
        <p className="text-gray-600">
          Select an image to edit with the Pixie editor
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Select Image</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {sampleImages.map((image, index) => (
              <div
                key={index}
                className={`cursor-pointer border-2 rounded-lg overflow-hidden transition-colors ${
                  selectedImage === image.url 
                    ? 'border-blue-500' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleImageSelect(image.url)}
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-2 text-center text-sm text-gray-600">
                  {image.name}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={openEditor}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Open Editor
          </button>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={selectedImage}
              alt="Selected image"
              className="w-full h-64 object-contain bg-gray-50"
            />
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            Click "Open Editor" to start editing this image
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/image-editor"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Or open editor without an image
        </Link>
      </div>
    </div>
  );
}
