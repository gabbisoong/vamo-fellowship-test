'use client';

import { Note } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface NoteListProps {
  notes: Note[];
  onNoteSelect: (note: Note) => void;
  onNoteDeleted: (noteId: string) => void;
  onNoteUpdated: (note: Note) => void;
}

export default function NoteList({
  notes,
  onNoteSelect,
  onNoteDeleted,
  onNoteUpdated,
}: NoteListProps) {
  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onNoteDeleted(noteId);
      } else {
        alert('Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note');
    }
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No notes yet. Create your first note!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onNoteSelect(note)}
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteSelect(note);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note.id);
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{note.content}</p>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>
              By {note.author?.name || note.author?.email || 'Unknown'}
            </span>
            <span>
              {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
            </span>
          </div>
          {note.subscribers && note.subscribers.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {note.subscribers.length} subscriber{note.subscribers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

