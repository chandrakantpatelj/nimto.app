'use client';

import { useSearchParams } from 'next/navigation';
import PixieEditor from '@/components/image-editor/PixieEditor';
import { usePixieEditor } from '@/hooks/use-pixie-editor';

export default function ImageEditorPage() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('image');
  const { isLoading, error, saveImage } = usePixieEditor();

  const handleSave = async (state) => {
    try {
      await saveImage(state);
      alert('Image saved successfully!');
      window.history.back();
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image: ' + error.message);
    }
  };

  const handleCancel = () => {
    // Navigate back or to a specific page
    window.history.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Editor</h1>
        <p className="text-gray-600">
          Edit your image using the powerful Pixie editor
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <PixieEditor
          initialImageUrl={imageUrl}
          onSave={handleSave}
          onCancel={handleCancel}
          height="700px"
          config={{
            // Additional Pixie configuration options
            ui: {
              // Customize the UI as needed
            }
          }}
        />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-700">Saving image...</div>
          </div>
        </div>
      )}
    </div>
  );
}
