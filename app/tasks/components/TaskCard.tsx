'use client';
import { Task, useTaskStore } from '@/app/stores/task-store';
import { Trash2, Check, PencilLineIcon, Clock, Calendar } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import DeleteTaskConfirmationModal from './DeleteTaskConfirmationModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import EditTaskModal from './EditTaskModal';

interface TaskCardProps {
  task: Task;
}
export default function TaskCard({ task }: TaskCardProps) {
  const { deleteTask, completeTask, fetchTasks } = useTaskStore();
  const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] =
    useState<boolean>(false);

  const [showEditTaskModal, setShowEditTaskModal] = useState<boolean>(false);
  const isPending = task.status === 'pending';

  const deleteChosenTask = async () => {
    if (task.status === 'pending') {
      setShowDeleteConfirmationModal(true);
    } else {
      deleteTask(task.id);
      fetchTasks();
    }
  };

  return (
    <Card className="group w-full flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Badge
            variant={task.status === 'pending' ? 'secondary' : 'default'}
            className={
              task.status === 'pending'
                ? 'bg-orange-500 text-white border-orange-600'
                : 'bg-green-500 text-white border-green-600'
            }
          >
            {task.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete task"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => deleteChosenTask()}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-tight text-foreground">
            {task.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {task.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-2 pt-4 border-t relative">
        <div className="flex items-center gap-3 text-muted-foreground">
          {task.created_at && (
            <Tooltip
              content={`Created at: ${format(new Date(task.created_at), "PPP 'at' p")}`}
              side="top"
            >
              <div className="flex items-center gap-1.5">
                <Clock className="size-4" />
              </div>
            </Tooltip>
          )}
          {task.deadline && (
            <Tooltip
              content={`Deadline: ${format(new Date(task.deadline), "PPP 'at' p")}`}
              side="top"
            >
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
              </div>
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {isPending && (
            <Button
              variant="ghost"
              size="sm"
              aria-label="Complete task"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => {
                completeTask(task.id);
              }}
            >
              <Check className="size-4 mr-2" />
              Complete
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label="Edit task"
            onClick={() => {
              setShowEditTaskModal(true);
            }}
          >
            <PencilLineIcon className="size-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardFooter>

      {showDeleteConfirmationModal && (
        <DeleteTaskConfirmationModal
          task={task}
          onCancel={() => {
            setShowDeleteConfirmationModal(false);
          }}
        ></DeleteTaskConfirmationModal>
      )}

      {showEditTaskModal && (
        <EditTaskModal
          task={task}
          onCancel={() => {
            setShowEditTaskModal(false);
          }}
          onClose={() => {
            setShowEditTaskModal(false);
          }}
        ></EditTaskModal>
      )}
    </Card>
  );
}
