import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteTaskConfirmationModal from '../DeleteTaskConfirmationModal';
import { useTaskStore } from '@/app/stores/task-store';
import { Task } from '@/app/stores/task-store';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/app/stores/task-store');
jest.mock('@/hooks/use-toast');

const mockDeleteTask = jest.fn();
const mockFetchTasks = jest.fn();
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockToast = jest.fn();

const mockTask: Task = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Task',
  description: 'Test Description',
  status: 'pending',
};

describe('DeleteTaskConfirmationModal Component', () => {
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskStore.mockReturnValue({
      deleteTask: mockDeleteTask,
      fetchTasks: mockFetchTasks,
    } as any);
    mockUseToast.mockReturnValue({
      toast: mockToast,
    } as any);
  });

  it('renders the modal with task information', () => {
    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    expect(
      screen.getByText(
        'Are you sure you want to delete this task? It is still pending.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders task title when description is missing', () => {
    const taskWithoutDescription: Task = {
      ...mockTask,
      description: undefined,
    };

    render(
      <DeleteTaskConfirmationModal
        task={taskWithoutDescription}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
  });

  it('calls deleteTask and fetchTasks when confirm is clicked', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue(undefined);
    mockFetchTasks.mockResolvedValue(undefined);

    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    const confirmButton = screen.getByLabelText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteTask).toHaveBeenCalledWith(mockTask.id);
      expect(mockFetchTasks).toHaveBeenCalled();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    const cancelButton = screen.getByLabelText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows success toast and calls onCancel when delete succeeds', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockResolvedValue(undefined);
    mockFetchTasks.mockResolvedValue(undefined);

    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    const confirmButton = screen.getByLabelText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Task deleted',
        description: 'Your task has been successfully deleted.',
      });
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  it('shows error toast when deleteTask fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to delete task');
    mockDeleteTask.mockRejectedValue(error);
    mockFetchTasks.mockResolvedValue(undefined);

    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    const confirmButton = screen.getByLabelText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  it('shows error toast when fetchTasks fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to fetch tasks');
    mockDeleteTask.mockResolvedValue(undefined);
    mockFetchTasks.mockRejectedValue(error);

    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    const confirmButton = screen.getByLabelText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to fetch tasks',
        variant: 'destructive',
      });
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  it('handles non-Error exceptions', async () => {
    const user = userEvent.setup();
    mockDeleteTask.mockRejectedValue('String error');
    mockFetchTasks.mockResolvedValue(undefined);

    render(
      <DeleteTaskConfirmationModal task={mockTask} onCancel={mockOnCancel} />
    );

    const confirmButton = screen.getByLabelText('Confirm Delete');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    });
  });
});
