'use client';

import { useState, useEffect } from 'react';

interface WorkspacePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WorkspaceDetails {
  name: string;
  pitch: string;
  tbd: string;
  firstDayWorked: string;
  boostBookLink: string;
  prototypeLink: string;
}

interface Contributor {
  id: string;
  name: string;
  role: string;
  location: string;
  timezone: string;
  email: string;
  linkedin?: string;
  github?: string;
}

export default function WorkspacePanel({ isOpen, onClose }: WorkspacePanelProps) {
  const [isHoveringPrototype, setIsHoveringPrototype] = useState(false);
  const [isPrototypeLinkModalOpen, setIsPrototypeLinkModalOpen] = useState(false);
  const [prototypeLink, setPrototypeLink] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isEditingContributors, setIsEditingContributors] = useState(false);
  const [editingContributorId, setEditingContributorId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [workspaceDetails, setWorkspaceDetails] = useState<WorkspaceDetails>({
    name: 'Ibex',
    pitch: '1 sentence pitch',
    tbd: 'TBD',
    firstDayWorked: 'THE FIRST DAY IT WORKED',
    boostBookLink: 'https://boost.book',
    prototypeLink: '',
  });

  const [contributors, setContributors] = useState<Contributor[]>([
    {
      id: '1',
      name: 'Gabbi Soong',
      role: 'Founder',
      location: 'Los Angeles',
      timezone: 'America/Los_Angeles',
      email: 'gabbi@example.com',
      linkedin: 'https://linkedin.com/in/gabbi',
    },
    {
      id: '2',
      name: 'TBD',
      role: 'Developer',
      location: 'Location',
      timezone: 'America/New_York',
      email: 'dev@example.com',
      github: 'https://github.com/dev',
    },
  ]);

  const [editValue, setEditValue] = useState('');
  const [contributorForm, setContributorForm] = useState({
    name: '',
    role: '',
    location: '',
    timezone: '',
    email: '',
    linkedin: '',
    github: '',
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getLocalTime = (timezone: string) => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone,
      }).format(currentTime);
    } catch (error) {
      return 'Time';
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

  const handleEditContributor = (contributor: Contributor) => {
    setEditingContributorId(contributor.id);
    setContributorForm({
      name: contributor.name,
      role: contributor.role,
      location: contributor.location,
      timezone: contributor.timezone,
      email: contributor.email,
      linkedin: contributor.linkedin || '',
      github: contributor.github || '',
    });
    setIsEditingContributors(true);
  };

  const handleSaveContributor = () => {
    if (editingContributorId) {
      setContributors(
        contributors.map((c) =>
          c.id === editingContributorId
            ? { ...c, ...contributorForm }
            : c
        )
      );
    }
    setIsEditingContributors(false);
    setEditingContributorId(null);
    setContributorForm({
      name: '',
      role: '',
      location: '',
      timezone: '',
      email: '',
      linkedin: '',
      github: '',
    });
  };

  const handleAddContributor = () => {
    const newContributor: Contributor = {
      id: Date.now().toString(),
      ...contributorForm,
    };
    setContributors([...contributors, newContributor]);
    setIsEditingContributors(false);
    setContributorForm({
      name: '',
      role: '',
      location: '',
      timezone: '',
      email: '',
      linkedin: '',
      github: '',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 w-[600px] bg-white z-50 overflow-y-auto p-8 transform transition-transform duration-300 ease-in-out"
        style={{
          boxShadow: '-7px 0 36.19px 0 rgba(0, 0, 0, 0.09)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
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
            <button
              onClick={() => {
                setEditingContributorId(null);
                setContributorForm({
                  name: '',
                  role: '',
                  location: '',
                  timezone: '',
                  email: '',
                  linkedin: '',
                  github: '',
                });
                setIsEditingContributors(true);
              }}
              className="text-green-600 text-sm font-medium hover:text-green-700"
            >
              Edit
            </button>
          </div>

          {contributors.map((contributor, index) => (
            <div key={contributor.id} className={index < contributors.length - 1 ? 'mb-8' : ''}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xl font-medium flex-shrink-0">
                    {getInitials(contributor.name)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{contributor.name}</h4>
                    <p className="text-gray-500 text-sm">{contributor.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-900 font-medium">{getLocalTime(contributor.timezone)}</p>
                  <p className="text-gray-400 text-sm">Local time</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditContributor(contributor)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Email
                </button>
                {contributor.linkedin && (
                  <button
                    onClick={() => window.open(contributor.linkedin, '_blank')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Linkedin
                  </button>
                )}
                {contributor.github && (
                  <button
                    onClick={() => window.open(contributor.github, '_blank')}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Github
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Prototype Link Modal */}
      {isPrototypeLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
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

      {/* Edit Contributors Modal */}
      {isEditingContributors && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">CONTRIBUTORS</h2>
              {!editingContributorId && (
                <button
                  onClick={handleAddContributor}
                  className="text-gray-700 text-sm font-medium hover:text-gray-900"
                >
                  Add contributor
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={contributorForm.name}
                  onChange={(e) => setContributorForm({ ...contributorForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={contributorForm.role}
                  onChange={(e) => setContributorForm({ ...contributorForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={contributorForm.location}
                  onChange={(e) => setContributorForm({ ...contributorForm, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={contributorForm.timezone}
                  onChange={(e) => setContributorForm({ ...contributorForm, timezone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="">Select timezone</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Europe/Paris">Paris (CET)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Asia/Shanghai">Shanghai (CST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={contributorForm.email}
                  onChange={(e) => setContributorForm({ ...contributorForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  value={contributorForm.linkedin}
                  onChange={(e) => setContributorForm({ ...contributorForm, linkedin: e.target.value })}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Github</label>
                <input
                  type="url"
                  value={contributorForm.github}
                  onChange={(e) => setContributorForm({ ...contributorForm, github: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={editingContributorId ? handleSaveContributor : handleAddContributor}
                className="w-full px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Save details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
