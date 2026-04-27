import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/");
  }

  // Fetch initial tasks
  const tasks = await prisma.task.findMany({
    where: {
      OR: [
        { creatorId: session.user.id },
        { assigneeId: session.user.id },
      ],
    },
    include: {
      creator: { select: { id: true, name: true, image: true, email: true } },
      assignee: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <DashboardClient 
      initialTasks={tasks} 
      currentUserId={session.user.id} 
    />
  );
}
