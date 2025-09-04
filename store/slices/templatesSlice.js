import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  templates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,
  categories: [],
  searchQuery: '',
  selectedCategory: null,
  customTemplates: [],
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/template');

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTemplateById = createAsyncThunk(
  'templates/fetchTemplateById',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/template/${templateId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTemplateCategories = createAsyncThunk(
  'templates/fetchTemplateCategories',
  async (_, { rejectWithValue }) => {
    try {
      // For now, return a mock list of categories since the API route doesn't exist
      // TODO: Create /api/template/categories route or extract categories from templates
      const categories = [
        'Birthday',
        'Wedding',
        'Anniversary',
        'Graduation',
        'Corporate',
        'Holiday',
        'Other',
      ];

      return { success: true, data: categories };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const createCustomTemplate = createAsyncThunk(
  'templates/createCustomTemplate',
  async (templateData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/template/create-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to create custom template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const updateTemplate = createAsyncThunk(
  'templates/updateTemplate',
  async ({ templateId, templateData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/template/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteTemplate = createAsyncThunk(
  'templates/deleteTemplate',
  async (templateId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/template/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      return templateId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

// Templates slice
const templatesSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // Filter templates based on search and category
    filterTemplates: (state) => {
      // This would be handled by selectors in a real app
      // For now, we'll just store the filter criteria
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch templates
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch template by ID
      .addCase(fetchTemplateById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplateById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTemplate = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplateById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch categories
      .addCase(fetchTemplateCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplateCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplateCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create custom template
      .addCase(createCustomTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCustomTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customTemplates.push(action.payload);
        state.error = null;
      })
      .addCase(createCustomTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update template
      .addCase(updateTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.templates.findIndex(
          (template) => template.id === action.payload.id,
        );
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
        if (state.selectedTemplate?.id === action.payload.id) {
          state.selectedTemplate = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete template
      .addCase(deleteTemplate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTemplate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = state.templates.filter(
          (template) => template.id !== action.payload,
        );
        if (state.selectedTemplate?.id === action.payload) {
          state.selectedTemplate = null;
        }
        state.error = null;
      })
      .addCase(deleteTemplate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedTemplate,
  setSearchQuery,
  setSelectedCategory,
  clearSelectedTemplate,
  clearError,
  setLoading,
  filterTemplates,
} = templatesSlice.actions;

export default templatesSlice.reducer;
