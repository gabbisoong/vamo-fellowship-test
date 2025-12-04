'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';
import CountdownTimer from '@/components/CountdownTimer';

interface Update {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface FellowshipStats {
  daysRemaining: number;
  progressPercentage: number;
  startDate: string;
  endDate: string;
}

// Helper to group updates by time period
function groupUpdatesByPeriod(updates: Update[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const groups: { [key: string]: Update[] } = {
    'Today': [],
    'Last Week': [],
    'Earlier': [],
  };

  // Sort updates by updatedAt (most recent first)
  const sortedUpdates = [...updates].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt);
    const dateB = new Date(b.updatedAt || b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  sortedUpdates.forEach((update) => {
    const updateDate = new Date(update.updatedAt || update.createdAt);
    const updateDay = new Date(updateDate.getFullYear(), updateDate.getMonth(), updateDate.getDate());

    if (updateDay.getTime() === today.getTime()) {
      groups['Today'].push(update);
    } else if (updateDay >= lastWeekStart) {
      groups['Last Week'].push(update);
    } else {
      groups['Earlier'].push(update);
    }
  });

  return groups;
}

export default function DailyUpdates() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<FellowshipStats | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStats();
    fetchUpdates();
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

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

  const fetchUpdates = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setUpdates(data);
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
  };

  const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatNoteTimestamp = (dateString: string) => {
    if (isToday(dateString)) {
      return formatTime(dateString);
    }
    return formatShortDate(dateString);
  };

  // Auto-save function
  const autoSave = useCallback(async (updateId: string | null, newTitle: string, newContent: string) => {
    if (!newTitle.trim() && !newContent.trim()) return;
    if (!session?.user?.email) return; // Need user email to save

    setIsSaving(true);
    try {
      if (updateId) {
        // Update existing
        const response = await fetch(`/api/notes/${updateId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: newTitle || 'Untitled', content: newContent }),
        });
        if (response.ok) {
          const updated = await response.json();
          setUpdates((prev) => prev.map((u) => (u.id === updateId ? updated : u)));
          setSelectedUpdate(updated);
          setLastSaved(new Date());
        }
      } else {
        // Create new
        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTitle || 'Untitled',
            content: newContent || ' ',
            authorEmail: session.user.email,
            authorName: session.user.name || undefined,
          }),
        });
        if (response.ok) {
          const newUpdate = await response.json();
          setUpdates((prev) => [newUpdate, ...prev]);
          setSelectedUpdate(newUpdate);
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Error saving update:', error);
    } finally {
      setIsSaving(false);
    }
  }, [session]);

  // Debounced auto-save
  const debouncedSave = useCallback((updateId: string | null, newTitle: string, newContent: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      autoSave(updateId, newTitle, newContent);
    }, 1000);
  }, [autoSave]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave(selectedUpdate?.id || null, newTitle, content);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    debouncedSave(selectedUpdate?.id || null, title, newContent);
  };

  const handleSelectUpdate = (update: Update) => {
    // Save current before switching
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (selectedUpdate && (title || content)) {
      autoSave(selectedUpdate.id, title, content);
    }

    setSelectedUpdate(update);
    setTitle(update.title);
    setContent(update.content);
    setIsEditingTitle(false);
  };

  const handleNewUpdate = () => {
    // Save current before creating new
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (selectedUpdate && (title || content)) {
      autoSave(selectedUpdate.id, title, content);
    }

    setSelectedUpdate(null);
    setTitle('');
    setContent('');
    setIsEditingTitle(false);
  };

  const handlePencilClick = () => {
    setIsEditingTitle(true);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditingTitle(false);
    }
  };

  const daysRemaining = stats?.daysRemaining ?? 100;
  const progressPercentage = stats?.progressPercentage ?? 0;
  const groupedUpdates = groupUpdatesByPeriod(updates);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 min-h-screen flex flex-col">
        {/* Countdown Timer Header */}
        <header className="px-12 py-4 bg-white border-b border-gray-100">
          <CountdownTimer endDate={stats?.endDate || ''} size="small" />
        </header>

        {/* Notes Interface */}
        <div className="flex-1 flex">
          {/* Notes List (Left Panel) */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* New Update Button */}
            <div className="p-4 border-b border-gray-100">
              <button
                onClick={handleNewUpdate}
                className="w-full py-2 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors text-sm"
              >
                + New Update
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto">
              {/* Current Draft (new unsaved note) */}
              {!selectedUpdate && (title || content) && (
                <div>
                  <div className="px-4 py-2 border-b border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Today</h3>
                  </div>
                  <div
                    className="w-full text-left px-4 py-3 border-b border-gray-100 bg-gray-100"
                  >
                    <p className="font-medium text-gray-900 truncate">
                      {title || 'New Update'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatTime(new Date().toISOString())}
                    </p>
                  </div>
                </div>
              )}

              {Object.entries(groupedUpdates).map(([period, periodUpdates]) => {
                // Skip "Today" header if we already showed it for the draft
                if (periodUpdates.length === 0) return null;
                const showHeader = !(!selectedUpdate && (title || content) && period === 'Today');
                return (
                  <div key={period}>
                    {showHeader && (
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-500">{period}</h3>
                      </div>
                    )}
                    {periodUpdates.map((update) => (
                      <button
                        key={update.id}
                        onClick={() => handleSelectUpdate(update)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                          selectedUpdate?.id === update.id ? 'bg-gray-100' : ''
                        }`}
                      >
                        <p className="font-medium text-gray-900 truncate">
                          {selectedUpdate?.id === update.id ? title : update.title || 'Untitled'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatNoteTimestamp(update.updatedAt || update.createdAt)}
                        </p>
                      </button>
                    ))}
                  </div>
                );
              })}

              {updates.length === 0 && !title && !content && (
                <div className="p-8 text-center text-gray-400">
                  <p>No updates yet</p>
                  <p className="text-sm mt-1">Click "+ New Update" to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Note Editor (Right Panel) */}
          <div className="flex-1 p-12 bg-gray-50">
            <div className="max-w-2xl">
              {/* Title with Pencil Icon */}
              <div className="flex items-center gap-3 mb-4">
                {isEditingTitle ? (
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    onBlur={handleTitleBlur}
                    onKeyDown={handleTitleKeyDown}
                    placeholder="New Update"
                    className="text-4xl font-semibold bg-transparent border-none outline-none w-full text-gray-900 placeholder-gray-300"
                  />
                ) : (
                  <>
                    <button
                      onClick={handlePencilClick}
                      className={`text-4xl font-semibold text-left ${
                        title ? 'text-gray-900' : 'text-gray-300'
                      } hover:opacity-70 transition-opacity`}
                    >
                      {title || 'New Update'}
                    </button>
                    <button
                      onClick={handlePencilClick}
                      className="text-gray-300 hover:text-gray-500 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Saving Indicator */}
              {isSaving && (
                <p className="text-xs text-gray-400 mb-4">Saving...</p>
              )}
              {!isSaving && lastSaved && (
                <p className="text-xs text-gray-400 mb-4">
                  Saved at {lastSaved.toLocaleTimeString()}
                </p>
              )}

              {/* Content */}
              <textarea
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="What is your update that you can show off proudly today?"
                className={`w-full min-h-[400px] bg-transparent border-none outline-none resize-none text-lg leading-relaxed ${
                  content ? 'text-gray-900' : 'text-gray-300'
                } placeholder-gray-300`}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
