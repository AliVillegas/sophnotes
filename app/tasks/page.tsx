'use client';
import { useEffect } from 'react';
import NewTask from './components/NewTask';
import TasksBoard from './components/TasksBoard';
import { useTaskStore } from '../stores/task-store';
import { Spinner } from '@/components/ui/spinner';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center w-screen">
      <Spinner className="text-purple-500" />
    </div>
  );
};

export default function Tasks() {
  const { fetchTasks, tasks } = useTaskStore();
  const { toast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await fetchTasks();
      } catch (error) {
        toast({
          title: 'Error',
          description:
            error instanceof Error
              ? error.message
              : 'Failed to load tasks. Please refresh the page.',
          variant: 'destructive',
        });
      }
    };
    loadTasks();
  }, [fetchTasks, toast]);

  return (
    <>
      <Header />
      <div className="flex grow items-center justify-center pt-24 sm:pt-28 pb-6 font-sans dark:bg-black">
        <NewTask />
      </div>
      {tasks.length === 0 ? <LoadingSpinner /> : <TasksBoard />}
    </>
  );
}
