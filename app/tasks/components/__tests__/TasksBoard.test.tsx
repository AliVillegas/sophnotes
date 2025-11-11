import { render, screen } from '@testing-library/react';
import TasksBoard from '../TasksBoard';
import { useTaskStore } from '@/app/stores/task-store';
import { Task } from '@/app/stores/task-store';

jest.mock('@/app/stores/task-store');
jest.mock('../TaskCard', () => {
  return function MockTaskCard({ task }: { task: Task }) {
    return <div>{task.title}</div>;
  };
});

const mockUseTaskStore = useTaskStore as jest.MockedFunction<
  typeof useTaskStore
>;

const mockPendingTask: Task = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Pending Task',
  description: 'Pending Description',
  status: 'pending',
};

const mockCompletedTask: Task = {
  id: '223e4567-e89b-12d3-a456-426614174001',
  title: 'Completed Task',
  description: 'Completed Description',
  status: 'completed',
};

describe('TasksBoard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pending tasks section when pending tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockPendingTask] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pending Task')).toBeInTheDocument();
  });

  it('renders completed tasks section when completed tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockCompletedTask] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('renders both sections when both pending and completed tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockPendingTask, mockCompletedTask] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(screen.getByText('Pending Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('Pending Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
  });

  it('renders divider when both pending and completed tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockPendingTask, mockCompletedTask] };
      return selector(state as any);
    });

    const { container } = render(<TasksBoard />);
    const divider = container.querySelector('.border-t');
    expect(divider).toBeInTheDocument();
  });

  it('does not render divider when only pending tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockPendingTask] };
      return selector(state as any);
    });

    const { container } = render(<TasksBoard />);
    const divider = container.querySelector('.border-t');
    expect(divider).not.toBeInTheDocument();
  });

  it('does not render divider when only completed tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockCompletedTask] };
      return selector(state as any);
    });

    const { container } = render(<TasksBoard />);
    const divider = container.querySelector('.border-t');
    expect(divider).not.toBeInTheDocument();
  });

  it('renders empty state when no tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(
      screen.getByText('No tasks yet. Create your first task above!')
    ).toBeInTheDocument();
  });

  it('does not render sections when no tasks exist', () => {
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(screen.queryByText('Pending Tasks')).not.toBeInTheDocument();
    expect(screen.queryByText('Completed Tasks')).not.toBeInTheDocument();
  });

  it('filters and displays multiple pending tasks', () => {
    const pendingTask2: Task = {
      id: '323e4567-e89b-12d3-a456-426614174002',
      title: 'Pending Task 2',
      status: 'pending',
    };
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockPendingTask, pendingTask2] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(screen.getByText('Pending Task')).toBeInTheDocument();
    expect(screen.getByText('Pending Task 2')).toBeInTheDocument();
  });

  it('filters and displays multiple completed tasks', () => {
    const completedTask2: Task = {
      id: '423e4567-e89b-12d3-a456-426614174003',
      title: 'Completed Task 2',
      status: 'completed',
    };
    mockUseTaskStore.mockImplementation((selector) => {
      const state = { tasks: [mockCompletedTask, completedTask2] };
      return selector(state as any);
    });

    render(<TasksBoard />);
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task 2')).toBeInTheDocument();
  });
});
