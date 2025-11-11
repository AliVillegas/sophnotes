'use server';

import { supabaseServer } from '@/lib/supabase-server';
import type { Task } from '@/app/stores/task-store';

function handleSupabaseError(error: unknown, defaultMessage: string): never {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message);
    if (message.includes('network') || message.includes('fetch')) {
      throw new Error(
        'Network error. Please check your connection and try again.'
      );
    }
    if (message.includes('timeout')) {
      throw new Error('Request timed out. Please try again.');
    }
    throw new Error(message);
  }
  throw new Error(defaultMessage);
}

export async function addTaskAction(task: Omit<Task, 'id'>): Promise<Task> {
  try {
    const { data, error } = await supabaseServer
      .from('tasks')
      .insert([task])
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to create task');
    }

    if (!data) {
      throw new Error('Failed to create task');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    handleSupabaseError(error, 'Failed to create task');
  }
}

export async function fetchTasksAction(): Promise<Task[]> {
  try {
    const { data: tasks, error } = await supabaseServer
      .from('tasks')
      .select('*')
      .order('status', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Failed to fetch tasks');
    }

    return tasks || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    handleSupabaseError(error, 'Failed to fetch tasks');
  }
}

export async function deleteTaskAction(id: string): Promise<void> {
  try {
    const { error } = await supabaseServer.from('tasks').delete().eq('id', id);

    if (error) {
      handleSupabaseError(error, 'Failed to delete task');
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    handleSupabaseError(error, 'Failed to delete task');
  }
}

export async function updateTaskAction(
  id: string,
  updates: Partial<Task>
): Promise<Task> {
  try {
    const { data, error } = await supabaseServer
      .from('tasks')
      .update({ ...updates })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to update task');
    }

    if (!data) {
      throw new Error('Failed to update task');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    handleSupabaseError(error, 'Failed to update task');
  }
}

export async function completeTaskAction(id: string): Promise<Task> {
  try {
    const { data, error } = await supabaseServer
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error, 'Failed to complete task');
    }

    if (!data) {
      throw new Error('Failed to complete task');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    handleSupabaseError(error, 'Failed to complete task');
  }
}
