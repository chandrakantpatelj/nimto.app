import { createSlice } from '@reduxjs/toolkit';

// Initial state for store client (e-commerce functionality)
const initialState = {
  // Sheet states
  isWishlistSheetOpen: false,
  isCartSheetOpen: false,
  isProductDetailsSheetOpen: false,
  productDetailsId: null,

  // Cart state
  cart: {
    items: [],
    total: 0,
    itemCount: 0,
  },

  // Wishlist state
  wishlist: {
    items: [],
    itemCount: 0,
  },

  // Product state
  products: [],
  selectedProduct: null,

  // Loading states
  isLoading: false,
  error: null,
};

const storeClientSlice = createSlice({
  name: 'storeClient',
  initialState,
  reducers: {
    // Sheet management
    showWishlistSheet: (state) => {
      state.isWishlistSheetOpen = true;
    },
    closeWishlistSheet: (state) => {
      state.isWishlistSheetOpen = false;
    },
    showCartSheet: (state) => {
      state.isCartSheetOpen = true;
    },
    closeCartSheet: (state) => {
      state.isCartSheetOpen = false;
    },
    showProductDetailsSheet: (state, action) => {
      state.isProductDetailsSheetOpen = true;
      state.productDetailsId = action.payload;
    },
    closeProductDetailsSheet: (state) => {
      state.isProductDetailsSheetOpen = false;
      state.productDetailsId = null;
    },

    // Cart management
    addToCart: (state, action) => {
      const { productId, quantity = 1, product } = action.payload;

      // Check if item already exists in cart
      const existingItem = state.cart.items.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
      } else {
        // Add new item
        state.cart.items.push({
          productId,
          quantity,
          product: product || { id: productId, name: `Product ${productId}` },
          addedAt: new Date().toISOString(),
        });
      }

      // Update totals
      state.cart.itemCount = state.cart.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.cart.total = state.cart.items.reduce((total, item) => {
        return total + (item.product.price || 0) * item.quantity;
      }, 0);

      // Open cart sheet
      state.isCartSheetOpen = true;
    },

    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cart.items = state.cart.items.filter(
        (item) => item.productId !== productId,
      );

      // Update totals
      state.cart.itemCount = state.cart.items.reduce(
        (total, item) => total + item.quantity,
        0,
      );
      state.cart.total = state.cart.items.reduce((total, item) => {
        return total + (item.product.price || 0) * item.quantity;
      }, 0);
    },

    updateCartItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cart.items.find(
        (item) => item.productId === productId,
      );

      if (item) {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          state.cart.items = state.cart.items.filter(
            (item) => item.productId !== productId,
          );
        } else {
          item.quantity = quantity;
        }

        // Update totals
        state.cart.itemCount = state.cart.items.reduce(
          (total, item) => total + item.quantity,
          0,
        );
        state.cart.total = state.cart.items.reduce((total, item) => {
          return total + (item.product.price || 0) * item.quantity;
        }, 0);
      }
    },

    clearCart: (state) => {
      state.cart = {
        items: [],
        total: 0,
        itemCount: 0,
      };
    },

    // Wishlist management
    addToWishlist: (state, action) => {
      const { productId, product } = action.payload;

      // Check if item already exists in wishlist
      const existingItem = state.wishlist.items.find(
        (item) => item.productId === productId,
      );

      if (!existingItem) {
        state.wishlist.items.push({
          productId,
          product: product || { id: productId, name: `Product ${productId}` },
          addedAt: new Date().toISOString(),
        });

        state.wishlist.itemCount = state.wishlist.items.length;
      }
    },

    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.wishlist.items = state.wishlist.items.filter(
        (item) => item.productId !== productId,
      );
      state.wishlist.itemCount = state.wishlist.items.length;
    },

    clearWishlist: (state) => {
      state.wishlist = {
        items: [],
        itemCount: 0,
      };
    },

    // Product management
    setProducts: (state, action) => {
      state.products = action.payload;
    },

    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },

    // Loading and error states
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset store client state
    resetStoreClient: (state) => {
      return initialState;
    },
  },
});

export const {
  // Sheet management
  showWishlistSheet,
  closeWishlistSheet,
  showCartSheet,
  closeCartSheet,
  showProductDetailsSheet,
  closeProductDetailsSheet,

  // Cart management
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,

  // Wishlist management
  addToWishlist,
  removeFromWishlist,
  clearWishlist,

  // Product management
  setProducts,
  setSelectedProduct,

  // Loading and error states
  setLoading,
  setError,
  clearError,

  // Reset
  resetStoreClient,
} = storeClientSlice.actions;

export default storeClientSlice.reducer;
