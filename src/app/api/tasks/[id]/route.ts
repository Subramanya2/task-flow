import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher-server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = await params;
    const task = await prisma.task.findUnique({
      where: { id: p.id },
      include: {
        creator: { select: { id: true, name: true, image: true, email: true } },
        assignee: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.creatorId !== session.user.id && task.assigneeId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = await params;
    const existingTask = await prisma.task.findUnique({
      where: { id: p.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (existingTask.creatorId !== session.user.id && existingTask.assigneeId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, priority, dueDate } = body;

    const task = await prisma.task.update({
      where: { id: p.id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
      },
      include: {
        creator: { select: { id: true, name: true, image: true, email: true } },
        assignee: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`user-${task.creatorId}`, "task:updated", task);
    if (task.assigneeId && task.assigneeId !== task.creatorId) {
      await pusherServer.trigger(`user-${task.assigneeId}`, "task:updated", task);
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("[TASK_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const p = await params;
    const existingTask = await prisma.task.findUnique({
      where: { id: p.id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Only creator can delete
    if (existingTask.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only creator can delete" },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: p.id },
    });

    // Trigger Pusher event
    await pusherServer.trigger(`user-${existingTask.creatorId}`, "task:deleted", { id: p.id });
    if (existingTask.assigneeId && existingTask.assigneeId !== existingTask.creatorId) {
      await pusherServer.trigger(`user-${existingTask.assigneeId}`, "task:deleted", { id: p.id });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[TASK_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
