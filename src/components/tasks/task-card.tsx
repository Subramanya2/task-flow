"use client";

import { TaskWithRelations } from "@/types";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Priority, TaskStatus } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, Clock, MessageSquare, MoreVertical, Edit2, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskWithRelations;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onEdit?: (task: TaskWithRelations) => void;
  onDelete?: (taskId: string) => void;
  onAssign?: (task: TaskWithRelations) => void;
  currentUserId: string;
}

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onAssign,
  currentUserId,
}: TaskCardProps) {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isCreator = task.creatorId === currentUserId;

  const priorityColors = {
    [Priority.LOW]: "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20",
    [Priority.MEDIUM]: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
    [Priority.HIGH]: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
    [Priority.URGENT]: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  const getDueDateDisplay = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    if (isToday(d)) return <span className="text-orange-500 font-medium">Today</span>;
    if (isTomorrow(d)) return <span>Tomorrow</span>;
    if (isPast(d) && !isCompleted) return <span className="text-destructive font-medium">Overdue</span>;
    return <span>{format(d, "MMM d")}</span>;
  };

  const handleToggleStatus = () => {
    if (onStatusChange) {
      onStatusChange(task.id, isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", isCompleted && "opacity-60 bg-muted/30")}>
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-start gap-3 w-full">
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleToggleStatus}
            className="mt-1 flex-shrink-0 transition-all data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
          />
          <div className="flex flex-col gap-1 w-full overflow-hidden">
            <h3
              className={cn(
                "font-semibold truncate text-base leading-tight",
                isCompleted && "line-through text-muted-foreground"
              )}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className={cn("text-[10px] uppercase px-1.5 py-0", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              {task.dueDate && (
                <div className="flex items-center text-xs text-muted-foreground gap-1">
                  <CalendarIcon className="size-3" />
                  {getDueDateDisplay(task.dueDate)}
                </div>
              )}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mt-1 -mr-2 h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit?.(task)}>
              <Edit2 className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
            {isCreator && (
              <DropdownMenuItem onClick={() => onAssign?.(task)}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Assign</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggleStatus}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              <span>Mark as {isCompleted ? "To Do" : "Completed"}</span>
            </DropdownMenuItem>
            {isCreator && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={() => onDelete?.(task.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      
      {task.description && (
        <CardContent className="p-4 pt-0 pb-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      )}

      <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          {task.assignee ? (
            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignee.name}`}>
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignee.image || ""} />
                <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[80px]">{task.assignee.name?.split(" ")[0]}</span>
            </div>
          ) : task.assigneeEmail ? (
            <div className="flex items-center gap-1.5" title={`Pending assignment to ${task.assigneeEmail}`}>
              <div className="h-5 w-5 rounded-full bg-orange-100 flex items-center justify-center border border-dashed border-orange-300">
                <Clock className="h-3 w-3 text-orange-500" />
              </div>
              <span className="truncate max-w-[80px] italic text-orange-600">Pending</span>
            </div>
          ) : (
            <span className="italic">Unassigned</span>
          )}
        </div>

        {task.creatorId !== currentUserId && (
          <div className="flex items-center gap-1 text-primary">
            <span>from {task.creator.name?.split(" ")[0]}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

// Icon component needed for the menu
function CheckSquare(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
