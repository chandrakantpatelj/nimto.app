'use client';

import { createContext, useContext } from 'react';

const AccountContext = createContext(undefined);

const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within a AccountProvider');
  }
  return context;
};

const AccountProvider = ({ user, children }) => {
  return (
    <AccountContext.Provider value={{ user }}>
      {children}
    </AccountContext.Provider>
  );
};

export { AccountProvider, useAccount };
