'use client';

import { useState, useEffect } from 'react';
import NoteList from '@/components/NoteList';
import NoteForm from '@/components/NoteForm';
import Navigation from '@/components/Navigation';
import { Note } from '@/types';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNoteCreated = (note: Note) => {
    setNotes([note, ...notes]);
    setSelectedNote(null);
  };

  const handleNoteUpdated = (updatedNote: Note) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
    setSelectedNote(null);
  };

  const handleNoteDeleted = (noteId: string) => {
    setNotes(notes.filter(n => n.id !== noteId));
    setSelectedNote(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Vamo Fellowship Notes Tracker</h1>
          <p className="mt-2 text-gray-600">Track and manage notes with email notifications</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Create New Note</h2>
              <NoteForm
                onNoteCreated={handleNoteCreated}
                onNoteUpdated={handleNoteUpdated}
                selectedNote={selectedNote}
                onCancel={() => setSelectedNote(null)}
              />
            </div>
          </div>

          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">All Notes</h2>
              <NoteList
                notes={notes}
                onNoteSelect={setSelectedNote}
                onNoteDeleted={handleNoteDeleted}
                onNoteUpdated={handleNoteUpdated}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

