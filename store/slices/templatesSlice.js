import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  templates: [], // All templates from all API calls
  selectedTemplate: null,
  isLoading: false,
  error: null,
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  searchQuery: '',
  selectedCategory: null,
  customTemplates: [],
  // Active filters state for persistence
  activeFilters: {
    searchQuery: '',
    selectedCategory: null,
    orientation: null,
    premium: null,
    trending: false,
    featured: false,
    new: false,
  },
};

// Async thunks
export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (queryParams = '', { rejectWithValue }) => {
    try {
      // Build URL with query parameters
      const url = queryParams
        ? `/api/template?${queryParams}`
        : '/api/template';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const result = await response.json();

      if (result.success) {
        return result.data; // Return only the templates array
      } else {
        throw new Error(result.error || 'Failed to fetch templates');
      }
    } catch (error) {
      console.error('❌ Redux: Error fetching templates:', error);
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

      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTemplateCategories = createAsyncThunk(
  'templates/fetchTemplateCategories',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux: Fetching template categories from API...');

      const response = await fetch('/api/template-categories');

      if (!response.ok) {
        throw new Error('Failed to fetch template categories');
      }

      const result = await response.json();
      console.log('📦 Redux: Categories API Response:', result);

      if (result.success) {
        console.log(
          '✅ Redux: Categories fetched successfully:',
          result.data.length,
          'categories',
        );
        return result.data; // Return only the categories array
      } else {
        throw new Error(result.error || 'Failed to fetch template categories');
      }
    } catch (error) {
      console.error('❌ Redux: Error fetching categories:', error);
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
      state.activeFilters.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
      state.activeFilters.selectedCategory = action.payload;
    },
    clearSelectedTemplate: (state) => {
      state.selectedTemplate = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCategoriesError: (state) => {
      state.categoriesError = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    // New actions for active filters management
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
      // Also update individual filter states for backward compatibility
      if (action.payload.searchQuery !== undefined) {
        state.searchQuery = action.payload.searchQuery;
      }
      if (action.payload.selectedCategory !== undefined) {
        state.selectedCategory = action.payload.selectedCategory;
      }
    },
    clearActiveFilters: (state) => {
      state.activeFilters = {
        searchQuery: '',
        selectedCategory: null,
        orientation: null,
        premium: null,
        trending: false,
        featured: false,
        new: false,
      };
      state.searchQuery = '';
      state.selectedCategory = null;
    },
    // Clear all templates (useful for fresh start)
    clearAllTemplates: (state) => {
      state.templates = [];
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

        // Store API response in Redux templates store (accumulate instead of replace)

        // Add only new templates to avoid duplicates

        // Accumulate templates from all API calls
        state.templates = action.payload || [];
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
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchTemplateCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
        state.categoriesError = null;
      })
      .addCase(fetchTemplateCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload;
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
  clearCategoriesError,
  setLoading,
  setActiveFilters,
  clearActiveFilters,
  clearAllTemplates,
  filterTemplates,
} = templatesSlice.actions;

export default templatesSlice.reducer;
