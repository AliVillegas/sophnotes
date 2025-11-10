'use client';
import { useTaskStore } from '@/app/stores/task-store';
import TaskCard from './TaskCard';

export default function TasksBoard() {
  const tasks = useTaskStore((state) => state.tasks);

  const pendingTasks = tasks.filter((task) => task.status === 'pending');
  const completedTasks = tasks.filter((task) => task.status === 'completed');

  return (
    <div className="flex flex-col p-4 font-sans dark:bg-black bg-slate-50 w-full rounded-md gap-8">
      {pendingTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">Pending Tasks</h2>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingTasks.map((task) => {
              return <TaskCard key={task.id} task={task} />;
            })}
          </div>
        </div>
      )}

      {pendingTasks.length > 0 && completedTasks.length > 0 && (
        <div className="border-t border-border"></div>
      )}

      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            Completed Tasks
          </h2>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => {
              return <TaskCard key={task.id} task={task} />;
            })}
          </div>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="text-center text-muted-foreground">
          <p>No tasks yet. Create your first task above!</p>
        </div>
      )}
    </div>
  );
}
