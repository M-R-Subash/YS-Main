import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { blogId, name, email, content } = await request.json();

    if (!blogId || !name || !email || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await prisma.comment.create({
      data: {
        blogId,
        name,
        email,
        content,
        isApproved: false,
        isTrashed: false,
      },
    });

    return NextResponse.json({ success: true, message: "Comment submitted successfully" });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit comment" },
      { status: 500 }
    );
  }
}
