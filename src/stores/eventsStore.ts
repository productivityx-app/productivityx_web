import { create } from 'zustand';
import { CalendarEvent } from '../types';

interface EventsState {
  events: CalendarEvent[];
  trash: CalendarEvent[];
  activeEvent: CalendarEvent | null;
  isLoading: boolean;
  setEvents: (events: CalendarEvent[]) => void;
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  restoreEvent: (id: string) => void;
  setTrash: (trash: CalendarEvent[]) => void;
  setActiveEvent: (event: CalendarEvent | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useEventsStore = create<EventsState>()((set) => ({
  events: [],
  trash: [],
  activeEvent: null,
  isLoading: false,
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((s) => ({ events: [...s.events, event] })),
  updateEvent: (event) => set((s) => ({
    events: s.events.map((e) => e.id === event.id ? event : e),
    activeEvent: s.activeEvent?.id === event.id ? event : s.activeEvent,
  })),
  deleteEvent: (id) => set((s) => ({
    events: s.events.filter((e) => e.id !== id),
    activeEvent: s.activeEvent?.id === id ? null : s.activeEvent,
  })),
  restoreEvent: (id) => set((s) => ({ trash: s.trash.filter((e) => e.id !== id) })),
  setTrash: (trash) => set({ trash }),
  setActiveEvent: (activeEvent) => set({ activeEvent }),
  setLoading: (isLoading) => set({ isLoading }),
}));
