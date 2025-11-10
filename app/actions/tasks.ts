'use server';

import { supabaseServer } from '@/lib/supabase-server';
import type { Task } from '@/app/stores/task-store';

export async function addTaskAction(task: Omit<Task, 'id'>): Promise<Task> {
  const { data, error } = await supabaseServer
    .from('tasks')
    .insert([task])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to create task');
  }

  return data;
}

export async function fetchTasksAction(): Promise<Task[]> {
  const { data: tasks, error } = await supabaseServer
    .from('tasks')
    .select('*')
    .order('status', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return tasks || [];
}

export async function deleteTaskAction(id: string): Promise<void> {
  const { error } = await supabaseServer.from('tasks').delete().eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateTaskAction(
  id: string,
  updates: Partial<Task>
): Promise<Task> {
  const { data, error } = await supabaseServer
    .from('tasks')
    .update({ ...updates })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to update task');
  }

  return data;
}

export async function completeTaskAction(id: string): Promise<Task> {
  const { data, error } = await supabaseServer
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to complete task');
  }

  return data;
}
