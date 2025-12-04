'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';

interface FellowshipStats {
  daysRemaining: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
}

interface WorkspaceDetails {
  name: string;
  pitch: string;
  tbd: string;
  firstDayWorked: string;
  boostBookLink: string;
  prototypeLink: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [isHoveringPrototype, setIsHoveringPrototype] = useState(false);
  const [isPrototypeLinkModalOpen, setIsPrototypeLinkModalOpen] = useState(false);
  const [prototypeLink, setPrototypeLink] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);

  const [workspaceDetails, setWorkspaceDetails] = useState<WorkspaceDetails>({
    name: 'Ibex',
    pitch: '1 sentence pitch',
    tbd: 'TBD',
    firstDayWorked: 'THE FIRST DAY IT WORKED',
    boostBookLink: 'https://boost.book',
    prototypeLink: '',
  });

  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/fellowship/status');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAddPrototypeLink = () => {
    if (prototypeLink) {
      setWorkspaceDetails({ ...workspaceDetails, prototypeLink });
      setIsPrototypeLinkModalOpen(false);
      setPrototypeLink('');
    }
  };

  const handleEditField = (field: string) => {
    setEditingField(field);
    setEditValue(workspaceDetails[field as keyof WorkspaceDetails] as string);
  };

  const handleSaveField = () => {
    if (editingField) {
      setWorkspaceDetails({
        ...workspaceDetails,
        [editingField]: editValue,
      });
      setEditingField(null);
      setEditValue('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Countdown Timer Header */}
        <header className="px-12 py-4 bg-white border-b border-gray-100">
          <CountdownTimer endDate={stats?.endDate || ''} size="small" />
        </header>

        {/* Content Area */}
        <div className="px-12 pt-8 pb-[100px] flex justify-end">
          {/* Workspace Sidebar */}
          <div
            className="w-[600px] bg-white rounded-lg p-8 fixed right-8 top-24 bottom-8 overflow-y-auto"
            style={{
              boxShadow: '-7px 0 36.19px 0 rgba(0, 0, 0, 0.09)',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => router.back()}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Workspace</h1>

            {/* Prototype Section */}
            <div className="mb-8">
              {!workspaceDetails.prototypeLink ? (
                <div
                  className="relative h-64 bg-gray-200 rounded-lg flex items-center justify-center cursor-pointer group"
                  onMouseEnter={() => setIsHoveringPrototype(true)}
                  onMouseLeave={() => setIsHoveringPrototype(false)}
                  onClick={() => setIsPrototypeLinkModalOpen(true)}
                >
                  {/* Hover Overlay */}
                  {isHoveringPrototype && (
                    <div className="absolute inset-0 bg-black opacity-15 rounded-lg" />
                  )}

                  {/* Text */}
                  <div className="relative z-10 flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Add vibecoded prototype</span>
                  </div>
                </div>
              ) : (
                <div
                  className="relative h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                  onMouseEnter={() => setIsHoveringPrototype(true)}
                  onMouseLeave={() => setIsHoveringPrototype(false)}
                  onClick={() => {
                    setPrototypeLink(workspaceDetails.prototypeLink);
                    setIsPrototypeLinkModalOpen(true);
                  }}
                >
                  <iframe
                    src={workspaceDetails.prototypeLink}
                    className="w-full h-full border-0 pointer-events-none"
                    title="Prototype Preview"
                  />

                  {/* Hover Overlay */}
                  {isHoveringPrototype && (
                    <>
                      <div className="absolute inset-0 bg-black opacity-15 rounded-lg" />
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <span className="text-white font-medium">Edit link</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Workspace Name */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-3xl font-bold text-gray-900">{workspaceDetails.name}</h2>
                <button
                  onClick={() => handleEditField('name')}
                  className="text-green-600 text-sm font-medium hover:text-green-700"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Pitch */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <p className="text-gray-900">{workspaceDetails.pitch}</p>
                <button
                  onClick={() => handleEditField('pitch')}
                  className="text-green-600 text-sm font-medium hover:text-green-700"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* TBD */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-gray-900 font-semibold">{workspaceDetails.tbd}</p>
                  <p className="text-gray-400 text-sm mt-1">{workspaceDetails.firstDayWorked}</p>
                </div>
                <button
                  onClick={() => handleEditField('tbd')}
                  className="text-green-600 text-sm font-medium hover:text-green-700"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Boost Book */}
            <div className="mb-8">
              <a
                href={workspaceDetails.boostBookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 underline inline-flex items-center gap-2 hover:text-gray-600"
              >
                Boost Book
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 my-8" />

            {/* Contributors Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Contributors</h3>
                <button className="text-green-600 text-sm font-medium hover:text-green-700">
                  Edit
                </button>
              </div>

              {/* Contributor 1 */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-medium">
                    GS
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">User</h4>
                    <p className="text-gray-500 text-sm">Founder</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Los Angeles</span>
                  </div>
                  <p>LinkedIn</p>
                  <p>Instagram</p>
                </div>
              </div>

              {/* Contributor 2 */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-medium">
                    ?
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-400">TBD</h4>
                    <p className="text-gray-400 text-sm">Developer</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Location</span>
                  </div>
                  <p>Github</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Prototype Link Modal */}
      {isPrototypeLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Insert link to prototype</h2>

            <div className="mb-6">
              <input
                type="url"
                value={prototypeLink}
                onChange={(e) => setPrototypeLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsPrototypeLinkModalOpen(false);
                  setPrototypeLink('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPrototypeLink}
                className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Field Modal */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Edit {editingField === 'name' ? 'Workspace Name' : editingField === 'pitch' ? 'Pitch' : 'Details'}
            </h2>

            <div className="mb-6">
              {editingField === 'pitch' || editingField === 'tbd' ? (
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                />
              ) : (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setEditingField(null);
                  setEditValue('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveField}
                className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
