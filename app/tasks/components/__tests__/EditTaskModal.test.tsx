import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditTaskModal from '../EditTaskModal';
import { useTaskStore } from '@/app/stores/task-store';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/app/stores/task-store';

jest.mock('@/app/stores/task-store');
jest.mock('@/hooks/use-toast');

const mockUpdateTask = jest.fn();
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

describe('EditTaskModal Component', () => {
  const mockOnCancel = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskStore.mockReturnValue({
      updateTask: mockUpdateTask,
      fetchTasks: mockFetchTasks,
    } as any);
    mockUseToast.mockReturnValue({
      toast: mockToast,
    } as any);
  });

  it('renders the modal with task data', () => {
    render(
      <EditTaskModal
        task={mockTask}
        onCancel={mockOnCancel}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Update task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Description')).toBeInTheDocument();
  });

  it('updates task successfully', async () => {
    const user = userEvent.setup();
    mockUpdateTask.mockResolvedValue(undefined);
    mockFetchTasks.mockResolvedValue(undefined);

    render(
      <EditTaskModal
        task={mockTask}
        onCancel={mockOnCancel}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    const submitButton = screen.getByLabelText('Confirm Edit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateTask).toHaveBeenCalledWith(
        mockTask.id,
        expect.objectContaining({
          title: 'Updated Task',
        })
      );
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Task updated',
        description: 'Your task has been successfully updated.',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();

    render(
      <EditTaskModal
        task={mockTask}
        onCancel={mockOnCancel}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);

    const submitButton = screen.getByLabelText('Confirm Edit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockUpdateTask).not.toHaveBeenCalled();
  });

  it('shows error toast when update fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to update task');
    mockUpdateTask.mockRejectedValue(error);

    render(
      <EditTaskModal
        task={mockTask}
        onCancel={mockOnCancel}
        onClose={mockOnClose}
      />
    );

    const submitButton = screen.getByLabelText('Confirm Edit');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EditTaskModal
        task={mockTask}
        onCancel={mockOnCancel}
        onClose={mockOnClose}
      />
    );

    const cancelButton = screen.getByLabelText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });
});
