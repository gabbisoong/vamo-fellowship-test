'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';

interface Customer {
  id: number;
  name: string;
  relationship: 'I know them well' | 'I\'ve talked to them once' | 'I don\'t know them' | '';
  explanation: string;
  stage: string;
  createdAt: number;
}

function calculateLikelihood(relationship: string, stage: string): number {
  if (stage === 'Secured ✓') {
    return 100;
  }

  if (stage === 'No Sale ✕') {
    return 0;
  }

  const relationshipWeight = RELATIONSHIP_OPTIONS.find(opt => opt.value === relationship)?.weight || 20;
  const stageWeight = STAGE_OPTIONS.find(opt => opt.value === stage)?.weight || 20;
  return Math.round((relationshipWeight + stageWeight) / 2);
}

function getLikelihoodStyle(likelihood: number): { color: string; icon: string; isCustomColor?: boolean } {
  if (likelihood === 0) {
    return { color: 'text-red-500', icon: '✕' };
  }
  if (likelihood === 100) {
    return { color: 'text-green-500', icon: '✓' };
  }
  if (likelihood === 20) {
    return { color: 'text-gray-400', icon: '—' };
  }
  if (likelihood >= 70) {
    return { color: 'text-green-500', icon: '▲' };
  }
  if (likelihood >= 50) {
    return { color: 'text-blue-500', icon: '▲' };
  }
  if (likelihood >= 30) {
    return { color: '#C6A147', icon: '▲', isCustomColor: true };
  }
  return { color: 'text-gray-500', icon: '▲' };
}

interface FellowshipStats {
  daysRemaining: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'I know them well', color: 'bg-green-100 text-green-800 border-green-200', weight: 60 },
  { value: 'I\'ve talked to them once', color: 'bg-blue-100 text-blue-800 border-blue-200', weight: 40 },
  { value: 'I don\'t know them', color: 'bg-amber-100 text-amber-800 border-amber-200', weight: 20 },
] as const;

