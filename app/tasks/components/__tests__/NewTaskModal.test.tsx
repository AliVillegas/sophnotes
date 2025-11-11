import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewTaskModal from '../NewTaskModal';
import { useTaskStore } from '@/app/stores/task-store';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/app/stores/task-store');
jest.mock('@/hooks/use-toast');
jest.mock('react-datetime', () => {
  return jest.fn(({ inputProps, onChange }) => (
    <input
      {...inputProps}
      onChange={() => {
        if (onChange) {
          const mockMoment = {
            toDate: () => new Date('2024-12-31T23:59:59Z'),
          };
          onChange(mockMoment);
        }
      }}
      data-testid="datetime-input"
    />
  ));
});

const mockAddTask = jest.fn();
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockToast = jest.fn();

describe('NewTaskModal Component', () => {
  const mockOnCancel = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskStore.mockReturnValue({
      addTask: mockAddTask,
    } as any);
    mockUseToast.mockReturnValue({
      toast: mockToast,
    } as any);
  });

  it('renders the modal with form fields', () => {
    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    expect(screen.getByText('Create new task')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Due date & time (optional)')
    ).toBeInTheDocument();
  });

  it('pre-fills title when initialTitle is provided', () => {
    render(
      <NewTaskModal
        initialTitle="Pre-filled Title"
        onCancel={mockOnCancel}
        onClose={mockOnClose}
      />
    );

    const titleInput = screen.getByLabelText('Title') as HTMLInputElement;
    expect(titleInput.value).toBe('Pre-filled Title');
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    mockAddTask.mockResolvedValue(undefined);

    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');

    await user.type(titleInput, 'New Task');
    await user.type(descriptionInput, 'New Description');

    const submitButton = screen.getByLabelText('Create Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New Description',
        deadline: undefined,
        status: 'pending',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Task created',
        description: 'Your task has been successfully created.',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('submits form with deadline when datetime is selected', async () => {
    const user = userEvent.setup();
    mockAddTask.mockResolvedValue(undefined);

    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Task with Deadline');

    const datetimeInput = screen.getByTestId('datetime-input');
    await user.click(datetimeInput);

    const changeEvent = new Event('change', { bubbles: true });
    datetimeInput.dispatchEvent(changeEvent);

    const submitButton = screen.getByLabelText('Create Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalled();
      const callArgs = mockAddTask.mock.calls[0][0];
      expect(callArgs.title).toBe('Task with Deadline');
      expect(callArgs.status).toBe('pending');
    });
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();

    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    const submitButton = screen.getByLabelText('Create Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(mockAddTask).not.toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    const cancelButton = screen.getByLabelText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows error toast when task creation fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to create task');
    mockAddTask.mockRejectedValue(error);

    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Task');

    const submitButton = screen.getByLabelText('Create Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('handles generic error when error is not an Error instance', async () => {
    const user = userEvent.setup();
    mockAddTask.mockRejectedValue('String error');

    render(<NewTaskModal onCancel={mockOnCancel} onClose={mockOnClose} />);

    const titleInput = screen.getByLabelText('Title');
    await user.type(titleInput, 'Test Task');

    const submitButton = screen.getByLabelText('Create Task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    });
  });
});
