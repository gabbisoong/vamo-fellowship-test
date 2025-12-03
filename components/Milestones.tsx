'use client';

import { useState } from 'react';

interface Milestone {
  id: string;
  name: string;
  completed: boolean;
  proofUrl?: string;
}

const DEFAULT_MILESTONES: Milestone[] = [
  { id: '1', name: 'Vibecoded Product', completed: false },
  { id: '2', name: 'Secure Developer', completed: false },
  { id: '3', name: 'Finish MVP', completed: false },
  { id: '4', name: 'First Paying Customer', completed: false },
  { id: '5', name: '10 Paying Customers', completed: false },
];

interface MilestonesProps {
  initialMilestones?: Milestone[];
}

export default function Milestones({ initialMilestones }: MilestonesProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(
    initialMilestones || DEFAULT_MILESTONES
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<string>('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the next uncompleted milestone
  const nextMilestone = milestones.find((m) => !m.completed);
  const uncompletedMilestones = milestones.filter((m) => !m.completed);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMilestone || !proofFile) return;

    setIsSubmitting(true);

    // TODO: Upload file and save milestone completion to database
    // For now, just update local state
    setTimeout(() => {
      setMilestones((prev) =>
        prev.map((m) =>
          m.id === selectedMilestone ? { ...m, completed: true } : m
        )
      );
      setIsModalOpen(false);
      setSelectedMilestone('');
      setProofFile(null);
      setIsSubmitting(false);
    }, 500);
  };

  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div className="mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-section-title">Milestones</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          disabled={!nextMilestone}
        >
          Add Milestone
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline bar */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded-full" />

        {/* Milestone markers */}
        <div className="relative flex justify-between">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex flex-col items-center">
              {/* Marker line */}
              <div className="w-1 h-4 bg-gray-900 rounded-full" />

              {/* Checkbox and label */}
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                    milestone.completed
                      ? 'bg-white border-gray-900'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {milestone.completed && (
                    <svg
                      className="w-4 h-4 text-gray-900"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-milestone-label">{milestone.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Add Milestone
            </h3>

            {/* Milestone Dropdown */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Milestone
              </label>
              <select
                value={selectedMilestone}
                onChange={(e) => setSelectedMilestone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Choose a milestone...</option>
                {uncompletedMilestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Proof (Photo or PDF)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {proofFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">{proofFile.name}</span>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label
                      htmlFor="proof-upload"
                      className="cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      <svg
                        className="w-8 h-8 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm">Click to upload</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedMilestone('');
                  setProofFile(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedMilestone || !proofFile || isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
