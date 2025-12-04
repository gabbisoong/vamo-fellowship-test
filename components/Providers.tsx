'use client';

import { SessionProvider } from 'next-auth/react';
import { WorkspacePanelProvider, useWorkspacePanel } from '@/contexts/WorkspacePanelContext';
import WorkspacePanel from './WorkspacePanel';

function WorkspacePanelWrapper() {
  const { isOpen, closePanel } = useWorkspacePanel();
  return <WorkspacePanel isOpen={isOpen} onClose={closePanel} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WorkspacePanelProvider>
        {children}
        <WorkspacePanelWrapper />
      </WorkspacePanelProvider>
    </SessionProvider>
  );
}
