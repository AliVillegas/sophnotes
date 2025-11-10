'use client';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useTaskStore } from '@/app/stores/task-store';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createTaskSchema, type CreateTaskInput } from '../validations';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import NewTaskModal from './NewTaskModal';

export default function NewTask() {
  const { addTask, loadingAddTask } = useTaskStore();
  const { toast } = useToast();
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const titleValue = useWatch({ control, name: 'title' });

  const onSubmit = async (data: CreateTaskInput) => {
    try {
      await addTask({ ...data, status: 'pending' });
      reset();
      toast({
        title: 'Task created',
        description: 'Your task has been successfully created.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-start justify-start p-2 font-sans dark:bg-black bg-slate-50 w-11/12 sm:w-auto sm:min-w-96 rounded-md gap-2 mt-6"
      >
        <div className="flex items-start justify-start w-full gap-2">
          <div className="flex-1">
            <Input
              {...register('title')}
              placeholder="Write down a new task"
              aria-label="write new task"
              className={`w-full border-0 bg-transparent focus-visible:ring-0 ${
                errors.title ? 'border-red-500' : ''
              }`}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSubmit(onSubmit)(event);
                }
              }}
            />
            <div className="min-h-[1.5rem] mt-1 px-1">
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
              {titleValue && titleValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAdvancedModal(true)}
                  className="text-purple-500 text-xs hover:text-purple-600 cursor-pointer"
                  aria-label="Advanced options"
                >
                  advanced options
                </button>
              )}
            </div>
          </div>
          {titleValue && titleValue.length > 0 && (
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              aria-label="Add task"
              disabled={loadingAddTask}
            >
              <Send className="size-5" />
            </Button>
          )}
        </div>
      </form>
      {showAdvancedModal && (
        <NewTaskModal
          initialTitle={titleValue}
          onCancel={() => {
            setShowAdvancedModal(false);
          }}
          onClose={() => {
            setShowAdvancedModal(false);
            reset();
          }}
        />
      )}
    </>
  );
}
