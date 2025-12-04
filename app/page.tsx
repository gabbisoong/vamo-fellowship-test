'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import WorkingLog from '@/components/WorkingLog';
import Milestones from '@/components/Milestones';
import EmailAttachmentModal from '@/components/EmailAttachmentModal';
import Link from 'next/link';

interface FellowshipStats {
  daysRemaining: number;
  progressPercentage: number;
  customerProofsCount: number;
  hasPassed: boolean;
  fellowshipStatus: string;
  startDate: string;
  endDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Dashboard() {
  useSession(); // Keep session check for auth
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'updates' | 'proof'>('updates');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchStats();
  }, []);

  // Real-time countdown timer
  useEffect(() => {
    if (!stats?.endDate) return;

    const calculateTimeLeft = () => {
      const endDate = new Date(stats.endDate);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [stats?.endDate]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/fellowship/status');
      if (response.ok) {
        const data: FellowshipStats = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const padNumber = (num: number) => num.toString().padStart(2, '0');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const daysRemaining = stats?.daysRemaining ?? 100;
  const progressPercentage = stats?.progressPercentage ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Email Evidence Button - Top Right */}
        <div className="absolute top-6 right-12">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="btn-outline"
          >
            Email Evidence
          </button>
        </div>

        {/* Main Content Area */}
        <div className="px-12 pt-5 pb-[100px]">
          <div className="max-w-[775px] mx-auto">
            {/* Countdown Timer Section */}
            <div className="mb-8 text-center">
              {/* Days left to $100K - Centered at top */}
              <p className="text-gray-500 mb-0">Days left to $100K</p>

              {/* Countdown Timer */}
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="text-center">
                  <span className="text-[54px] font-bold text-gray-900">{padNumber(timeLeft.days)}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-wide -mt-2">Days</p>
                </div>
                <span className="text-[45px] font-bold text-gray-900 mb-5">:</span>
                <div className="text-center">
                  <span className="text-[54px] font-bold text-gray-900">{padNumber(timeLeft.hours)}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-wide -mt-2">Hours</p>
                </div>
                <span className="text-[45px] font-bold text-gray-900 mb-5">:</span>
                <div className="text-center">
                  <span className="text-[54px] font-bold text-gray-900">{padNumber(timeLeft.minutes)}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-wide -mt-2">Minutes</p>
                </div>
                <span className="text-[45px] font-bold text-gray-900 mb-5">:</span>
                <div className="text-center">
                  <span className="text-[54px] font-bold text-gray-900">{padNumber(timeLeft.seconds)}</span>
                  <p className="text-xs text-gray-500 uppercase tracking-wide -mt-2">Seconds</p>
                </div>
              </div>

              {/* Large $100K Text - Below Timer */}
              <div className="mb-6">
                <span
                  className="font-medium"
                  style={{
                    fontFamily: "'Greed TRIAL', sans-serif",
                    fontSize: '190px',
                    lineHeight: '113%',
                    letterSpacing: '-0.01em',
                    background: 'linear-gradient(180deg, #D4A574 0%, #C9A067 30%, #B8956A 60%, #A8845D 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    WebkitTextStroke: '1.72px #D8CA9E',
                  }}
                >
                  $100K
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="relative h-3 rounded-full overflow-hidden bg-gray-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                      width: `${progressPercentage}%`,
                      background: `linear-gradient(to right, #1a1a1a 0%, #1a1a1a ${Math.min(progressPercentage * 0.3, 30)}%, #22c55e ${Math.min(progressPercentage * 0.5, 50)}%, #eab308 ${Math.min(progressPercentage * 0.7, 70)}%, #ef4444 100%)`,
                    }}
                  />
                </div>

                {/* Date Labels */}
                <div className="flex justify-between mt-3">
                  <div className="text-left">
                    <p className="text-date-label">Start</p>
                    <p className="text-date-value">{formatDate(stats?.startDate || new Date().toISOString())}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-date-label-end">End</p>
                    <p className="text-date-value-end">{formatDate(stats?.endDate || new Date().toISOString())}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Section */}
            <div className="mt-16">
              <h2 className="text-section-title mb-8">Daily Requirements</h2>

              {/* Cards with Tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Daily Updates Column */}
                <div>
                  {/* Tab */}
                  <button
                    onClick={() => setActiveTab('updates')}
                    className="flex items-center gap-3 mb-4"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      activeTab === 'updates' ? 'bg-gray-900' : 'border-2 border-gray-300'
                    }`}>
                      {activeTab === 'updates' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <span className="text-tab-title">Daily Updates</span>
                  </button>

                  {/* Card */}
                  <Link
                    href="/updates"
                    className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="bg-gray-100 rounded-xl p-8 min-h-[280px] flex flex-col items-center justify-center">
                      <h3 className="text-card-title flex items-center gap-2 mb-4">
                        New Update <span>✏️</span>
                      </h3>
                      <p className="text-card-description max-w-xs">
                        What is your update that you can show off proudly today?
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Social Proof Log Column */}
                <div>
                  {/* Tab */}
                  <button
                    onClick={() => setActiveTab('proof')}
                    className="flex items-center gap-3 mb-4"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      activeTab === 'proof' ? 'bg-gray-900' : 'border-2 border-gray-300'
                    }`}>
                      {activeTab === 'proof' && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                    <span className="text-tab-title">Social Proof Log</span>
                  </button>

                  {/* Card */}
                  <Link
                    href="/evidence"
                    className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-gray-300 transition-colors"
                  >
                    <div className="bg-gray-100 rounded-xl p-8 min-h-[280px] flex flex-col items-center justify-center">
                      <h3 className="text-card-email mb-6">
                        Email attachments@vamo.com
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="w-28 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-28 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-28 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-28 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-28 h-20 bg-gray-200 rounded-lg"></div>
                        <div className="w-28 h-20 bg-gray-200 rounded-lg"></div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Working Log Section */}
            <WorkingLog
              totalDays={100}
              activeDays={Array.from({ length: Math.max(0, 100 - daysRemaining) }, (_, i) => i)}
            />

            {/* Milestones Section */}
            <Milestones />
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
