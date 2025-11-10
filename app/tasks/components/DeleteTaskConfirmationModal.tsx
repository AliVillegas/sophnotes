'use client';
import { Task, useTaskStore } from '@/app/stores/task-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface DeleteModalProps {
  task: Task;
  onCancel: () => void;
}
export default function DeleteTaskConfirmationModal({
  task,
  onCancel,
}: DeleteModalProps) {
  const { deleteTask, fetchTasks } = useTaskStore();

  const deleteChosenTask = async (id: string) => {
    await deleteTask(id);
    await fetchTasks();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/50">
      <Card className="p-6 w-8/12 md:w-1/2 max-w-md flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <p className="text-lg font-medium">
            Are you sure you want to delete this task? It is still pending.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <p className="font-medium text-center">{task.title}</p>
          {task.description && (
            <p className="font-medium text-center">{task.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[300px]">
          <Button
            aria-label="Confirm Delete"
            variant={'destructive'}
            className="w-full bg-red-500"
            onClick={() => deleteChosenTask(task.id)}
          >
            Confirm deletion
          </Button>

          <Button
            variant="outline"
            aria-label="Cancel"
            className="w-full"
            onClick={() => onCancel()}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
