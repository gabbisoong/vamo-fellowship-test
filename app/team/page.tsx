'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';
import Image from 'next/image';

interface FellowshipStats {
  daysRemaining: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
}

interface Contributor {
  id: string;
  name: string;
  role: string;
  email: string;
  profilePic?: string;
}

export default function Contributors() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContributor, setEditingContributor] = useState<Contributor | null>(null);

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editProfilePic, setEditProfilePic] = useState<File | null>(null);

  // Form states for adding
  const [addName, setAddName] = useState('');
  const [addRole, setAddRole] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchContributors();
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
    } finally {
      setLoading(false);
    }
  };

  const fetchContributors = async () => {
    // TODO: Implement API call to fetch contributors
    // For now, use session user as founder
    if (session?.user) {
      setContributors([
        {
          id: '1',
          name: session.user.name || 'User',
          role: 'Founder',
          email: session.user.email || '',
          profilePic: session.user.image,
        },
      ]);
    }
  };

  const handleEditClick = (contributor: Contributor) => {
    setEditingContributor(contributor);
    setEditName(contributor.name);
    setEditRole(contributor.role);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to update contributor
    console.log('Updating contributor:', { name: editName, role: editRole, profilePic: editProfilePic });
    setIsEditModalOpen(false);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingInvite(true);

    try {
      // TODO: Implement API call to add contributor and send invite
      console.log('Adding contributor:', { name: addName, role: addRole, email: addEmail });

      if (addEmail) {
        // Send invite email
        console.log('Sending invite to:', addEmail);
      }

      setIsAddModalOpen(false);
      setAddName('');
      setAddRole('');
      setAddEmail('');
    } catch (error) {
      console.error('Error adding contributor:', error);
    } finally {
      setSendingInvite(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

        {/* Main Content Area */}
        <div className="px-12 pt-8 pb-[100px]">
          {/* Title Section */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Contributors</h1>
              <p className="text-gray-500 mt-1">{contributors.length} members</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Manage your team members and their roles
          </p>

          {/* Contributors List */}
          <div className="space-y-4">
            {contributors.map((contributor) => (
              <div
                key={contributor.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white text-xl font-medium overflow-hidden">
                    {contributor.profilePic ? (
                      <Image
                        src={contributor.profilePic}
                        alt={contributor.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(contributor.name)
                    )}
                  </div>

                  {/* Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{contributor.name}</h3>
                    <p className="text-gray-500">{contributor.role}</p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  onClick={() => handleEditClick(contributor)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              </div>
            ))}

            {/* Add Contributor Card */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full bg-white rounded-2xl border-2 border-dashed border-gray-300 p-6 flex items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-gray-600 font-medium">Add contributor</span>
            </button>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditProfilePic(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contributor Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Contributor</h2>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Enter their name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Title
                </label>
                <input
                  type="text"
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  placeholder="What is their role?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  placeholder="What is their email?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send them an invite to join the workspace
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddName('');
                    setAddRole('');
                    setAddEmail('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendingInvite ? 'Adding...' : 'Add Contributor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
