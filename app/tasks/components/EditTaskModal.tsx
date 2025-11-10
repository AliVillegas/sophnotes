'use client';
import { Task, useTaskStore } from '@/app/stores/task-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import Datetime from 'react-datetime';
import 'react-datetime/css/react-datetime.css';
import './react-datetime-custom.css';
import { editTaskFormSchema, type EditTaskFormInput } from '../validations';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import moment from 'moment';

interface EditModalProps {
  task: Task;
  onCancel: () => void;
  onClose: () => void;
}

export default function EditTaskModal({
  task,
  onCancel,
  onClose,
}: EditModalProps) {
  const { updateTask, fetchTasks } = useTaskStore();
  const { toast } = useToast();

  const initialDeadline = task.deadline ? new Date(task.deadline) : undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<EditTaskFormInput>({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: {
      title: task.title,
      description: task.description || '',
      datetime: initialDeadline,
    },
  });

  const onSubmit = async (data: EditTaskFormInput) => {
    try {
      const updatedTask = {
        ...task,
        title: data.title,
        description: data.description,
        deadline: data.datetime ? data.datetime.toISOString() : undefined,
      };
      await updateTask(task.id, updatedTask);
      await fetchTasks();
      toast({
        title: 'Task updated',
        description: 'Your task has been successfully updated.',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-500/50">
      <Card className="p-6 w-11/12 md:w-2/3 lg:w-1/2 max-w-2xl flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Update task</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <div className="grid w-full items-center gap-3">
            <Label htmlFor="task-title">Title</Label>
            <Input
              {...register('title')}
              type="text"
              id="task-title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-red-500 text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="task-description">Description</Label>
            <Input
              {...register('description')}
              type="text"
              id="task-description"
              placeholder="describe this task"
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid w-full items-center gap-3">
            <Label htmlFor="datetime-picker">Due date & time (optional)</Label>
            <Controller
              name="datetime"
              control={control}
              render={({ field }) => (
                <Datetime
                  value={field.value ? moment(field.value) : undefined}
                  onChange={(momentValue) => {
                    field.onChange(
                      momentValue instanceof moment
                        ? momentValue.toDate()
                        : undefined
                    );
                  }}
                  inputProps={{
                    id: 'datetime-picker',
                    placeholder: 'Select date and time',
                    className: `w-full px-3 py-2 border rounded-md bg-background ${
                      errors.datetime ? 'border-red-500' : ''
                    }`,
                  }}
                />
              )}
            />
            {errors.datetime && (
              <p className="text-red-500 text-sm">{errors.datetime.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Button type="submit" aria-label="Confirm Edit" className="w-full">
              Confirm
            </Button>

            <Button
              type="button"
              variant="outline"
              aria-label="Cancel"
              className="w-full"
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
