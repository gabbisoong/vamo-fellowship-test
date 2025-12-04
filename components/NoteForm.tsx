'use client';

import { useState, useEffect } from 'react';
import { Note, CreateNoteInput } from '@/types';

interface NoteFormProps {
  onNoteCreated: (note: Note) => void;
  onNoteUpdated: (note: Note) => void;
  selectedNote: Note | null;
  onCancel: () => void;
}

export default function NoteForm({
  onNoteCreated,
  onNoteUpdated,
  selectedNote,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [subscriberEmails, setSubscriberEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setAuthorEmail(selectedNote.author?.email || '');
      setAuthorName(selectedNote.author?.name || '');
      setSubscriberEmails(
        selectedNote.subscribers?.map(s => s.email).join(', ') || ''
      );
    } else {
      resetForm();
    }
  }, [selectedNote]);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setAuthorEmail('');
    setAuthorName('');
    setSubscriberEmails('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const subscribers = subscriberEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      if (selectedNote) {
        // Update existing note
        const response = await fetch(`/api/notes/${selectedNote.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            subscriberEmails: subscribers,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update note');
        }

        const updatedNote = await response.json();
        onNoteUpdated(updatedNote);
      } else {
        // Create new note
        if (!authorEmail) {
          throw new Error('Author email is required');
        }

        const response = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            content,
            authorEmail,
            authorName: authorName || undefined,
            subscriberEmails: subscribers,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create note');
        }

        const newNote = await response.json();
        onNoteCreated(newNote);
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!selectedNote && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author Email *
            </label>
            <input
              type="email"
              value={authorEmail}
              onChange={(e) => setAuthorEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Author Name
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note Content *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subscriber Emails (comma-separated)
        </label>
        <input
          type="text"
          value={subscriberEmails}
          onChange={(e) => setSubscriberEmails(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-1 text-sm text-gray-500">
          These emails will receive notifications when the note is {selectedNote ? 'updated' : 'created'}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : selectedNote ? 'Update Note' : 'Create Note'}
        </button>
        {selectedNote && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

