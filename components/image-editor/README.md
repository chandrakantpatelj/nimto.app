# Pixie Image Editor Integration

This directory contains the React components and configuration for integrating the Pixie image editor into the Next.js application.

## Setup

The Pixie editor has been set up as a local module in `local_modules/pixie/`. The necessary assets have been copied to `public/pixie-assets/` for web access.

## Components

### PixieEditor

The main React component that wraps the Pixie editor.

**Props:**
- `imageUrl` (string, optional): URL of the image to load
- `onSave` (function, optional): Callback when saving the image
- `onCancel` (function, optional): Callback when canceling
- `width` (string, default: '100%'): Width of the editor container
- `height` (string, default: '600px'): Height of the editor container
- `config` (object, optional): Additional Pixie configuration

**Usage:**
```jsx
import PixieEditor from '@/components/image-editor/PixieEditor';

<PixieEditor
  imageUrl="/path/to/image.jpg"
  onSave={(state) => console.log('Save state:', state)}
  onCancel={() => console.log('Cancelled')}
  height="700px"
/>
```

## Pages

### `/image-editor`
Main image editor page that accepts an optional `image` query parameter.

### `/image-editor/demo`
Demo page with sample images to test the editor.

## API Endpoints

### `POST /api/save-image`
Handles saving image states from the editor.

**Request Body:**
```json
{
  "state": "pixie_state_json_string",
  "imageName": "optional_image_name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Image saved successfully",
  "imageUrl": "/api/images/timestamp.png"
}
```

## Configuration

The Next.js configuration has been updated to:
- Handle local module imports with `@pixie` alias
- Serve Pixie assets from `/pixie-assets/`
- Handle UMD module loading

## Features

- Full-featured image editing with Pixie
- React component wrapper with proper lifecycle management
- Error handling and loading states
- Save/cancel functionality
- Responsive design
- TypeScript support (via Pixie's built-in types)

## Notes

- The Pixie editor is loaded dynamically to avoid SSR issues
- Assets are served from the public directory for better performance
- The editor supports all Pixie features including filters, text, shapes, etc.
- Remember to handle the saved state appropriately in your application logic
