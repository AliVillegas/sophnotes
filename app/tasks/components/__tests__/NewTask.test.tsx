import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NewTask from '../NewTask';
import { useTaskStore } from '@/app/stores/task-store';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/app/stores/task-store');
jest.mock('@/hooks/use-toast');

const mockAddTask = jest.fn();
const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;
const mockToast = jest.fn();

describe('NewTask Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskStore.mockReturnValue({
      addTask: mockAddTask,
      loadingAddTask: false,
    } as any);
    mockUseToast.mockReturnValue({
      toast: mockToast,
    } as any);
  });

  it('renders the input field', () => {
    render(<NewTask />);
    expect(
      screen.getByPlaceholderText('Write down a new task')
    ).toBeInTheDocument();
  });

  it('shows submit button when title has value', async () => {
    const user = userEvent.setup();
    render(<NewTask />);
    const input = screen.getByPlaceholderText('Write down a new task');

    await user.type(input, 'Test task');

    await waitFor(() => {
      expect(screen.getByLabelText('Add task')).toBeInTheDocument();
    });
  });

  it('validates and submits a valid task', async () => {
    const user = userEvent.setup();
    mockAddTask.mockResolvedValue(undefined);

    render(<NewTask />);
    const input = screen.getByPlaceholderText('Write down a new task');

    await user.type(input, 'Test task');

    const submitButton = await screen.findByLabelText('Add task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalledWith({
        title: 'Test task',
        description: '',
        status: 'pending',
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Task created',
        description: 'Your task has been successfully created.',
      });
    });
  });

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup();
    render(<NewTask />);
    const input = screen.getByPlaceholderText('Write down a new task');

    await user.type(input, ' ');
    await user.clear(input);
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });
  });

  it('shows error toast when task creation fails', async () => {
    const user = userEvent.setup();
    const error = new Error('Failed to create task');
    mockAddTask.mockRejectedValue(error);

    render(<NewTask />);
    const input = screen.getByPlaceholderText('Write down a new task');

    await user.type(input, 'Test task');

    const submitButton = await screen.findByLabelText('Add task');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to create task',
        variant: 'destructive',
      });
    });
  });

  it('submits on Enter key press', async () => {
    const user = userEvent.setup();
    mockAddTask.mockResolvedValue(undefined);

    render(<NewTask />);
    const input = screen.getByPlaceholderText('Write down a new task');

    await user.type(input, 'Test task{Enter}');

    await waitFor(() => {
      expect(mockAddTask).toHaveBeenCalled();
    });
  });
});
