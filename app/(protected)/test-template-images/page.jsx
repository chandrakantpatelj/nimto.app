'use client';

import { useState, useEffect } from 'react';
import TemplateImageDisplay from '@/components/template-image-display';
import { apiFetch } from '@/lib/api';

export default function TestTemplateImages() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await apiFetch('/api/template');
        const result = await response.json();
        
        if (result.success) {
          setTemplates(result.data);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  if (loading) {
    return <div>Loading templates...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Template Image Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">{template.name}</h3>
            <p className="text-sm text-gray-600 mb-2">ID: {template.id}</p>
            <p className="text-sm text-gray-600 mb-2">ImagePath: {template.imagePath || 'None'}</p>
            <p className="text-sm text-gray-600 mb-4">S3ImageUrl: {template.s3ImageUrl || 'None'}</p>
            
            <div className="border rounded">
              <TemplateImageDisplay 
                template={template}
                className="w-full h-32 object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
