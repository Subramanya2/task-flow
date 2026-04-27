"use client";

import { TaskWithRelations } from "@/types";
import { TaskCard } from "./task-card";
import { TaskStatus } from "@prisma/client";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskListProps {
  tasks: TaskWithRelations[];
  isLoading: boolean;
  currentUserId: string;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onDelete?: (taskId: string) => void;
  onAssign?: (task: TaskWithRelations) => void;
  emptyMessage?: string;
  filter?: "ALL" | "MY_TASKS" | "ASSIGNED_TO_ME";
}

export function TaskList({
  tasks,
  isLoading,
  currentUserId,
  onStatusChange,
  onEdit,
  onDelete,
  onAssign,
  emptyMessage = "No tasks found",
  filter = "ALL",
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="flex flex-col gap-4 p-4 border rounded-xl bg-card">
            <div className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <Skeleton className="h-10 w-full mt-2" />
            <div className="flex justify-between mt-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter tasks based on the active tab
  const filteredTasks = tasks.filter((task) => {
    if (filter === "MY_TASKS") return task.creatorId === currentUserId;
    if (filter === "ASSIGNED_TO_ME") return task.assigneeId === currentUserId;
    return true; // ALL
  });

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-xl bg-muted/10 h-64">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
          <ClipboardList className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">{emptyMessage}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {filter === "ASSIGNED_TO_ME" 
            ? "You don't have any tasks assigned to you right now. Relax!" 
            : "Get started by creating a new task to keep track of your work."}
        </p>
      </div>
    );
  }

  // Group by status
  const todoTasks = filteredTasks.filter((t) => t.status === TaskStatus.TODO);
  const inProgressTasks = filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const completedTasks = filteredTasks.filter((t) => t.status === TaskStatus.COMPLETED);

  return (
    <div className="flex flex-col gap-8">
      {todoTasks.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            To Do <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-normal text-muted-foreground">{todoTasks.length}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUserId}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssign={onAssign}
              />
            ))}
          </div>
        </div>
      )}

      {inProgressTasks.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            In Progress <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-normal text-muted-foreground">{inProgressTasks.length}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUserId}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssign={onAssign}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg flex items-center gap-2 opacity-70">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completed <span className="bg-muted px-2 py-0.5 rounded-full text-xs font-normal text-muted-foreground">{completedTasks.length}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                currentUserId={currentUserId}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onAssign={onAssign}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
