import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 5,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("[USERS_SEARCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
