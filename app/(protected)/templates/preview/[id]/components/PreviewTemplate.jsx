import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

function PreviewTemplate({ template }) {
  const router = useRouter();

  if (!template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Template not found</p>
        <Button onClick={() => router.push('/templates')}>
          Back to Templates
        </Button>
      </div>
    );
  }
  return (
    <>
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Card className="p-8">
          {/* Template Details */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Template Details
              </h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {template.name}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Category:</span>{' '}
                  {template.category}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Type:</span>{' '}
                  {template.isPremium ? 'Premium' : 'Free'}
                </p>
                {template.isPremium && (
                  <p className="text-gray-700">
                    <span className="font-medium">Price:</span> $
                    {template.price}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>
                Last Updated:{' '}
                {new Date(template.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Designed Content Preview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Designed Content Preview:
            </h3>

            {/* Preview Canvas */}
            <div
              className="relative w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden"
              style={{
                background:
                  template.background || template.pageBackground || '#f3f4f6',
              }}
            >
              {/* Template Content Card */}
              <div
                className="relative w-80 h-64 bg-white rounded-lg shadow-lg p-6 transform rotate-3"
                style={{
                  background: template.pageBackground || 'white',
                }}
              >
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-gray-200 text-4xl font-bold transform -rotate-45 opacity-20">
                    nimto.app
                  </div>
                </div>

                {/* Template Content */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center">
                  <h2 className="text-3xl font-bold text-pink-500 mb-4">
                    It's a Party!
                  </h2>
                  <div className="space-y-2 text-gray-700">
                    <p className="text-sm">
                      You're invited to celebrate a special birthday!
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>Date: Event Date</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <Clock className="h-3 w-3" />
                      <span>Time: Event Time</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span>Location: Event Location</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              This is an image-based preview generated from the template design
              for copyright security.
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="flex justify-end mt-8">
          <Button variant="primary" onClick={() => router.push('/templates')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Template List
          </Button>
        </div>
      </div>
    </>
  );
}

export default PreviewTemplate;