const STAGE_OPTIONS = [
  { value: 'Set up Call', color: 'bg-gray-200 text-gray-800 border-gray-300', weight: 20, group: 'main' },
  { value: 'Discovery Call', color: 'bg-amber-100 text-amber-800 border-amber-200', weight: 20, group: 'main' },
  { value: 'Product Demo', color: 'bg-blue-100 text-blue-800 border-blue-200', weight: 40, group: 'main' },
  { value: 'Pricing Call', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', weight: 80, group: 'main' },
  { value: 'Secured ✓', color: 'bg-green-100 text-green-800 border-green-200', weight: 100, group: 'secured' },
  { value: 'No Sale ✕', color: 'bg-red-100 text-red-800 border-red-200', weight: 0, group: 'secured' },
] as const;

function DropdownField({
  value,
  onChange,
  options,
  placeholder,
  onFocus
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly { value: string; color: string; weight: number; group?: string }[];
  placeholder: string;
  onFocus?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);
  const hasGroups = options.some(opt => opt.group);
  const mainOptions = options.filter(opt => opt.group === 'main');
  const securedOptions = options.filter(opt => opt.group === 'secured');

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onFocus?.();
        }}
        className="w-full text-left focus:outline-none"
      >
        {value ? (
          <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${selectedOption?.color}`}>
            {value}
          </span>
        ) : (
          <span className="text-gray-400 italic text-sm">{placeholder}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
          {hasGroups ? (
            <>
              {/* Main stage options */}
              <div className="py-1">
                <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Select stage of sale</p>
                {mainOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${option.color}`}>
                      {option.value}
                    </span>
                  </button>
                ))}
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-1"></div>

              {/* Secured options */}
              <div className="py-1">
                <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase">Secured?</p>
                {securedOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-50 last:rounded-b-lg"
                  >
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${option.color}`}>
                      {option.value}
                    </span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Simple dropdown without groups */}
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className={`inline-block px-3 py-1 rounded-md text-sm font-medium border ${option.color}`}>
                    {option.value}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EditableCell({
  value,
  onChange,
  placeholder,
  onFocus
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  onFocus?: () => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isEmpty = !value || value.trim() === '';

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => {
        setIsFocused(true);
        onFocus?.();
      }}
      onBlur={() => setIsFocused(false)}
      placeholder={placeholder}
      className={`w-full bg-transparent border-none outline-none text-sm ${
        isEmpty && !isFocused ? 'text-gray-400 italic placeholder:text-gray-400' : 'text-gray-900 placeholder:text-gray-400'
      }`}
    />
  );
}

export default function CustomerProofsPage() {
  useSession();
  // Updated: 2025-12-04 - Added edit modal, green rows, and submit button
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    customerName: '',
    amount: '',
    paymentDate: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchStats();
    initializeCustomers();

    // Reload data when page gains focus (e.g., when navigating from another tab)
    const handleFocus = () => {
      initializeCustomers();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/fellowship/status');
      if (response.ok) {
        const data: FellowshipStats = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const initializeCustomers = () => {
    // Load paying customers from localStorage
    const payingCustomers = JSON.parse(localStorage.getItem('payingCustomers') || '[]');

    // Create 10 slots
    const customerSlots: Customer[] = Array.from({ length: 10 }, (_, index) => {
      const payment = payingCustomers[index];
      if (payment) {
        return {
          id: index + 1,
          name: payment.customerName,
          relationship: '',
          explanation: `$${payment.amount.toLocaleString()} paid on ${new Date(payment.paymentDate).toLocaleDateString()}`,
          stage: 'Secured ✓',
          createdAt: new Date(payment.createdAt).getTime(),
        };
      }
      return {
        id: index + 1,
        name: '',
        relationship: '',
        explanation: '',
        stage: '',
        createdAt: 0,
      };
    });

    setCustomers(customerSlots);
  };

  const updateCustomer = (id: number, field: keyof Customer, value: string) => {
    setCustomers(prev =>
      prev.map(customer => {
        if (customer.id === id) {
          const createdAt = customer.createdAt === 0 ? Date.now() : customer.createdAt;
          return { ...customer, [field]: value, createdAt };
        }
        return customer;
      })
    );
  };

  const handleEditClick = (customer: any, index: number) => {
    if (!customer) return; // Don't open modal for empty rows

    setEditingCustomer(customer);
    setEditingIndex(index);
    setEditForm({
      customerName: customer.customerName,
      amount: customer.amount.toString(),
      paymentDate: customer.paymentDate,
      file: null,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingIndex === null) return;

    const payingCustomers = JSON.parse(localStorage.getItem('payingCustomers') || '[]');

    // Update the customer at the editing index
    payingCustomers[editingIndex] = {
      ...payingCustomers[editingIndex],
      customerName: editForm.customerName,
      amount: parseFloat(editForm.amount),
      paymentDate: editForm.paymentDate,
      fileName: editForm.file ? editForm.file.name : payingCustomers[editingIndex].fileName,
    };

    localStorage.setItem('payingCustomers', JSON.stringify(payingCustomers));

    // Close modal and reset
    setShowEditModal(false);
    setEditForm({ customerName: '', amount: '', paymentDate: '', file: null });
    setEditingCustomer(null);
    setEditingIndex(null);

    // Reload the table
    initializeCustomers();
  };

  // Sort customers by likelihood (descending) and then by createdAt (ascending)
  const sortedCustomers = [...customers].sort((a, b) => {
    // Keep rows without a stage at the bottom in their original order
    const hasStageA = a.stage !== '';
    const hasStageB = b.stage !== '';

    if (!hasStageA && !hasStageB) return a.id - b.id;

    if (!hasStageA) return 1;
    if (!hasStageB) return -1;

    const likelihoodA = calculateLikelihood(a.relationship, a.stage);
    const likelihoodB = calculateLikelihood(b.relationship, b.stage);

    if (likelihoodA !== likelihoodB) {
      return likelihoodB - likelihoodA;
    }

    return a.createdAt - b.createdAt;
  });

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
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Targets</h1>
                <p className="text-gray-600 mb-6">
                  The more targets you add, the higher your likelihood of getting 10 paying customers!
                </p>
              </div>
              <button className="btn-outline">
                Submit Target
              </button>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-4">
              <Link
                href="/customers"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-500 font-medium opacity-50 hover:opacity-100 transition-opacity"
              >
                <span>🎯</span> Prospects
              </Link>
              <span className="text-gray-400">→</span>
              <Link
                href="/customer-proofs"
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-900 font-medium"
              >
                <span>💸</span> Paying Customers
              </Link>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ maxWidth: '774px' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-16">#</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Customer</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Payment Date</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Amount Paid</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const payingCustomers = JSON.parse(localStorage.getItem('payingCustomers') || '[]');
                  const customerSlots = Array.from({ length: 10 }, (_, index) => payingCustomers[index] || null);

                  return customerSlots.map((customer, index) => {
                    const isLastRow = index === 9;
                    const hasTenCustomers = customerSlots.filter(c => c !== null).length >= 10;

                    return (
                      <tr
                        key={index}
                        onClick={() => customer && handleEditClick(customer, index)}
                        className={`border-b border-gray-100 last:border-b-0 ${customer ? 'cursor-pointer' : ''}`}
                        style={
                          customer
                            ? isLastRow && hasTenCustomers
                              ? { background: 'linear-gradient(to right, #d1fae5, #a7f3d0)' }
                              : { backgroundColor: '#D1ECD6' }
                            : undefined
                        }
                      >
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${customer ? 'font-medium text-gray-900' : 'text-gray-400'}`}>
                          {customer ? customer.customerName : 'Paying Customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${customer ? 'text-gray-900' : 'text-gray-400'}`}>
                          {customer ? new Date(customer.paymentDate).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' }) : 'Payment Date'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${customer ? 'text-gray-900' : 'text-gray-400'}`}>
                          {customer ? `$${customer.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Amount Paid'}
                        </span>
                      </td>
                    </tr>
                    );
                  });
                })()}
              </tbody>
            </table>

            {/* Submit Button */}
            {(() => {
              const payingCustomers = JSON.parse(localStorage.getItem('payingCustomers') || '[]');
              const hasTenCustomers = payingCustomers.length >= 10;

              return (
                <div className="px-6 py-8 border-t border-gray-200">
                  <button
                    disabled={!hasTenCustomers}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      hasTenCustomers
                        ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                    }`}
                  >
                    🎉 Submit to Unlock $100k Prize
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      </main>

      {/* Edit Payment Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Payment Information</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={editForm.customerName}
                  onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={editForm.paymentDate}
                  onChange={(e) => setEditForm({ ...editForm, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Proof Document
                </label>
                <input
                  type="file"
                  onChange={(e) => setEditForm({ ...editForm, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <p className="mt-1 text-xs text-gray-500">Optional - only upload if replacing the existing document</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({ customerName: '', amount: '', paymentDate: '', file: null });
                    setEditingCustomer(null);
                    setEditingIndex(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
