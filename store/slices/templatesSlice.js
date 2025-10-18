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
  // Featured templates cache
  featuredTemplates: [],
  featuredTemplatesLoading: false,
  featuredTemplatesError: null,
  featuredTemplatesLastFetched: null,
  // Pagination state
  pagination: {
    total: 0,
    limit: 12,
    offset: 0,
    pageCount: 0,
    currentPage: 1,
  },
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
export const fetchFeaturedTemplates = createAsyncThunk(
  'templates/fetchFeaturedTemplates',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const { featuredTemplatesLastFetched } = state.templates;

      // Check if we have cached data that's less than 5 minutes old
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      const now = Date.now();

      if (
        featuredTemplatesLastFetched &&
        now - featuredTemplatesLastFetched < CACHE_DURATION
      ) {
        // Return cached data from state
        return state.templates.featuredTemplates;
      }

    const response = await fetch('/api/template?limit=12&isFeatured=true');

      if (!response.ok) {
        throw new Error('Failed to fetch featured templates');
      }

      const result = await response.json();

      if (result.success) {
        return {
          templates: result.data || [],
          timestamp: now,
        };
      } else {
        throw new Error(result.error || 'Failed to fetch featured templates');
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchTemplates = createAsyncThunk(
  'templates/fetchTemplates',
  async (queryParams, { rejectWithValue }) => {
    const params = queryParams || '';
    try {
      // Build URL with query parameters
      const url = params ? `/api/template?${params}` : '/api/template';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const result = await response.json();

      if (result.success) {
        console.log('📦 Redux: API response:', result);
        // Return both templates and pagination data
        return {
          templates: result.data || [],
          pagination: result.pagination || {
            total: result.data?.length || 0,
            limit: 12,
            offset: 0,
            pageCount: 1,
            currentPage: 1,
          },
        };
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
    clearFeaturedTemplatesError: (state) => {
      state.featuredTemplatesError = null;
    },
    clearFeaturedTemplatesCache: (state) => {
      state.featuredTemplates = [];
      state.featuredTemplatesLastFetched = null;
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
    // Set pagination state
    setPagination: (state, action) => {
      console.log('🔄 Redux: Updating pagination state:', action.payload);
      state.pagination = { ...state.pagination, ...action.payload };
      console.log('✅ Redux: New pagination state:', state.pagination);
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

        // Store API response in Redux templates store
        state.templates = action.payload?.templates || [];

        // Store pagination data
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }

        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch featured templates
      .addCase(fetchFeaturedTemplates.pending, (state) => {
        state.featuredTemplatesLoading = true;
        state.featuredTemplatesError = null;
      })
      .addCase(fetchFeaturedTemplates.fulfilled, (state, action) => {
        state.featuredTemplatesLoading = false;
        // Handle both cached and fresh data
        if (action.payload.templates) {
          // Fresh data from API
          state.featuredTemplates = action.payload.templates;
          state.featuredTemplatesLastFetched = action.payload.timestamp;
        } else {
          // Cached data (already in state)
          state.featuredTemplates = action.payload;
        }
        state.featuredTemplatesError = null;
      })
      .addCase(fetchFeaturedTemplates.rejected, (state, action) => {
        state.featuredTemplatesLoading = false;
        state.featuredTemplatesError = action.payload;
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
  clearFeaturedTemplatesError,
  clearFeaturedTemplatesCache,
  setLoading,
  setActiveFilters,
  clearActiveFilters,
  clearAllTemplates,
  filterTemplates,
  setPagination,
} = templatesSlice.actions;

export default templatesSlice.reducer;
