'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import EmailAttachmentModal from '@/components/EmailAttachmentModal';
import CountdownTimer from '@/components/CountdownTimer';

interface FellowshipStats {
  daysRemaining: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
}

interface Evidence {
  id: string;
  subject: string;
  message?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
}

export default function SocialProof() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    // TODO: Fetch evidence from API
    setLoading(false);
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

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const daysRemaining = stats?.daysRemaining ?? 100;
  const progressPercentage = stats?.progressPercentage ?? 0;
  const documentCount = evidenceList.length;

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
              <h1 className="text-4xl font-bold text-gray-900">Social Proof</h1>
              <p className="text-gray-500 mt-1">{documentCount} documents</p>
            </div>
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="btn-outline"
            >
              Email Evidence
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            Email your evidence to attachments@vamotalent.com, or upload your evidence below.
          </p>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Upload Card */}
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="aspect-[4/3] bg-white rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              <svg
                className="w-8 h-8 text-gray-400"
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
              <span className="text-gray-400 font-medium">Upload</span>
            </button>

            {/* Evidence Items */}
            {evidenceList.map((evidence) => (
              <div
                key={evidence.id}
                className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {evidence.attachmentUrl ? (
                  <img
                    src={evidence.attachmentUrl}
                    alt={evidence.subject}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center p-4">
                      <svg
                        className="w-8 h-8 mx-auto text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-sm text-gray-500 truncate">{evidence.subject}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Placeholder cards when no evidence */}
            {evidenceList.length === 0 && (
              <>
                <div className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-300">No evidence yet</span>
                </div>
                <div className="aspect-[4/3] bg-white rounded-2xl border border-gray-200 flex items-center justify-center">
                  <span className="text-gray-300">No evidence yet</span>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Email Attachment Modal */}
      <EmailAttachmentModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
      />
    </div>
  );
}
