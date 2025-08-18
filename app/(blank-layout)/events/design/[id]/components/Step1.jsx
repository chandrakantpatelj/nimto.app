import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateInput, TimeField } from '@/components/ui/datefield';
import { Input, InputAddon, InputGroup } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { showCustomToast } from '@/components/common/custom-toast';

function Step1() {
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [templateImagePath, setTemplateImagePath] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    isPremium: false,
    price: 0,
    background: '#FFFFFF',
    pageBackground: '#e2e8f0',
    content: [],
    backgroundStyle: {},
    htmlContent: '',
  });

  // Handle background changes
  const handleBackgroundChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));

    // Apply background changes to Pixie editor if available
    if (window.pixieEditor && window.pixieEditor.applyBackground) {
      window.pixieEditor.applyBackground(type, value);
    }
  };

  // Handle image upload - only load into Pixie, don't save to server yet
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showCustomToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showCustomToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      setIsLoading(true);

      // Create a temporary URL for the uploaded file
      const tempImageUrl = URL.createObjectURL(file);

      // Store the file for later saving
      setUploadedImageFile(file);
      setImageUrl(tempImageUrl);

      showCustomToast(
        'Image loaded successfully. Click "Save Template" to save it permanently.',
        'success',
      );
    } catch (error) {
      console.error('Error loading image:', error);
      showCustomToast('Failed to load image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Get CSS background value for styling
  const getBackgroundStyle = (value) => {
    if (!value) return {};

    // Check if it's a URL
    if (value.startsWith('http') || value.startsWith('/')) {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // Check if it's a gradient
    if (value.includes('gradient')) {
      return { background: value };
    }

    // Default to color
    return { backgroundColor: value };
  };
  const [date, setDate] = useState(null);

  useEffect(() => {
    setDate(new Date(1984, 0, 20));
  }, []);
  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-white p-4 border-r border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
          <Tabs
            defaultValue="profile"
            className="text-sm text-muted-foreground"
          >
            <TabsList variant="line">
              <TabsTrigger value="profile">Details</TabsTrigger>
              <TabsTrigger value="security">Design</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="py-3">
                <h1 className="text-xl font-bold text-gray-900 mb-2">
                  Event Details
                </h1>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Title</Label>
                  <Input type="text" placeholder="Enter template name" />
                </div>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        mode="input"
                        variant="outline"
                        id="date"
                        className={cn(
                          'w-full data-[state=open]:border-primary',
                          !date && 'text-muted-foreground',
                        )}
                      >
                        <CalendarDays className="-ms-0.5" />
                        {date ? (
                          format(date, 'LLL dd, y')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        {/* <span>Pick a date</span> */}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="single" // Single date selection
                        defaultMonth={date}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Time</Label>
                  <InputGroup className="w-full">
                    <InputAddon mode="icon">
                      <Clock3 />
                    </InputAddon>
                    <TimeField>
                      <DateInput />
                    </TimeField>
                  </InputGroup>
                </div>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Location</Label>
                  <Input type="text" />
                </div>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Description</Label>
                  <Textarea />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="security">
              <div className="py-3">
                <div className="mb-6">
                  <Label className="text-muted-foreground mb-2 block">
                    Load New Image
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <svg
                        className="w-8 h-8 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {isLoading ? 'Loading...' : 'Click to load new image'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB (saved when you save template)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Current Image Section */}
                {(templateImagePath || imageUrl) && (
                  <div className="mb-4">
                    <Label className="text-muted-foreground mb-2 block">
                      {uploadedImageFile ? 'Uploaded Image' : 'Template Image'}
                    </Label>
                    <div className="relative">
                      <img
                        src={imageUrl || templateImagePath}
                        alt={
                          uploadedImageFile
                            ? 'Uploaded Image'
                            : 'Template Image'
                        }
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center"
                        style={{ display: 'none' }}
                      >
                        <span className="text-gray-500 text-xs">
                          Image failed to load
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">
                          {uploadedImageFile
                            ? 'Uploaded Image'
                            : 'Current Template Image'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {uploadedImageFile
                        ? 'This is your uploaded image. It will be saved when you save the template.'
                        : 'This is the image from the template. Upload a new image to replace it.'}
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {uploadedImageFile
                    ? 'Your uploaded image is ready for editing. Click "Save Template" to save it permanently.'
                    : templateImagePath
                      ? 'Upload a new image to replace the template image, or edit the current one.'
                      : 'Upload an image to get started. Images are saved when you save the template.'}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
        <main
          className="flex-1 overflow-auto p-8"
          style={getBackgroundStyle(formData.pageBackground)}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Image Editor
              </h1>
              <p className="text-gray-600">
                Edit your image using the powerful Pixie editor
              </p>
            </div>
          </div>
        </main>
        <aside className="w-74 flex-shrink-0 bg-white p-4 border-l border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
          <div className="space-y-6">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">
              Canvas Settings
            </h3>
            <div className="py-3">
              <p className="text-primary fw-500">Canvas Background</p>
              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Color, Gradient, or URL
                </Label>
                <Input
                  type="text"
                  value={formData.background}
                  onChange={(e) =>
                    handleBackgroundChange('background', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
                {/* Background preview */}
                <div
                  className="w-full h-8 mt-2 rounded border"
                  style={getBackgroundStyle(formData.background)}
                />
              </div>
              <hr className="my-3" />
              <p className="text-primary fw-500">Page Background</p>

              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Color, Gradient, or URL
                </Label>
                <Input
                  type="text"
                  value={formData.pageBackground}
                  onChange={(e) =>
                    handleBackgroundChange('pageBackground', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
                {/* Background preview */}
                <div
                  className="w-full h-8 mt-2 rounded border"
                  style={getBackgroundStyle(formData.pageBackground)}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default Step1;
