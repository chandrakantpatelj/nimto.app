# Template Image Update Functionality

This document describes the enhanced template image update functionality that provides proper S3 bucket handling, unique image paths, and automatic cleanup.

## Overview

The template image update system now provides:
- **Immediate upload**: Images are uploaded to S3 immediately when selected
- **Unique paths**: Each image gets a unique path to prevent conflicts
- **S3 verification**: Checks if images exist in S3 before operations
- **Automatic cleanup**: Old images are automatically deleted from S3
- **Database sync**: Image paths are properly updated in the database

## API Endpoints

### POST `/api/template/[id]/update-image`
Updates template image with edited data from Pixie editor.

**Request Body:**
```json
{
  "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "imageFormat": "png",
  "originalFileName": "template.png"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template-id",
    "name": "Template Name",
    "imagePath": "templates/template_123_1703123456789_abc123.png",
    "imageUrl": "https://bucket.s3.region.amazonaws.com/bucket/templates/...",
    "oldImageDeleted": true,
    "message": "Image updated successfully"
  }
}
```

### PUT `/api/template/[id]/update-image`
Uploads a new image file to replace the existing template image.

**Request:** FormData with `image` field containing the file.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "template-id",
    "name": "Template Name",
    "imagePath": "templates/template_123_1703123456789_abc123.jpg",
    "imageUrl": "https://bucket.s3.region.amazonaws.com/bucket/templates/...",
    "oldImageDeleted": true,
    "message": "Image uploaded successfully"
  }
}
```

## Key Features

### 1. Unique Image Path Generation
```javascript
function generateUniqueImagePath(templateId, originalFileName, imageFormat = 'png') {
  const timestamp = Date.now();
  const uniqueId = uid();
  const extension = imageFormat || originalFileName?.split('.').pop() || 'png';
  const filename = `template_${templateId}_${timestamp}_${uniqueId}.${extension}`;
  return `templates/${filename}`;
}
```

### 2. S3 Verification
```javascript
async function checkImageExists(s3Client, bucket, key) {
  try {
    await s3Client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}
```

### 3. Automatic Cleanup
```javascript
async function deleteImageFromS3(s3Client, bucket, key) {
  try {
    await s3Client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    console.log(`Deleted image from S3: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete image from S3: ${key}`, error);
    return false;
  }
}
```

## Frontend Integration

### Updated Hook (`useTemplateImage`)
The hook now uses the new update-image API endpoints:

```javascript
// Save edited image from Pixie
const saveTemplateImage = useCallback(async (templateId, imageData, imageFormat = 'png') => {
  const response = await fetch(`/api/template/${templateId}/update-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageData, imageFormat }),
  });
  return response.json();
}, []);

// Upload new image file
const uploadTemplateImage = useCallback(async (templateId, file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch(`/api/template/${templateId}/update-image`, {
    method: 'PUT',
    body: formData,
  });
  return response.json();
}, []);
```

### Template Design Page
The template design page now:
- Uploads images immediately when selected
- Shows loading states during upload
- Provides clear feedback about image status
- Handles both new uploads and Pixie edits

## File Structure

```
app/api/template/[id]/update-image/route.js  # New API route
hooks/use-template-image.js                 # Updated hook
app/(blank-layout)/templates/design/[id]/page.jsx  # Updated UI
lib/s3-presigned.js                         # Enhanced S3 utilities
```

## Environment Variables

Required environment variables for S3 integration:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name

# Alternative S3-compatible service (e.g., DigitalOcean Spaces)
STORAGE_ACCESS_KEY_ID=your_access_key
STORAGE_SECRET_ACCESS_KEY=your_secret_key
STORAGE_REGION=nyc3
STORAGE_BUCKET=your_bucket_name
STORAGE_ENDPOINT=https://nyc3.digitaloceanspaces.com
```

## Error Handling

The system provides comprehensive error handling:

1. **File validation**: Type and size checks
2. **S3 errors**: Network and permission issues
3. **Database errors**: Template not found or update failures
4. **User feedback**: Clear error messages and loading states

## Security Features

- **Authentication**: All endpoints require valid session
- **File validation**: Only image files allowed (JPG, PNG, GIF, WebP)
- **Size limits**: Maximum 5MB per image
- **Unique paths**: Prevents path traversal attacks
- **S3 verification**: Ensures operations only on existing files

## Testing

Run the test script to verify functionality:

```bash
node scripts/test-image-update.js
```

This will check:
- API route existence and methods
- Hook integration
- Frontend functionality
- S3 integration points

## Migration Notes

The new system is backward compatible but provides enhanced functionality:

1. **Old images**: Will continue to work but won't have automatic cleanup
2. **Database**: No schema changes required
3. **API**: Old endpoints still work but new ones provide better features
4. **Frontend**: Enhanced user experience with immediate feedback

## Troubleshooting

### Common Issues

1. **S3 Permission Errors**
   - Check AWS credentials and bucket permissions
   - Ensure bucket allows public read access for images

2. **Image Not Loading**
   - Verify S3 bucket configuration
   - Check image path in database
   - Ensure proper URL generation

3. **Upload Failures**
   - Check file size (max 5MB)
   - Verify file type (images only)
   - Ensure network connectivity

### Debug Logs

The system provides detailed logging:
- S3 operations (upload, delete, verify)
- Image path generation
- Error details with stack traces
- User action tracking
