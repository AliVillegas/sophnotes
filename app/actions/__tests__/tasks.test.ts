import {
  addTaskAction,
  fetchTasksAction,
  deleteTaskAction,
  updateTaskAction,
  completeTaskAction,
} from '../tasks';
import type { Task } from '@/app/stores/task-store';

const mockFrom = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockOrder = jest.fn();
const mockSingle = jest.fn();

jest.mock('@/lib/supabase-server', () => {
  const actualModule = jest.requireActual('@/lib/supabase-server');
  return {
    ...actualModule,
    supabaseServer: {
      from: jest.fn(),
    },
  };
});

import { supabaseServer } from '@/lib/supabase-server';

beforeEach(() => {
  jest.clearAllMocks();
  (supabaseServer.from as jest.Mock) = mockFrom;
});

describe('addTaskAction', () => {
  beforeEach(() => {
    mockInsert.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    });
  });

  it('creates task successfully', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      description: 'Description',
      status: 'pending',
    };

    const createdTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...newTask,
    };

    mockSingle.mockResolvedValue({ data: createdTask, error: null });
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    const result = await addTaskAction(newTask);

    expect(result).toEqual(createdTask);
    expect(mockFrom).toHaveBeenCalledWith('tasks');
  });

  it('throws error when insert fails', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Insert failed' },
    });
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    await expect(addTaskAction(newTask)).rejects.toThrow('Insert failed');
  });

  it('handles network errors', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'network error occurred' },
    });
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    await expect(addTaskAction(newTask)).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });

  it('handles timeout errors', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'request timeout' },
    });
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    await expect(addTaskAction(newTask)).rejects.toThrow(
      'Request timed out. Please try again.'
    );
  });

  it('handles fetch errors', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'fetch failed' },
    });
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    await expect(addTaskAction(newTask)).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });

  it('handles unexpected errors', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    mockSingle.mockRejectedValue(new Error('Unexpected error'));
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    await expect(addTaskAction(newTask)).rejects.toThrow('Unexpected error');
  });

  it('throws error when data is null', async () => {
    const newTask: Omit<Task, 'id'> = {
      title: 'New Task',
      status: 'pending',
    };

    mockSingle.mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({
      insert: mockInsert,
    } as any);

    await expect(addTaskAction(newTask)).rejects.toThrow(
      'Failed to create task'
    );
  });
});

