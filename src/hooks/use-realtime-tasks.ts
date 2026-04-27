"use client";

import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher-client";
import { TaskWithRelations } from "@/types";
import { toast } from "sonner";

interface UseRealtimeTasksProps {
  userId: string;
  onTaskCreated: (task: TaskWithRelations) => void;
  onTaskUpdated: (task: TaskWithRelations) => void;
  onTaskDeleted: (taskId: string) => void;
  onTaskAssignedToMe: (task: TaskWithRelations) => void;
}

export function useRealtimeTasks({
  userId,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
  onTaskAssignedToMe,
}: UseRealtimeTasksProps) {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to a channel unique to this user
    // We listen on a user-specific channel rather than a global one to protect data
    const channel = pusherClient.subscribe(`user-${userId}`);

    channel.bind("task:created", (data: TaskWithRelations) => {
      onTaskCreated(data);
    });

    channel.bind("task:updated", (data: TaskWithRelations) => {
      onTaskUpdated(data);
    });

    channel.bind("task:deleted", (data: { id: string }) => {
      onTaskDeleted(data.id);
    });

    channel.bind("task:assigned", (data: TaskWithRelations) => {
      toast.info("New task assigned", {
        description: `${data.creator.name} assigned "${data.title}" to you.`,
        duration: 5000,
      });
      onTaskAssignedToMe(data);
    });

    return () => {
      pusherClient.unsubscribe(`user-${userId}`);
    };
  }, [userId, onTaskCreated, onTaskUpdated, onTaskDeleted, onTaskAssignedToMe]);
}
