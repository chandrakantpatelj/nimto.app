import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  // Current design being edited
  currentDesign: null,
  designHistory: [],
  historyIndex: -1,

  // Design editor state
  editorState: {
    isOpen: false,
    isLoading: false,
    selectedTool: 'select',
    zoom: 1,
    canvasSize: { width: 800, height: 600 },
    selectedElements: [],
    clipboard: null,
  },

  // Design elements
  elements: [],
  selectedElement: null,

  // Templates and assets
  templates: [],
  assets: {
    images: [],
    fonts: [],
    icons: [],
    shapes: [],
  },

  // Upload state
  uploadState: {
    isUploading: false,
    progress: 0,
    error: null,
  },

  // Design settings
  settings: {
    autoSave: true,
    gridEnabled: true,
    snapToGrid: true,
    showRulers: true,
    showGuides: true,
  },

  // Error handling
  error: null,
  isLoading: false,
};

// Async thunks
export const saveDesign = createAsyncThunk(
  'design/saveDesign',
  async (designData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
      });

      if (!response.ok) {
        throw new Error('Failed to save design');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const loadDesign = createAsyncThunk(
  'design/loadDesign',
  async (designId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/designs/${designId}`);

      if (!response.ok) {
        throw new Error('Failed to load design');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateDesign = createAsyncThunk(
  'design/updateDesign',
  async ({ designId, designData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/designs/${designId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(designData),
      });

      if (!response.ok) {
        throw new Error('Failed to update design');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const uploadAsset = createAsyncThunk(
  'design/uploadAsset',
  async ({ file, type }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/designs/assets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload asset');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchAssets = createAsyncThunk(
  'design/fetchAssets',
  async (type, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/designs/assets/${type}`);

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      const data = await response.json();
      return { type, assets: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Design slice
const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    // Design editor actions
    openEditor: (state) => {
      state.editorState.isOpen = true;
    },
    closeEditor: (state) => {
      state.editorState.isOpen = false;
    },
    setSelectedTool: (state, action) => {
      state.editorState.selectedTool = action.payload;
    },
    setZoom: (state, action) => {
      state.editorState.zoom = action.payload;
    },
    setCanvasSize: (state, action) => {
      state.editorState.canvasSize = action.payload;
    },

    // Design elements
    addElement: (state, action) => {
      const element = {
        id: Date.now().toString(),
        ...action.payload,
        createdAt: new Date().toISOString(),
      };
      state.elements.push(element);
      state.selectedElement = element.id;
    },
    updateElement: (state, action) => {
      const { id, updates } = action.payload;
      const element = state.elements.find((el) => el.id === id);
      if (element) {
        Object.assign(element, updates);
        element.updatedAt = new Date().toISOString();
      }
    },
    removeElement: (state, action) => {
      state.elements = state.elements.filter((el) => el.id !== action.payload);
      if (state.selectedElement === action.payload) {
        state.selectedElement = null;
      }
    },
    selectElement: (state, action) => {
      state.selectedElement = action.payload;
    },
    clearSelection: (state) => {
      state.selectedElement = null;
      state.editorState.selectedElements = [];
    },

    // Design history (undo/redo)
    saveToHistory: (state) => {
      const currentState = {
        elements: JSON.parse(JSON.stringify(state.elements)),
        timestamp: new Date().toISOString(),
      };

      // Remove any history after current index
      state.designHistory = state.designHistory.slice(
        0,
        state.historyIndex + 1,
      );

      // Add new state
      state.designHistory.push(currentState);
      state.historyIndex = state.designHistory.length - 1;

      // Limit history size
      if (state.designHistory.length > 50) {
        state.designHistory.shift();
        state.historyIndex--;
      }
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const previousState = state.designHistory[state.historyIndex];
        state.elements = JSON.parse(JSON.stringify(previousState.elements));
      }
    },
    redo: (state) => {
      if (state.historyIndex < state.designHistory.length - 1) {
        state.historyIndex++;
        const nextState = state.designHistory[state.historyIndex];
        state.elements = JSON.parse(JSON.stringify(nextState.elements));
      }
    },

    // Clipboard operations
    copyToClipboard: (state) => {
      if (state.selectedElement) {
        const element = state.elements.find(
          (el) => el.id === state.selectedElement,
        );
        if (element) {
          state.editorState.clipboard = JSON.parse(JSON.stringify(element));
        }
      }
    },
    pasteFromClipboard: (state) => {
      if (state.editorState.clipboard) {
        const newElement = {
          ...state.editorState.clipboard,
          id: Date.now().toString(),
          x: (state.editorState.clipboard.x || 0) + 10,
          y: (state.editorState.clipboard.y || 0) + 10,
        };
        state.elements.push(newElement);
        state.selectedElement = newElement.id;
      }
    },

    // Design settings
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload };
    },

    // Upload state
    setUploadProgress: (state, action) => {
      state.uploadState.progress = action.payload;
    },
    setUploading: (state, action) => {
      state.uploadState.isUploading = action.payload;
    },

    // Clear state
    clearDesign: (state) => {
      state.currentDesign = null;
      state.elements = [];
      state.selectedElement = null;
      state.designHistory = [];
      state.historyIndex = -1;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Save design
      .addCase(saveDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDesign = action.payload;
        state.error = null;
      })
      .addCase(saveDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Load design
      .addCase(loadDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDesign = action.payload;
        state.elements = action.payload.elements || [];
        state.error = null;
      })
      .addCase(loadDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update design
      .addCase(updateDesign.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDesign.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentDesign = action.payload;
        state.error = null;
      })
      .addCase(updateDesign.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Upload asset
      .addCase(uploadAsset.pending, (state) => {
        state.uploadState.isUploading = true;
        state.uploadState.progress = 0;
        state.uploadState.error = null;
      })
      .addCase(uploadAsset.fulfilled, (state, action) => {
        state.uploadState.isUploading = false;
        state.uploadState.progress = 100;
        state.assets[action.payload.type].push(action.payload.asset);
        state.uploadState.error = null;
      })
      .addCase(uploadAsset.rejected, (state, action) => {
        state.uploadState.isUploading = false;
        state.uploadState.error = action.payload;
      })
      // Fetch assets
      .addCase(fetchAssets.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assets[action.payload.type] = action.payload.assets;
        state.error = null;
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  // Editor
  openEditor,
  closeEditor,
  setSelectedTool,
  setZoom,
  setCanvasSize,

  // Elements
  addElement,
  updateElement,
  removeElement,
  selectElement,
  clearSelection,

  // History
  saveToHistory,
  undo,
  redo,

  // Clipboard
  copyToClipboard,
  pasteFromClipboard,

  // Settings
  updateSettings,

  // Upload
  setUploadProgress,
  setUploading,

  // Clear
  clearDesign,
  clearError,
  setLoading,
} = designSlice.actions;

export default designSlice.reducer;
