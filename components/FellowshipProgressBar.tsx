'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface FellowshipData {
  daysRemaining: number;
  progressPercentage: number;
  customerProofsCount: number;
  fellowshipStatus: string;
}

export default function FellowshipProgressBar() {
  const { data: session } = useSession();
  const [fellowshipData, setFellowshipData] = useState<FellowshipData | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchFellowshipData();
    }
  }, [session]);

  const fetchFellowshipData = async () => {
    try {
      const response = await fetch('/api/fellowship/status');
      if (response.ok) {
        const data = await response.json();
        setFellowshipData(data);
      }
    } catch (error) {
      console.error('Error fetching fellowship data:', error);
    }
  };

  if (!session || !fellowshipData) return null;

  const { daysRemaining, progressPercentage, customerProofsCount, fellowshipStatus } = fellowshipData;

  const getStatusColor = () => {
    if (fellowshipStatus === 'approved') return 'bg-green-500';
    if (fellowshipStatus === 'rejected') return 'bg-red-500';
    if (fellowshipStatus === 'submitted') return 'bg-yellow-500';
    if (daysRemaining <= 10) return 'bg-red-500';
    if (daysRemaining <= 30) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusText = () => {
    if (fellowshipStatus === 'approved') return 'Fellowship Approved!';
    if (fellowshipStatus === 'rejected') return 'Fellowship Not Approved';
    if (fellowshipStatus === 'submitted') return 'Under Review';
    return `${daysRemaining} days remaining`;
  };

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">
              Fellowship Progress
            </span>
            <span className="text-sm text-gray-600">
              {getStatusText()}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {customerProofsCount}/10 customers
            </span>
            <span className="text-sm font-medium text-gray-700">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
