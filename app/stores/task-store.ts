import { create } from 'zustand';
import {
  addTaskAction,
  fetchTasksAction,
  deleteTaskAction,
  updateTaskAction,
  completeTaskAction,
} from '@/app/actions/tasks';

export interface Task {
  id: string;
  title: string;
  description?: string;
  updated_at?: string;
  created_at?: string;
  status?: 'pending' | 'completed';
  deadline?: string;
}

interface TaskStore {
  tasks: Task[];
  loadingAddTask: boolean;
  loadingUpdateTask: boolean;
  loadingFetchTasks: boolean;
  loadingDeleteTask: boolean;
  loadingCompleteTask: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  fetchTasks: () => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>()((set) => ({
  tasks: [],
  loadingAddTask: false,
  loadingUpdateTask: false,
  loadingFetchTasks: false,
  loadingDeleteTask: false,
  loadingCompleteTask: false,
  error: null,
  clearError: () => set({ error: null }),
  addTask: async (task) => {
    set({ loadingAddTask: true, error: null });
    try {
      const data = await addTaskAction(task);
      set((state) => ({
        tasks: [data, ...state.tasks],
        loadingAddTask: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add task';
      set({ error: errorMessage, loadingAddTask: false });
      throw err;
    }
  },
  fetchTasks: async () => {
    set({ loadingFetchTasks: true, error: null });
    try {
      const tasks = await fetchTasksAction();
      set({ tasks, loadingFetchTasks: false });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch tasks';
      set({ error: errorMessage, loadingFetchTasks: false });
      throw err;
    }
  },
  deleteTask: async (id) => {
    set({ loadingDeleteTask: true, error: null });
    try {
      await deleteTaskAction(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        loadingDeleteTask: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete task';
      set({ error: errorMessage, loadingDeleteTask: false });
      throw err;
    }
  },
  completeTask: async (id) => {
    set({ loadingCompleteTask: true, error: null });
    try {
      const data = await completeTaskAction(id);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loadingCompleteTask: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to complete task';
      set({ error: errorMessage, loadingCompleteTask: false });
      throw err;
    }
  },
  updateTask: async (id, updates) => {
    set({ loadingUpdateTask: true, error: null });
    try {
      const data = await updateTaskAction(id, updates);
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? data : task)),
        loadingUpdateTask: false,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update task';
      set({ error: errorMessage, loadingUpdateTask: false });
      throw err;
    }
  },
}));
