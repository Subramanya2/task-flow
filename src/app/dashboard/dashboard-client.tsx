"use client";

import { useState, useEffect } from "react";
import { TaskWithRelations } from "@/types";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle2, Clock, ListTodo, AlertCircle } from "lucide-react";
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog";
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog";
import { AssignTaskDialog } from "@/components/tasks/assign-task-dialog";
import { TaskStatus, Priority } from "@prisma/client";
import { toast } from "sonner";

interface DashboardClientProps {
  initialTasks: TaskWithRelations[];
  currentUserId: string;
}

export function DashboardClient({ initialTasks, currentUserId }: DashboardClientProps) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>(initialTasks);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "MY_TASKS" | "ASSIGNED_TO_ME">("ALL");
  
  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  
  const [editOpen, setEditOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskWithRelations | null>(null);
  
  const [assignOpen, setAssignOpen] = useState(false);
  const [taskToAssign, setTaskToAssign] = useState<TaskWithRelations | null>(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run a claim tasks check on mount
  useEffect(() => {
    const claimPendingTasks = async () => {
      try {
        const res = await fetch("/api/tasks/claim", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          if (data.count > 0) {
            toast.success(data.message);
            fetchTasks(); // Refresh to show claimed tasks
          }
        }
      } catch (error) {
        console.error("Failed to claim tasks", error);
      }
    };
    
    claimPendingTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks(current => 
      current.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }
      
      // We don't need to re-fetch if optimistic update succeeded
    } catch (error) {
      toast.error("Failed to update task status");
      fetchTasks(); // Revert on failure
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    // Optimistic update
    setTasks(current => current.filter(t => t.id !== taskId));

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete task");
      }
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
      fetchTasks(); // Revert on failure
    }
  };

  const openEditDialog = (task: TaskWithRelations) => {
    setTaskToEdit(task);
    setEditOpen(true);
  };

  const openAssignDialog = (task: TaskWithRelations) => {
    setTaskToAssign(task);
    setAssignOpen(true);
  };

  // Stats calculation
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const inProgressTasks = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
  
  // Overdue: due date is in the past, and not completed
  const overdueTasks = tasks.filter(t => {
    if (t.status === TaskStatus.COMPLETED || !t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    dueDate.setHours(23, 59, 59, 999); // End of due date
    return dueDate < new Date();
  }).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Manage your tasks and collaborate with your team.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{totalTasks}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{completedTasks}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">{inProgressTasks}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Overdue</p>
            <p className="text-2xl font-bold">{overdueTasks}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 mb-4">
            <TabsTrigger value="ALL">All Tasks</TabsTrigger>
            <TabsTrigger value="MY_TASKS">Created by Me</TabsTrigger>
            <TabsTrigger value="ASSIGNED_TO_ME">Assigned to Me</TabsTrigger>
          </TabsList>
        </Tabs>

        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          currentUserId={currentUserId}
          filter={activeTab}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onEdit={openEditDialog}
          onAssign={openAssignDialog}
        />
      </div>

      <CreateTaskDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={fetchTasks} 
      />
      
      <EditTaskDialog
        task={taskToEdit}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={fetchTasks}
      />
      
      <AssignTaskDialog
        task={taskToAssign}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onSuccess={fetchTasks}
      />
    </div>
  );
}
