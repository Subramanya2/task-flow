import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Priority, TaskStatus } from "@prisma/client";
import { pusherServer } from "@/lib/pusher-server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("[TASKS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, priority, dueDate, assigneeEmail } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    let assigneeId = null;
    let finalAssigneeEmail = assigneeEmail || null;

    // Handle assignee by email
    if (finalAssigneeEmail) {
      const user = await prisma.user.findUnique({
        where: { email: finalAssigneeEmail },
      });
      if (user) {
        assigneeId = user.id;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || Priority.MEDIUM,
        dueDate: dueDate ? new Date(dueDate) : null,
        creatorId: session.user.id,
        assigneeEmail: finalAssigneeEmail,
        assigneeId,
        status: TaskStatus.TODO,
      },
      include: {
        creator: { select: { id: true, name: true, image: true, email: true } },
        assignee: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`user-${session.user.id}`, "task:created", task);
    
    // If assigned to someone else, trigger event for them too
    if (assigneeId && assigneeId !== session.user.id) {
      await pusherServer.trigger(`user-${assigneeId}`, "task:assigned", task);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASKS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
