'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface WorkspacePanelContextType {
  isOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
}

const WorkspacePanelContext = createContext<WorkspacePanelContextType | undefined>(undefined);

export function WorkspacePanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openPanel = () => setIsOpen(true);
  const closePanel = () => setIsOpen(false);

  return (
    <WorkspacePanelContext.Provider value={{ isOpen, openPanel, closePanel }}>
      {children}
    </WorkspacePanelContext.Provider>
  );
}

export function useWorkspacePanel() {
  const context = useContext(WorkspacePanelContext);
  if (context === undefined) {
    throw new Error('useWorkspacePanel must be used within a WorkspacePanelProvider');
  }
  return context;
}
