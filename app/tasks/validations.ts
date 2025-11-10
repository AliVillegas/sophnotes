import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  deadline: z.string().optional(),
});

export const createTaskSchema = taskSchema.omit({});

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const updateTaskSchema = taskSchema.extend({
  id: z.string().refine((val) => uuidRegex.test(val), {
    message: 'Invalid task ID',
  }),
  status: z.enum(['pending', 'completed']).optional(),
});

export const editTaskFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  datetime: z.date().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type EditTaskFormInput = z.infer<typeof editTaskFormSchema>;