describe('fetchTasksAction', () => {
  beforeEach(() => {
    const mockOrderChain = jest
      .fn()
      .mockResolvedValue({ data: [], error: null });
    mockOrder.mockReturnValue({
      order: mockOrderChain,
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  it('fetches tasks successfully', async () => {
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

    const mockOrderChain = jest
      .fn()
      .mockResolvedValue({ data: tasks, error: null });
    mockOrder.mockReturnValue({
      order: mockOrderChain,
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    const result = await fetchTasksAction();

    expect(result).toEqual(tasks);
    expect(mockOrder).toHaveBeenCalled();
  });

  it('returns empty array when no tasks found', async () => {
    const mockOrderChain = jest
      .fn()
      .mockResolvedValue({ data: null, error: null });
    mockOrder.mockReturnValue({
      order: mockOrderChain,
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    const result = await fetchTasksAction();

    expect(result).toEqual([]);
  });

  it('throws error when fetch fails', async () => {
    const mockOrderChain = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'Fetch failed' },
    });
    mockOrder.mockReturnValue({
      order: mockOrderChain,
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    await expect(fetchTasksAction()).rejects.toThrow('Fetch failed');
  });

  it('handles network errors when fetching', async () => {
    const mockOrderChain = jest.fn().mockResolvedValue({
      data: null,
      error: { message: 'network error' },
    });
    mockOrder.mockReturnValue({
      order: mockOrderChain,
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    await expect(fetchTasksAction()).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });

  it('handles unexpected errors when fetching', async () => {
    const mockOrderChain = jest
      .fn()
      .mockRejectedValue(new Error('Unexpected fetch error'));
    mockOrder.mockReturnValue({
      order: mockOrderChain,
    });
    mockFrom.mockReturnValue({
      select: mockSelect,
    } as any);

    await expect(fetchTasksAction()).rejects.toThrow('Unexpected fetch error');
  });
});

describe('deleteTaskAction', () => {
  beforeEach(() => {
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({
      eq: mockEq,
    });
  });

  it('deletes task successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as any);

    await deleteTaskAction(taskId);

    expect(mockFrom).toHaveBeenCalledWith('tasks');
    expect(mockEq).toHaveBeenCalledWith('id', taskId);
  });

  it('throws error when delete fails', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockEq.mockResolvedValue({ error: { message: 'Delete failed' } });
    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as any);

    await expect(deleteTaskAction(taskId)).rejects.toThrow('Delete failed');
  });

  it('handles network errors when deleting', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockEq.mockResolvedValue({ error: { message: 'network error' } });
    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as any);

    await expect(deleteTaskAction(taskId)).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });

  it('handles unexpected errors when deleting', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockEq.mockRejectedValue(new Error('Unexpected delete error'));
    mockFrom.mockReturnValue({
      delete: mockDelete,
    } as any);

    await expect(deleteTaskAction(taskId)).rejects.toThrow(
      'Unexpected delete error'
    );
  });
});

describe('updateTaskAction', () => {
  beforeEach(() => {
    mockEq.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    });
  });

  it('updates task successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const updates: Partial<Task> = {
      title: 'Updated Task',
    };

    const updatedTask: Task = {
      id: taskId,
      title: 'Updated Task',
      status: 'pending',
    };

    mockSingle.mockResolvedValue({ data: updatedTask, error: null });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await updateTaskAction(taskId, updates);

    expect(result).toEqual(updatedTask);
    expect(mockEq).toHaveBeenCalledWith('id', taskId);
  });

  it('throws error when update fails', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const updates: Partial<Task> = {
      title: 'Updated Task',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Update failed' },
    });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(updateTaskAction(taskId, updates)).rejects.toThrow(
      'Update failed'
    );
  });

  it('throws error when data is null', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const updates: Partial<Task> = {
      title: 'Updated Task',
    };

    mockSingle.mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(updateTaskAction(taskId, updates)).rejects.toThrow(
      'Failed to update task'
    );
  });

  it('handles network errors when updating', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const updates: Partial<Task> = {
      title: 'Updated Task',
    };

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'network error' },
    });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(updateTaskAction(taskId, updates)).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });

  it('handles unexpected errors when updating', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';
    const updates: Partial<Task> = {
      title: 'Updated Task',
    };

    mockSingle.mockRejectedValue(new Error('Unexpected update error'));
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(updateTaskAction(taskId, updates)).rejects.toThrow(
      'Unexpected update error'
    );
  });
});

describe('completeTaskAction', () => {
  beforeEach(() => {
    mockEq.mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: mockSingle,
      }),
    });
  });

  it('completes task successfully', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    const completedTask: Task = {
      id: taskId,
      title: 'Task',
      status: 'completed',
    };

    mockSingle.mockResolvedValue({ data: completedTask, error: null });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    const result = await completeTaskAction(taskId);

    expect(result).toEqual(completedTask);
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'completed' });
  });

  it('throws error when complete fails', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Complete failed' },
    });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(completeTaskAction(taskId)).rejects.toThrow('Complete failed');
  });

  it('throws error when data is null', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockSingle.mockResolvedValue({ data: null, error: null });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(completeTaskAction(taskId)).rejects.toThrow(
      'Failed to complete task'
    );
  });

  it('handles network errors when completing', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'network error' },
    });
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(completeTaskAction(taskId)).rejects.toThrow(
      'Network error. Please check your connection and try again.'
    );
  });

  it('handles unexpected errors when completing', async () => {
    const taskId = '123e4567-e89b-12d3-a456-426614174000';

    mockSingle.mockRejectedValue(new Error('Unexpected complete error'));
    mockFrom.mockReturnValue({
      update: mockUpdate,
    } as any);
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    await expect(completeTaskAction(taskId)).rejects.toThrow(
      'Unexpected complete error'
    );
  });
});
