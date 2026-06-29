import { create } from 'zustand';
import { Task } from '../types';

interface TasksState {
  tasks: Task[];
  trash: Task[];
  activeTask: Task | null;
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  setTrash: (trash: Task[]) => void;
  reorderTasks: (items: { id: string; position: number }[]) => void;
  setActiveTask: (task: Task | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTasksStore = create<TasksState>()((set) => ({
  tasks: [],
  trash: [],
  activeTask: null,
  isLoading: false,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  updateTask: (task) => set((s) => ({
    tasks: s.tasks.map((t) => t.id === task.id ? task : t),
    activeTask: s.activeTask?.id === task.id ? task : s.activeTask,
  })),
  deleteTask: (id) => set((s) => ({
    tasks: s.tasks.filter((t) => t.id !== id),
    activeTask: s.activeTask?.id === id ? null : s.activeTask,
  })),
  restoreTask: (id) => set((s) => ({ trash: s.trash.filter((t) => t.id !== id) })),
  setTrash: (trash) => set({ trash }),
  reorderTasks: (items) => set((s) => {
    const map = new Map(items.map((i) => [i.id, i.position]));
    return { tasks: s.tasks.map((t) => map.has(t.id) ? { ...t, position: map.get(t.id)! } : t) };
  }),
  setActiveTask: (activeTask) => set({ activeTask }),
  setLoading: (isLoading) => set({ isLoading }),
}));
