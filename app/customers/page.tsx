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
  createdAt: number; // Timestamp for tracking when customer was added
}

function calculateLikelihood(relationship: string, stage: string): number {
  // If stage is "Secured ✓", always return 100%
  if (stage === 'Secured ✓') {
    return 100;
  }

  // If stage is "No Sale ✕", always return 0%
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
  // For any other values (like 25, etc.)
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

export default function MyCustomers() {
  useSession();
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: '',
    file: null as File | null,
  });

  useEffect(() => {
    fetchStats();
    initializeCustomers();
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
    // Initialize 12 empty customer rows
    const emptyCustomers: Customer[] = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      name: '',
      relationship: '',
      explanation: '',
      stage: '',
      createdAt: 0, // Not yet created
    }));
    setCustomers(emptyCustomers);
  };

  const updateCustomer = (id: number, field: keyof Customer, value: string) => {
    setCustomers(prev =>
      prev.map(customer => {
        if (customer.id === id) {
          // Set createdAt timestamp on first edit (when it's still 0)
          const createdAt = customer.createdAt === 0 ? Date.now() : customer.createdAt;
          return { ...customer, [field]: value, createdAt };
        }
        return customer;
      })
    );
  };

  const handleAddToPayingCustomers = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer || !paymentForm.file) return;

    const formData = new FormData();
    formData.append('customerName', selectedCustomer.name);
    formData.append('amount', paymentForm.amount);
    formData.append('paymentDate', paymentForm.paymentDate);
    formData.append('file', paymentForm.file);

    try {
      const response = await fetch('/api/customer-proofs', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowPaymentModal(false);
        setPaymentForm({ amount: '', paymentDate: '', file: null });
        setSelectedCustomer(null);
        alert('Payment proof added successfully!');
      }
    } catch (error) {
      console.error('Error submitting payment proof:', error);
      alert('Failed to submit payment proof');
    }
  };

  // Sort customers by likelihood (descending) and then by createdAt (ascending)
  const sortedCustomers = [...customers].sort((a, b) => {
    // Keep rows without a stage at the bottom in their original order
    const hasStageA = a.stage !== '';
    const hasStageB = b.stage !== '';

    // If neither has a stage, keep original order
    if (!hasStageA && !hasStageB) return a.id - b.id;

    // Rows with stage go before rows without stage
    if (!hasStageA) return 1;
    if (!hasStageB) return -1;

    // Both have stages, now sort by likelihood
    const likelihoodA = calculateLikelihood(a.relationship, a.stage);
    const likelihoodB = calculateLikelihood(b.relationship, b.stage);

    // First, sort by likelihood (higher first)
    if (likelihoodA !== likelihoodB) {
      return likelihoodB - likelihoodA;
    }

    // If likelihood is the same, sort by createdAt (older first)
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
                className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-900 font-medium"
              >
                <span>🎯</span> Prospects
              </Link>
              <span className="text-gray-400">→</span>
              <Link
                href="/customer-proofs"
                className="flex items-center gap-2 px-6 py-3 rounded-full text-gray-500 font-medium opacity-50 hover:opacity-100 transition-opacity"
              >
                <span>💸</span> Paying Customers
              </Link>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-16">#</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-48">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-56">Relationship</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Why are they on this list?</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-48">Stage</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500 w-48">% Likelihood of Paying</th>
                </tr>
              </thead>
              <tbody>
                {sortedCustomers.map((customer, index) => {
                  const isActive = activeRowId === customer.id;
                  const isSecured = customer.stage === 'Secured ✓';
                  const isHovered = hoveredRowId === customer.id;
                  return (
                    <tr
                      key={customer.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50 relative"
                      style={isActive ? {
                        outline: '1.5px solid #4B91F2',
                        outlineOffset: '-1.5px'
                      } : undefined}
                      onMouseEnter={() => isSecured && setHoveredRowId(customer.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      <td className="px-6 py-4 text-sm text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <EditableCell
                          value={customer.name}
                          onChange={(value) => updateCustomer(customer.id, 'name', value)}
                          placeholder="Type Name"
                          onFocus={() => setActiveRowId(customer.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DropdownField
                          value={customer.relationship}
                          onChange={(value) => updateCustomer(customer.id, 'relationship', value as Customer['relationship'])}
                          options={RELATIONSHIP_OPTIONS}
                          placeholder="Select relationship level"
                          onFocus={() => setActiveRowId(customer.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <EditableCell
                          value={customer.explanation}
                          onChange={(value) => updateCustomer(customer.id, 'explanation', value)}
                          placeholder="Type explanation here..."
                          onFocus={() => setActiveRowId(customer.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <DropdownField
                          value={customer.stage}
                          onChange={(value) => updateCustomer(customer.id, 'stage', value)}
                          options={STAGE_OPTIONS}
                          placeholder="Select stage"
                          onFocus={() => setActiveRowId(customer.id)}
                        />
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const likelihood = calculateLikelihood(customer.relationship, customer.stage);
                          const style = getLikelihoodStyle(likelihood);
                          return (
                            <span
                              className={`text-sm font-semibold ${style.isCustomColor ? '' : style.color}`}
                              style={style.isCustomColor ? { color: style.color } : undefined}
                            >
                              {likelihood}% {style.icon}
                            </span>
                          );
                        })()}
                      </td>

                      {/* Hover popup for secured customers */}
                      {isSecured && isHovered && (
                        <td className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                          <button
                            onClick={() => handleAddToPayingCustomers(customer)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
                          >
                            Add to Paying Customers
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Payment Proof Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Add Payment Proof</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentForm({ amount: '', paymentDate: '', file: null });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit}>
              {/* Customer Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name
                </label>
                <input
                  type="text"
                  value={selectedCustomer.name}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Amount Paid */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Payment Date */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt/Contract
                </label>
                <input
                  type="file"
                  required
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setPaymentForm({ ...paymentForm, file: e.target.files?.[0] || null })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentForm({ amount: '', paymentDate: '', file: null });
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
