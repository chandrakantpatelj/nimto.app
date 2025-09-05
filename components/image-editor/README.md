# PixieEditor Component

A React component that provides a powerful image editing interface using the Pixie editor library. This component is built with `forwardRef` to allow direct access to editor methods and state.

## Features

- **forwardRef Support**: Direct access to editor methods through ref
- **Image Upload**: Support for local and external images
- **Content Management**: Load and save editor state
- **Export Functionality**: Export edited images
- **Error Handling**: Comprehensive error states and loading indicators
- **Responsive Design**: Customizable width and height

## Basic Usage

```jsx
import { useRef } from 'react';
import PixieEditor from '@/components/image-editor/PixieEditor';

function MyComponent() {
  const pixieRef = useRef(null);

  const handleSave = async () => {
    if (pixieRef.current) {
      const success = await pixieRef.current.save();
      if (success) {
        console.log('Design saved successfully!');
      }
    }
  };

  const handleExport = async () => {
    if (pixieRef.current) {
      const imageData = await pixieRef.current.export();
      console.log('Exported image:', imageData);
    }
  };

  const addText = () => {
    if (pixieRef.current) {
      pixieRef.current.addText('Hello World!', {
        fontSize: 24,
        fill: '#ff0000',
        left: 100,
        top: 100,
      });
    }
  };

  return (
    <div>
      <PixieEditor
        ref={pixieRef}
        initialImageUrl="https://example.com/image.jpg"
        width="100%"
        height="500px"
        onSave={(state) => {
          console.log('Editor state:', state);
        }}
      />

      <div className="mt-4 space-x-2">
        <button onClick={handleSave}>Save</button>
        <button onClick={handleExport}>Export</button>
        <button onClick={addText}>Add Text</button>
      </div>
    </div>
  );
}
```

## Props

| Prop                 | Type       | Default   | Description                     |
| -------------------- | ---------- | --------- | ------------------------------- |
| `initialImageUrl`    | `string`   | -         | Initial image URL to load       |
| `initialContent`     | `object`   | -         | Initial editor state/content    |
| `onSave`             | `function` | -         | Callback when save is triggered |
| `width`              | `string`   | `'100%'`  | Editor width                    |
| `height`             | `string`   | `'500px'` | Editor height                   |
| `config`             | `object`   | `{}`      | Pixie editor configuration      |
| `onEditorReady`      | `function` | -         | Callback when editor is ready   |
| `initialCanvasState` | `object`   | -         | Initial canvas state            |
| `onImageUpload`      | `function` | -         | Callback for image uploads      |

## Ref Methods

The component exposes the following methods through the ref:

### Core Methods

- `getEditor()` - Get the raw Pixie editor instance
- `getState()` - Get current editor state
- `setState(state)` - Set editor state
- `save()` - Save current state and trigger onSave callback
- `export(options?)` - Export image as data URL
- `clear()` - Clear the editor
- `close()` - Close and cleanup the editor

### Content Methods

- `applyContent(content)` - Apply content to editor
- `addText(text, options)` - Add text element
- `addShape(shape, options)` - Add shape element

### History Methods

- `undo()` - Undo last action
- `redo()` - Redo last undone action

### Utility Methods

- `isReady()` - Check if editor is ready
- `isLoading()` - Check if editor is loading
- `getError()` - Get current error state
- `getImageUrl()` - Get current image URL
- `setImageUrl(url)` - Set new image URL

## Advanced Usage

### Loading External Images

```jsx
<PixieEditor
  ref={pixieRef}
  initialImageUrl="https://external-site.com/image.jpg"
  config={{
    allowExternalImages: true,
    cors: {
      allowExternalImages: true,
      allowCrossOrigin: true,
    },
  }}
/>
```

### Custom Configuration

```jsx
<PixieEditor
  ref={pixieRef}
  initialImageUrl="/local-image.jpg"
  config={{
    tools: {
      zoom: { allowUserZoom: true },
      crop: { allowExternalImages: true },
    },
    ui: {
      nav: {
        replaceDefault: true,
        items: [
          { name: 'text', action: 'text' },
          { name: 'shapes', action: 'shapes' },
        ],
      },
    },
  }}
/>
```

### Handling Image Uploads

```jsx
const handleImageUpload = (file) => {
  console.log('Uploaded file:', file);
  // Handle file upload logic
};

<PixieEditor ref={pixieRef} onImageUpload={handleImageUpload} />;
```

## Error Handling

The component provides comprehensive error handling:

```jsx
const pixieRef = useRef(null);

useEffect(() => {
  if (pixieRef.current) {
    const error = pixieRef.current.getError();
    if (error) {
      console.error('Editor error:', error);
    }
  }
}, []);
```

## Loading States

```jsx
const pixieRef = useRef(null);

useEffect(() => {
  if (pixieRef.current) {
    const loading = pixieRef.current.isLoading();
    if (loading) {
      console.log('Editor is loading...');
    }
  }
}, []);
```

## Migration from Global Variables

If you're migrating from the old global variable approach:

**Old way (Global Variables):**

```jsx
// Global variables - NOT RECOMMENDED
window.pixieEditor.save();
window.pixieRef.current.setState(content);
window.pixieForceSave();
```

**New way (forwardRef):**

```jsx
// Using ref - RECOMMENDED
pixieRef.current.save();
pixieRef.current.setState(content);
pixieRef.current.getState();
```

## Next Button Implementation

Here's how to implement a next button that saves the design and includes the exported image:

```jsx
import { useRef } from 'react';
import PixieEditor from '@/components/image-editor/PixieEditor';

function MyComponent() {
  const pixieRef = useRef(null);

  const handleNext = async () => {
    if (pixieRef.current) {
      try {
        // Save and get complete state with exported image
        const success = await pixieRef.current.save();

        if (success) {
          const currentState = pixieRef.current.getState();

          if (currentState) {
            // Update your state/store with complete data
            updateEventData({
              jsonContent: JSON.stringify(currentState),
              previewImage: currentState.exportedImage || null,
              imageThumbnail: currentState.exportedImage || null,
            });

            console.log('Design saved with exported image');
          }
        }
      } catch (error) {
        console.error('Failed to save design:', error);
      }
    }

    // Proceed to next step
    router.push('/next-step');
  };

  return (
    <div>
      <PixieEditor ref={pixieRef} initialImageUrl="/image.jpg" />
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
```

## Best Practices

1. **Always check if ref is available** before calling methods
2. **Handle async operations** properly (save, export, setState)
3. **Use error handling** to provide user feedback
4. **Clean up** by calling `close()` when component unmounts
5. **Validate content** before applying to editor

## Troubleshooting

### Editor not ready

```jsx
if (pixieRef.current?.isReady()) {
  // Safe to call editor methods
  pixieRef.current.addText('Hello');
}
```

### Export issues

```jsx
try {
  const imageData = await pixieRef.current.export();
} catch (error) {
  console.error('Export failed:', error);
  // Handle fallback
}
```

### State management

```jsx
// Get current state
const currentState = pixieRef.current.getState();

// Apply new state
const success = await pixieRef.current.setState(newState);
if (!success) {
  console.error('Failed to set state');
}
```
