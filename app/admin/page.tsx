'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';

interface FellowshipSubmission {
  id: string;
  name: string;
  email: string;
  fellowshipStartDate: string;
  fellowshipStatus: string;
  submittedAt: string;
  customerProofs: {
    id: string;
    customerName: string;
    paymentDate: string;
    amount: number;
    documentUrl: string;
    verified: boolean;
  }[];
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<FellowshipSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<FellowshipSubmission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    if (!confirm('Are you sure you want to approve this fellowship?')) return;

    try {
      const response = await fetch(`/api/admin/submissions/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (response.ok) {
        alert('Fellowship approved!');
        fetchSubmissions();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error approving fellowship:', error);
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this fellowship?')) return;

    try {
      const response = await fetch(`/api/admin/submissions/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (response.ok) {
        alert('Fellowship rejected.');
        fetchSubmissions();
        setSelectedUser(null);
      }
    } catch (error) {
      console.error('Error rejecting fellowship:', error);
    }
  };

  const handleVerifyProof = async (proofId: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/admin/proofs/${proofId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      });

      if (response.ok) {
        fetchSubmissions();
      }
    } catch (error) {
      console.error('Error verifying proof:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const pendingSubmissions = submissions.filter(s => s.fellowshipStatus === 'submitted');
  const approvedSubmissions = submissions.filter(s => s.fellowshipStatus === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.fellowshipStatus === 'rejected');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin - Fellowship Review</h1>
          <p className="mt-2 text-gray-600">
            Review and approve fellowship submissions
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Pending Review</h3>
            <div className="text-4xl font-bold text-yellow-700">{pendingSubmissions.length}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Approved</h3>
            <div className="text-4xl font-bold text-green-700">{approvedSubmissions.length}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">Rejected</h3>
            <div className="text-4xl font-bold text-red-700">{rejectedSubmissions.length}</div>
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Pending Review ({pendingSubmissions.length})</h2>

          {pendingSubmissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No pending submissions</p>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{submission.name}</h3>
                      <p className="text-sm text-gray-600">{submission.email}</p>
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Submitted:</span>{' '}
                          {new Date(submission.submittedAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Customers:</span>{' '}
                          {submission.customerProofs.length}/10
                        </div>
                        <div>
                          <span className="font-medium">Verified Proofs:</span>{' '}
                          {submission.customerProofs.filter(p => p.verified).length}/{submission.customerProofs.length}
                        </div>
                        <div>
                          <span className={`font-medium ${submission.customerProofs.length >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                            Status: {submission.customerProofs.length >= 10 ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 space-x-2">
                      <button
                        onClick={() => setSelectedUser(submission)}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Review Details
                      </button>
                      <button
                        onClick={() => handleApprove(submission.id)}
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(submission.id)}
                        className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.name}</h2>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <h3 className="text-lg font-semibold mb-4">Customer Proofs ({selectedUser.customerProofs.length})</h3>
              <div className="space-y-4">
                {selectedUser.customerProofs.map((proof) => (
                  <div key={proof.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{proof.customerName}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Amount: ${proof.amount}</div>
                          <div>Date: {new Date(proof.paymentDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <a
                          href={proof.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
                        >
                          View Document
                        </a>
                        <button
                          onClick={() => handleVerifyProof(proof.id, !proof.verified)}
                          className={`px-3 py-1 text-sm rounded-md ${
                            proof.verified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {proof.verified ? '✓ Verified' : 'Mark Verified'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleApprove(selectedUser.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve Fellowship
                </button>
                <button
                  onClick={() => handleReject(selectedUser.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject Fellowship
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Approved/Rejected Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">Approved ({approvedSubmissions.length})</h2>
            <div className="space-y-2">
              {approvedSubmissions.map(s => (
                <div key={s.id} className="text-sm border-l-4 border-green-500 pl-3 py-1">
                  {s.name} ({s.email})
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-red-700">Rejected ({rejectedSubmissions.length})</h2>
            <div className="space-y-2">
              {rejectedSubmissions.map(s => (
                <div key={s.id} className="text-sm border-l-4 border-red-500 pl-3 py-1">
                  {s.name} ({s.email})
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
