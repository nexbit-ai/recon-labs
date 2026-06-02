import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  memberName: string | null;
  setMemberName: (name: string | null) => void;
  selectedOrganization: string;
  setSelectedOrganization: (org: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [memberName, setMemberName] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganizationState] = useState<string>(() => {
    try {
      return localStorage.getItem('selected_organization') || 'ACME';
    } catch {
      return 'ACME';
    }
  });

  const setSelectedOrganization = (org: string) => {
    setSelectedOrganizationState(org);
    try {
      localStorage.setItem('selected_organization', org);
    } catch {}
  };

  return (
    <UserContext.Provider value={{
      memberName,
      setMemberName,
      selectedOrganization,
      setSelectedOrganization
    }}>
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
