import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// Import slices
import authSlice from './slices/authSlice';
import designSlice from './slices/designSlice';
import eventsSlice from './slices/eventsSlice';
import guestsSlice from './slices/guestsSlice';
import storeClientSlice from './slices/storeClientSlice';
import templatesSlice from './slices/templatesSlice';
import uiSlice from './slices/uiSlice';

// Persist config
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Temporarily exclude events to debug
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  events: eventsSlice,
  templates: templatesSlice,
  ui: uiSlice,
  guests: guestsSlice,
  design: designSlice,
  storeClient: storeClientSlice,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredPaths: ['_persist'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// Persistor
export const persistor = persistStore(store);

// Export types for TypeScript (if needed later)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
