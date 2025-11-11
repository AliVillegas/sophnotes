import { render, screen, waitFor } from '@testing-library/react';
import Tasks from '../page';
import { useTaskStore } from '@/app/stores/task-store';
import { Task } from '@/app/stores/task-store';
import { useToast } from '@/hooks/use-toast';

jest.mock('@/app/stores/task-store');
jest.mock('@/hooks/use-toast');
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ priority, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />;
  },
}));
jest.mock('../components/TasksBoard', () => {
  return function MockTasksBoard() {
    return <div data-testid="tasks-board">Tasks Board</div>;
  };
});

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
};

describe('Tasks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskStore.mockReturnValue({
      fetchTasks: mockFetchTasks,
      tasks: [],
    } as any);
    mockUseToast.mockReturnValue({
      toast: mockToast,
    } as any);
  });

  it('fetches tasks on mount', () => {
    render(<Tasks />);
    expect(mockFetchTasks).toHaveBeenCalled();
  });

  it('renders Header component', () => {
    render(<Tasks />);
    expect(screen.getByText('Sofia Challenge')).toBeInTheDocument();
  });

  it('renders NewTask component', () => {
    render(<Tasks />);
    expect(
      screen.getByPlaceholderText('Write down a new task')
    ).toBeInTheDocument();
  });

  it('shows loading spinner when no tasks exist', () => {
    mockUseTaskStore.mockReturnValue({
      fetchTasks: mockFetchTasks,
      tasks: [],
    } as any);

    const { container } = render(<Tasks />);
    const spinner = container.querySelector('[class*="animate-spin"]');
    expect(spinner).toBeInTheDocument();
  });

  it('renders TasksBoard when tasks exist', () => {
    mockUseTaskStore.mockReturnValue({
      fetchTasks: mockFetchTasks,
      tasks: [mockPendingTask],
    } as any);

    render(<Tasks />);
    expect(screen.getByTestId('tasks-board')).toBeInTheDocument();
  });

  it('does not show spinner when tasks exist', () => {
    mockUseTaskStore.mockReturnValue({
      fetchTasks: mockFetchTasks,
      tasks: [mockPendingTask],
    } as any);

    const { container } = render(<Tasks />);
    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner).not.toBeInTheDocument();
  });

  it('calls fetchTasks only once on mount', () => {
    const { rerender } = render(<Tasks />);
    expect(mockFetchTasks).toHaveBeenCalledTimes(1);

    rerender(<Tasks />);
    expect(mockFetchTasks).toHaveBeenCalledTimes(1);
  });

  it('shows error toast when fetchTasks fails on mount', async () => {
    const error = new Error('Failed to load tasks');
    mockFetchTasks.mockRejectedValue(error);

    render(<Tasks />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load tasks',
        variant: 'destructive',
      });
    });
  });

  it('handles non-Error exceptions when fetchTasks fails', async () => {
    mockFetchTasks.mockRejectedValue('String error');

    render(<Tasks />);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load tasks. Please refresh the page.',
        variant: 'destructive',
      });
    });
  });

  it('does not show error toast when fetchTasks succeeds', async () => {
    mockFetchTasks.mockResolvedValue(undefined);

    render(<Tasks />);

    await waitFor(() => {
      expect(mockFetchTasks).toHaveBeenCalled();
    });

    expect(mockToast).not.toHaveBeenCalled();
  });
});
