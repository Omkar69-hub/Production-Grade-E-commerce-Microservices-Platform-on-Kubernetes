import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';

const createNoopStorage = () => {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
};

const customStorage = typeof window !== 'undefined' ? {
  getItem(key: string) {
    return Promise.resolve(localStorage.getItem(key));
  },
  setItem(key: string, value: string) {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem(key: string) {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
} : createNoopStorage();

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
});

const persistConfig = {
  key: 'root',
  storage: customStorage,
  whitelist: ['cart'], // Fix 4: auth state must strictly remain in memory and never be persisted to browser storage
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
