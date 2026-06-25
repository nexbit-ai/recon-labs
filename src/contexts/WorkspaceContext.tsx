import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export type WorkspaceMode = 'b2b' | 'b2c';

interface WorkspaceContextType {
  workspace: WorkspaceMode;
  setWorkspace: (mode: WorkspaceMode) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspace, setWorkspaceState] = useState<WorkspaceMode>(() => {
    try {
      const stored = localStorage.getItem('workspace_mode');
      if (stored === 'b2b' || stored === 'b2c') return stored;
    } catch {}
    return 'b2c';
  });

  const setWorkspace = useCallback((mode: WorkspaceMode) => {
    setWorkspaceState(mode);
    try {
      localStorage.setItem('workspace_mode', mode);
    } catch {}
  }, []);

  return (
    <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
