'use client';

import { useStoreClient, useStoreClientActions } from '@/store/hooks';

/**
 * Compatibility hook that provides the same interface as the old StoreClientContext
 * but uses Redux instead. This allows existing components to work without changes.
 */
export function useStoreClientCompat() {
  const storeClient = useStoreClient();
  const actions = useStoreClientActions();

  // Map Redux state to the old context interface
  const state = {
    isWishlistSheetOpen: storeClient.isWishlistSheetOpen,
    isCartSheetOpen: storeClient.isCartSheetOpen,
    isProductDetailsSheetOpen: storeClient.isProductDetailsSheetOpen,
    productDetailsId: storeClient.productDetailsId,
  };

  // Map Redux actions to the old context interface
  const contextActions = {
    showWishlistSheet: actions.showWishlistSheet,
    closeWishlistSheet: actions.closeWishlistSheet,
    showCartSheet: actions.showCartSheet,
    closeCartSheet: actions.closeCartSheet,
    showProductDetailsSheet: actions.showProductDetailsSheet,
    closeProductDetailsSheet: actions.closeProductDetailsSheet,
    handleAddToCart: ({ productId }) => {
      actions.addToCart({ productId });
    },
  };

  return {
    state,
    ...contextActions,
    // Also provide direct access to Redux state and actions
    cart: storeClient.cart,
    wishlist: storeClient.wishlist,
    products: storeClient.products,
    selectedProduct: storeClient.selectedProduct,
    isLoading: storeClient.isLoading,
    error: storeClient.error,
    // Redux actions
    addToCart: actions.addToCart,
    removeFromCart: actions.removeFromCart,
    updateCartItemQuantity: actions.updateCartItemQuantity,
    clearCart: actions.clearCart,
    addToWishlist: actions.addToWishlist,
    removeFromWishlist: actions.removeFromWishlist,
    clearWishlist: actions.clearWishlist,
    setProducts: actions.setProducts,
    setSelectedProduct: actions.setSelectedProduct,
    setLoading: actions.setLoading,
    setError: actions.setError,
    clearError: actions.clearError,
    resetStoreClient: actions.resetStoreClient,
  };
}
