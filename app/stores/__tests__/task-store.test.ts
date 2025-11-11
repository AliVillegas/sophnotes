import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskStore } from '../task-store';
import {
  addTaskAction,
  fetchTasksAction,
  deleteTaskAction,
  updateTaskAction,
  completeTaskAction,
} from '@/app/actions/tasks';
import type { Task } from '../task-store';

jest.mock('@/app/actions/tasks');

const mockAddTaskAction = addTaskAction as jest.MockedFunction<
  typeof addTaskAction
>;
const mockFetchTasksAction = fetchTasksAction as jest.MockedFunction<
  typeof fetchTasksAction
>;
const mockDeleteTaskAction = deleteTaskAction as jest.MockedFunction<
  typeof deleteTaskAction
>;
const mockUpdateTaskAction = updateTaskAction as jest.MockedFunction<
  typeof updateTaskAction
>;
const mockCompleteTaskAction = completeTaskAction as jest.MockedFunction<
  typeof completeTaskAction
>;

beforeEach(() => {
  jest.clearAllMocks();
  const store = useTaskStore.getState();
  store.tasks = [];
  store.error = null;
});

describe('addTask', () => {
  it('adds task successfully and updates state', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      description: 'Description',
      status: 'pending',
    };

    const createdTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...newTask,
    };

    mockAddTaskAction.mockResolvedValue(createdTask);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      await result.current.addTask(newTask);
    });

    expect(mockAddTaskAction).toHaveBeenCalledWith(newTask);
    expect(result.current.tasks).toContainEqual(createdTask);
    expect(result.current.loadingAddTask).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles error when adding task fails', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    const error = new Error('Failed to add task');
    mockAddTaskAction.mockRejectedValue(error);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      try {
        await result.current.addTask(newTask);
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to add task');
    expect(result.current.loadingAddTask).toBe(false);
  });

  it('sets loading state during add task', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    const createdTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...newTask,
    };

    let resolvePromise: (value: Task) => void;
    const promise = new Promise<Task>((resolve) => {
      resolvePromise = resolve;
    });

    mockAddTaskAction.mockReturnValue(promise);

    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask(newTask);
    });

    expect(result.current.loadingAddTask).toBe(true);

    await act(async () => {
      resolvePromise!(createdTask);
      await promise;
    });

    await waitFor(() => {
      expect(result.current.loadingAddTask).toBe(false);
    });
  });
});

describe('fetchTasks', () => {
  it('fetches tasks successfully and updates state', async () => {
    const tasks: Task[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Task 1',
        status: 'pending',
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        title: 'Task 2',
        status: 'completed',
      },
    ];

    mockFetchTasksAction.mockResolvedValue(tasks);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      await result.current.fetchTasks();
    });

    expect(mockFetchTasksAction).toHaveBeenCalled();
    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.loadingFetchTasks).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles error when fetching tasks fails', async () => {
    const error = new Error('Failed to fetch tasks');
    mockFetchTasksAction.mockRejectedValue(error);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      try {
        await result.current.fetchTasks();
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to fetch tasks');
    expect(result.current.loadingFetchTasks).toBe(false);
  });
});

describe('deleteTask', () => {
  it('deletes task successfully and removes from state', async () => {
    const taskToDelete: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Task to Delete',
      status: 'pending',
    };

    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.tasks = [taskToDelete];
    });

    mockDeleteTaskAction.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.deleteTask(taskToDelete.id);
    });

    expect(mockDeleteTaskAction).toHaveBeenCalledWith(taskToDelete.id);
    expect(result.current.tasks).not.toContainEqual(taskToDelete);
    expect(result.current.loadingDeleteTask).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles error when deleting task fails', async () => {
    const error = new Error('Failed to delete task');
    mockDeleteTaskAction.mockRejectedValue(error);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      try {
        await result.current.deleteTask('some-id');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to delete task');
    expect(result.current.loadingDeleteTask).toBe(false);
  });
});

describe('completeTask', () => {
  it('completes task successfully and updates state', async () => {
    const pendingTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Pending Task',
      status: 'pending',
    };

    const completedTask: Task = {
      ...pendingTask,
      status: 'completed',
    };

    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.tasks = [pendingTask];
    });

    mockCompleteTaskAction.mockResolvedValue(completedTask);

    await act(async () => {
      await result.current.completeTask(pendingTask.id);
    });

    expect(mockCompleteTaskAction).toHaveBeenCalledWith(pendingTask.id);
    expect(result.current.tasks[0].status).toBe('completed');
    expect(result.current.loadingCompleteTask).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles error when completing task fails', async () => {
    const error = new Error('Failed to complete task');
    mockCompleteTaskAction.mockRejectedValue(error);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      try {
        await result.current.completeTask('some-id');
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to complete task');
    expect(result.current.loadingCompleteTask).toBe(false);
  });
});

describe('updateTask', () => {
  it('updates task successfully and updates state', async () => {
    const originalTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Original Task',
      description: 'Original Description',
      status: 'pending',
    };

    const updatedTask: Task = {
      ...originalTask,
      title: 'Updated Task',
      description: 'Updated Description',
    };

    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.tasks = [originalTask];
    });

    mockUpdateTaskAction.mockResolvedValue(updatedTask);

    await act(async () => {
      await result.current.updateTask(originalTask.id, {
        title: 'Updated Task',
        description: 'Updated Description',
      });
    });

    expect(mockUpdateTaskAction).toHaveBeenCalledWith(
      originalTask.id,
      expect.objectContaining({
        title: 'Updated Task',
        description: 'Updated Description',
      })
    );
    expect(result.current.tasks[0]).toEqual(updatedTask);
    expect(result.current.loadingUpdateTask).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles error when updating task fails', async () => {
    const error = new Error('Failed to update task');
    mockUpdateTaskAction.mockRejectedValue(error);

    const { result } = renderHook(() => useTaskStore());

    await act(async () => {
      try {
        await result.current.updateTask('some-id', { title: 'Updated' });
      } catch {
        // Expected to throw
      }
    });

    expect(result.current.error).toBe('Failed to update task');
    expect(result.current.loadingUpdateTask).toBe(false);
  });
});

describe('clearError', () => {
  it('clears error state', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.error = 'Some error';
    });

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBe(null);
  });
});
