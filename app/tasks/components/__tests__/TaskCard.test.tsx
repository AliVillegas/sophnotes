import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskCard from '../TaskCard';
import { useTaskStore } from '@/app/stores/task-store';
import { Task } from '@/app/stores/task-store';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/app/stores/task-store');
jest.mock('@/hooks/use-toast');

const mockDeleteTask = jest.fn();
const mockCompleteTask = jest.fn();
const mockFetchTasks = jest.fn();
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockToast = jest.fn();

const mockPendingTask: Task = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
  created_at: '2024-01-01T00:00:00Z',
};

const mockCompletedTask: Task = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  title: 'Completed Task',
  description: 'Completed Description',
  status: 'completed',
  created_at: '2024-01-01T00:00:00Z',
};

describe('TaskCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskStore.mockReturnValue({
      deleteTask: mockDeleteTask,
      completeTask: mockCompleteTask,
      fetchTasks: mockFetchTasks,
    } as any);
    mockUseToast.mockReturnValue({
      toast: mockToast,
    } as any);
  });

  it('renders task title and description', () => {
    render(<TaskCard task={mockPendingTask} />);
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders pending status badge', () => {
    render(<TaskCard task={mockPendingTask} />);
    const badge = screen.getByText('pending');
    expect(badge).toBeInTheDocument();
  });

  it('renders completed status badge', () => {
    render(<TaskCard task={mockCompletedTask} />);
    const badge = screen.getByText('completed');
    expect(badge).toBeInTheDocument();
  });

  it('shows complete button for pending tasks', () => {
    render(<TaskCard task={mockPendingTask} />);
    expect(screen.getByLabelText('Complete task')).toBeInTheDocument();
  });

  it('does not show complete button for completed tasks', () => {
    render(<TaskCard task={mockCompletedTask} />);
    expect(screen.queryByLabelText('Complete task')).not.toBeInTheDocument();
  });

  it('calls completeTask when complete button is clicked', async () => {
    const user = userEvent.setup();
    mockCompleteTask.mockResolvedValue(undefined);

    render(<TaskCard task={mockPendingTask} />);
    const completeButton = screen.getByLabelText('Complete task');
    await user.click(completeButton);

    expect(mockCompleteTask).toHaveBeenCalledWith(mockPendingTask.id);
  });

  it('opens delete confirmation modal for pending tasks', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockPendingTask} />);

    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Are you sure you want to delete this task? It is still pending.'
        )
      ).toBeInTheDocument();
    });
  });

  it('deletes completed task directly without confirmation', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue(undefined);
    mockFetchTasks.mockResolvedValue(undefined);

    render(<TaskCard task={mockCompletedTask} />);

    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(mockCompletedTask.id);
      expect(mockFetchTasks).toHaveBeenCalled();
    });
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockPendingTask} />);

    const editButton = screen.getByLabelText('Edit task');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByText('Update task')).toBeInTheDocument();
    });
  });

  it('renders created_at date when available', () => {
    const { container } = render(<TaskCard task={mockPendingTask} />);
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(0);
  });

  it('renders deadline when available', () => {
    const taskWithDeadline: Task = {
      ...mockPendingTask,
      deadline: '2024-12-31T23:59:59Z',
    };
    const { container } = render(<TaskCard task={taskWithDeadline} />);
    const svgElements = container.querySelectorAll('svg');
    expect(svgElements.length).toBeGreaterThan(1);
  });

  it('closes delete confirmation modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskCard task={mockPendingTask} />);

    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Are you sure you want to delete this task? It is still pending.'
        )
      ).toBeInTheDocument();
    });

    const cancelButton = screen.getByLabelText('Cancel');
    await user.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Are you sure you want to delete this task? It is still pending.'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('shows error toast when completeTask fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to complete task');
    mockCompleteTask.mockRejectedValue(error);

    render(<TaskCard task={mockPendingTask} />);
    const completeButton = screen.getByLabelText('Complete task');
    await user.click(completeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    });
  });

  it('shows success toast when completeTask succeeds', async () => {
    const user = userEvent.setup();
    mockCompleteTask.mockResolvedValue(undefined);

    render(<TaskCard task={mockPendingTask} />);
    const completeButton = screen.getByLabelText('Complete task');
    await user.click(completeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Task completed',
        description: 'Your task has been successfully completed.',
      });
    });
  });

  it('shows error toast when deleteTask fails for completed task', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to delete task');
    mockDeleteTask.mockRejectedValue(error);
    mockFetchTasks.mockResolvedValue(undefined);

    render(<TaskCard task={mockCompletedTask} />);
    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    });
  });

  it('shows error toast when fetchTasks fails after delete', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to fetch tasks');
    mockDeleteTask.mockResolvedValue(undefined);
    mockFetchTasks.mockRejectedValue(error);

    render(<TaskCard task={mockCompletedTask} />);
    const deleteButton = screen.getByLabelText('Delete task');
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
    });
  });

  it('handles non-Error exceptions in completeTask', async () => {
    const user = userEvent.setup();
    mockCompleteTask.mockRejectedValue('String error');

    render(<TaskCard task={mockPendingTask} />);
    const completeButton = screen.getByLabelText('Complete task');
    await user.click(completeButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to complete task',
        variant: 'destructive',
      });
    });
  });
});
