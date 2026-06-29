import { create } from 'zustand';
import { Note, Tag } from '../types';

interface NotesState {
  notes: Note[];
  trash: Note[];
  tags: Tag[];
  activeNote: Note | null;
  isLoading: boolean;
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  setTrash: (trash: Note[]) => void;
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (tag: Tag) => void;
  removeTag: (id: string) => void;
  setActiveNote: (note: Note | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useNotesStore = create<NotesState>()((set) => ({
  notes: [],
  trash: [],
  tags: [],
  activeNote: null,
  isLoading: false,
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (note) => set((s) => ({
    notes: s.notes.map((n) => n.id === note.id ? note : n),
    activeNote: s.activeNote?.id === note.id ? note : s.activeNote,
  })),
  deleteNote: (id) => set((s) => ({
    notes: s.notes.filter((n) => n.id !== id),
    activeNote: s.activeNote?.id === id ? null : s.activeNote,
  })),
  restoreNote: (id) => set((s) => ({ trash: s.trash.filter((n) => n.id !== id) })),
  setTrash: (trash) => set({ trash }),
  setTags: (tags) => set({ tags }),
  addTag: (tag) => set((s) => ({ tags: [...s.tags, tag] })),
  updateTag: (tag) => set((s) => ({ tags: s.tags.map((t) => t.id === tag.id ? tag : t) })),
  removeTag: (id) => set((s) => ({ tags: s.tags.filter((t) => t.id !== id) })),
  setActiveNote: (activeNote) => set({ activeNote }),
  setLoading: (isLoading) => set({ isLoading }),
}));
