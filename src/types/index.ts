import { Prisma } from "@prisma/client";

// Get the type of a task with its creator and assignee included
export type TaskWithRelations = Prisma.TaskGetPayload<{
  include: {
    creator: { select: { id: true; name: true; image: true; email: true } };
    assignee: { select: { id: true; name: true; image: true; email: true } };
  };
}>;
