import {
  taskSchema,
  createTaskSchema,
  updateTaskSchema,
  editTaskFormSchema,
} from '../validations';

describe('Zod Validation Schemas', () => {
  describe('taskSchema', () => {
    it('should validate a valid task', () => {
      const validTask = {
        title: 'Test Task',
        description: 'Test description',
      };
      expect(() => taskSchema.parse(validTask)).not.toThrow();
    });

    it('should reject empty title', () => {
      const invalidTask = {
        title: '',
        description: 'Test description',
      };
      expect(() => taskSchema.parse(invalidTask)).toThrow();
    });

    it('should reject title longer than 200 characters', () => {
      const invalidTask = {
        title: 'a'.repeat(201),
        description: 'Test description',
      };
      expect(() => taskSchema.parse(invalidTask)).toThrow();
    });

    it('should reject description longer than 1000 characters', () => {
      const invalidTask = {
        title: 'Test Task',
        description: 'a'.repeat(1001),
      };
      expect(() => taskSchema.parse(invalidTask)).toThrow();
    });

    it('should accept optional description', () => {
      const validTask = {
        title: 'Test Task',
      };
      expect(() => taskSchema.parse(validTask)).not.toThrow();
    });
  });

  describe('createTaskSchema', () => {
    it('should validate a valid task for creation', () => {
      const validTask = {
        title: 'New Task',
        description: 'New description',
      };
      expect(() => createTaskSchema.parse(validTask)).not.toThrow();
    });

    it('should require title', () => {
      const invalidTask = {
        description: 'Test description',
      };
      expect(() => createTaskSchema.parse(invalidTask)).toThrow();
    });
  });

  describe('updateTaskSchema', () => {
    it('should validate a valid task update with UUID', () => {
      const validUpdate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Task',
        status: 'completed' as const,
      };
      expect(() => updateTaskSchema.parse(validUpdate)).not.toThrow();
    });

    it('should reject invalid UUID', () => {
      const invalidUpdate = {
        id: 'invalid-uuid',
        title: 'Updated Task',
      };
      expect(() => updateTaskSchema.parse(invalidUpdate)).toThrow();
    });

    it('should accept valid status enum', () => {
      const validUpdate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Task',
        status: 'pending' as const,
      };
      expect(() => updateTaskSchema.parse(validUpdate)).not.toThrow();
    });

    it('should reject invalid status', () => {
      const invalidUpdate = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Updated Task',
        status: 'invalid' as any,
      };
      expect(() => updateTaskSchema.parse(invalidUpdate)).toThrow();
    });
  });

  describe('editTaskFormSchema', () => {
    it('should validate a valid edit form', () => {
      const validForm = {
        title: 'Edited Task',
        description: 'Edited description',
        datetime: new Date(),
      };
      expect(() => editTaskFormSchema.parse(validForm)).not.toThrow();
    });

    it('should accept optional datetime', () => {
      const validForm = {
        title: 'Task',
      };
      expect(() => editTaskFormSchema.parse(validForm)).not.toThrow();
    });

    it('should accept form with datetime', () => {
      const validForm = {
        title: 'Task',
        datetime: new Date(),
      };
      expect(() => editTaskFormSchema.parse(validForm)).not.toThrow();
    });

    it('should reject empty title', () => {
      const invalidForm = {
        title: '',
      };
      expect(() => editTaskFormSchema.parse(invalidForm)).toThrow();
    });

    it('should accept optional description', () => {
      const validForm = {
        title: 'Task',
        description: 'Description',
      };
      expect(() => editTaskFormSchema.parse(validForm)).not.toThrow();
    });
  });
});
