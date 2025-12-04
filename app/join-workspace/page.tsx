'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Workspace {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  _count: {
    members: number;
  };
}

export default function JoinWorkspace() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'search' | 'confirm'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setWorkspaces([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/workspace/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        setWorkspaces(data.workspaces || []);
      } catch (error) {
        console.error('Error searching workspaces:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectWorkspace = (workspace: Workspace) => {
    setSelectedWorkspace(workspace);
    setStep('confirm');
  };

  const handleJoinWorkspace = async () => {
    if (!selectedWorkspace) return;

    setJoining(true);
    setError('');

    try {
      const response = await fetch('/api/workspace/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: selectedWorkspace.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successfully joined, redirect to dashboard
        router.push('/');
        router.refresh();
      } else {
        setError(data.error || 'Failed to join workspace');
      }
    } catch (error) {
      console.error('Error joining workspace:', error);
      setError('An error occurred while joining the workspace');
    } finally {
      setJoining(false);
    }
  };

  const handleBack = () => {
    setStep('search');
    setSelectedWorkspace(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-12 text-center">
          <Image
            src="/logo.svg"
            alt="Vamo Fellowship"
            width={150}
            height={55}
            className="mx-auto"
            priority
          />
        </div>

        {step === 'search' ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Find your workspace
              </h1>
              <p className="text-lg text-gray-600">
                Enter your workspace name to get started with Vamo Fellowship.
              </p>
            </div>

            {/* Search Input */}
            <div>
              <label htmlFor="workspace" className="block text-sm font-medium text-gray-700 mb-2">
                Workspace name
              </label>
              <input
                id="workspace"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. acme-company"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
                autoFocus
              />
            </div>

            {/* Search Results */}
            {loading && (
              <div className="text-center py-4 text-gray-600">
                Searching...
              </div>
            )}

            {!loading && searchQuery.trim().length > 0 && workspaces.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-2">No workspaces found matching "{searchQuery}"</p>
                <p className="text-sm">Try a different name or contact your admin</p>
              </div>
            )}

            {!loading && workspaces.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  Select a workspace:
                </p>
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => handleSelectWorkspace(workspace)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-semibold text-gray-900">
                      {workspace.displayName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {workspace.name} • {workspace._count.members} members
                    </div>
                    {workspace.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {workspace.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                Is this your workspace?
              </h1>
              <p className="text-lg text-gray-600">
                Make sure this is the right workspace before joining.
              </p>
            </div>

            {/* Selected Workspace Card */}
            {selectedWorkspace && (
              <div className="border-2 border-gray-900 rounded-lg p-6 bg-gray-50">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                    {selectedWorkspace.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {selectedWorkspace.displayName}
                    </div>
                    <div className="text-gray-600">
                      {selectedWorkspace.name}
                    </div>
                  </div>
                </div>
                {selectedWorkspace.description && (
                  <p className="text-gray-700 mb-3">
                    {selectedWorkspace.description}
                  </p>
                )}
                <div className="text-sm text-gray-600">
                  {selectedWorkspace._count.members} members
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleJoinWorkspace}
                disabled={joining}
                className="w-full py-3 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joining ? 'Joining...' : 'Join Workspace'}
              </button>
              <button
                onClick={handleBack}
                disabled={joining}
                className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Try a Different Workspace
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                Can't find your workspace?{' '}
                <a href="mailto:support@vamo.com" className="text-gray-900 underline">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        )}

        {/* User Info */}
        {session?.user && (
          <div className="mt-12 text-center text-sm text-gray-600">
            Signed in as {session.user.email}
          </div>
        )}
      </div>
    </div>
  );
}
