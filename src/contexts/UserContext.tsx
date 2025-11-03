import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  memberName: string | null;
  setMemberName: (name: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [memberName, setMemberName] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ memberName, setMemberName }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

