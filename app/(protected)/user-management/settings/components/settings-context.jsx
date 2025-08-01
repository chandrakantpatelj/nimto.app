'use client';

import { createContext, useContext } from 'react';

const SettingsContext = createContext(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ settings, roles, children }) => {
  return (
    <SettingsContext.Provider value={{ settings, roles }}>
      {children}
    </SettingsContext.Provider>
  );
};
