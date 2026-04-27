import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    if (existingTask.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only creator can assign" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let assigneeId = null;
    let isNewUser = true;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      assigneeId = user.id;
      isNewUser = false;
    }

    const task = await prisma.task.update({
      where: { id: p.id },
      data: {
        assigneeEmail: email,
        assigneeId,
      },
      include: {
        creator: { select: { id: true, name: true, image: true, email: true } },
        assignee: { select: { id: true, name: true, image: true, email: true } },
      },
    });

    // TODO: Trigger Pusher event here

    return NextResponse.json({
      task,
      isNewUser,
      message: isNewUser
        ? "User not found. Task will be assigned when they sign up."
        : "Task successfully assigned.",
    });
  } catch (error) {
    console.error("[TASK_ASSIGN]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
