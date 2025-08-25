# Secure S3 Upload Setup

This document explains how to set up secure S3 uploads using pre-signed URLs in your Next.js application.

## 🔒 Security Features

- **Pre-signed URLs**: AWS credentials never exposed to the client
- **Time-limited access**: URLs expire after 15 minutes
- **Direct upload**: Files upload directly from client to S3
- **File validation**: Server-side and client-side validation
- **Progress tracking**: Real-time upload progress

## 📋 Environment Variables

Add these variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your_bucket_name

# Optional: For S3-compatible services (DigitalOcean Spaces, etc.)
AWS_ENDPOINT=https://your-endpoint.com

# Alternative variable names (for backward compatibility)
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY_ID=your_access_key_id
STORAGE_SECRET_ACCESS_KEY=your_secret_access_key
STORAGE_BUCKET=your_bucket_name
STORAGE_ENDPOINT=https://your-endpoint.com
```

## 🚀 Usage

### 1. Basic Upload Hook

```jsx
import { useS3Upload } from '@/hooks/use-s3-upload';

function MyComponent() {
  const { uploadFile, uploading, uploadProgress, error } = useS3Upload();

  const handleUpload = async (file) => {
    try {
      const result = await uploadFile(file, 'templates');
      console.log('Uploaded:', result.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      {uploading && <p>Uploading: {uploadProgress}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### 2. Reusable Upload Component

```jsx
import { S3UploadComponent } from '@/components/s3-upload-component';

function TemplateForm() {
  const handleUploadComplete = (result) => {
    console.log('Upload complete:', result);
    // result contains: { url, key, fileName, file }
  };

  return (
    <S3UploadComponent
      onUploadComplete={handleUploadComplete}
      directory="templates"
      maxSize={5 * 1024 * 1024} // 5MB
    />
  );
}
```

### 3. Template Integration

```jsx
// In your template creation form
const handleImageUpload = async (uploadResult) => {
  // Store the S3 URL with your template data
  setFormData(prev => ({
    ...prev,
    imageUrl: uploadResult.url,
    imageKey: uploadResult.key
  }));
};

// Save template with image URL
const saveTemplate = async () => {
  const templateData = {
    ...formData,
    imageUrl: uploadedImageUrl, // S3 URL
    imageKey: uploadedImageKey  // S3 key for reference
  };
  
  // Save to your database
  await saveTemplateToDatabase(templateData);
};
```

## 📁 File Structure

```
lib/
├── s3-presigned.js          # S3 client and pre-signed URL generation
hooks/
├── use-s3-upload.js         # React hook for S3 uploads
components/
├── s3-upload-component.jsx  # Reusable upload component
app/
├── api/s3/
│   ├── presigned-url/       # Generate pre-signed URLs
│   └── retrieve/            # Verify uploaded files
└── (protected)/s3-demo/     # Demo page
```

## 🔧 API Endpoints

### POST /api/s3/presigned-url

Generate a pre-signed URL for uploading.

**Request:**
```json
{
  "fileName": "image.jpg",
  "contentType": "image/jpeg",
  "directory": "templates"
}
```

**Response:**
```json
{
  "success": true,
  "presignedUrl": "https://...",
  "key": "templates/unique_filename.jpg",
  "fileName": "unique_filename.jpg",
  "bucket": "your-bucket"
}
```

### POST /api/s3/retrieve

Verify if an uploaded file exists.

**Request:**
```json
{
  "imageUrl": "https://your-bucket.s3.region.amazonaws.com/templates/filename.jpg"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image exists and is accessible",
  "key": "templates/filename.jpg",
  "url": "https://..."
}
```

## 🛡️ Security Best Practices

1. **Environment Variables**: Never commit AWS credentials to version control
2. **IAM Permissions**: Use minimal required permissions for your S3 bucket
3. **CORS Configuration**: Configure CORS on your S3 bucket for your domain
4. **File Validation**: Validate file types and sizes on both client and server
5. **URL Expiration**: Pre-signed URLs expire after 15 minutes

## 🌐 CORS Configuration

Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["https://yourdomain.com"],
    "ExposeHeaders": []
  }
]
```

## 📝 Example S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Error**: Check your S3 bucket CORS configuration
2. **Access Denied**: Verify IAM permissions and bucket policy
3. **URL Expired**: Pre-signed URLs expire after 15 minutes
4. **File Too Large**: Check file size limits (default: 5MB)

### Debug Mode

Enable debug logging by checking the browser console and server logs for detailed error messages.

## 📚 Additional Resources

- [AWS S3 Pre-signed URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
