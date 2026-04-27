import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find any tasks assigned to this email where assigneeId is null
    const pendingTasks = await prisma.task.findMany({
      where: {
        assigneeEmail: session.user.email,
        assigneeId: null,
      },
    });

    if (pendingTasks.length === 0) {
      return NextResponse.json({ message: "No pending tasks to claim", count: 0 });
    }

    // Update all pending tasks to link to this user
    await prisma.task.updateMany({
      where: {
        assigneeEmail: session.user.email,
        assigneeId: null,
      },
      data: {
        assigneeId: session.user.id,
      },
    });

    return NextResponse.json({
      message: `Successfully claimed ${pendingTasks.length} tasks`,
      count: pendingTasks.length,
    });
  } catch (error) {
    console.error("[TASKS_CLAIM]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
