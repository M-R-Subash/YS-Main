import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    // 1. IP-based Rate Limiting (max 5 comments per 2 minutes per IP)
    const clientIp = getClientIp(request.headers);
    const limitResult = rateLimit("comments-submit", clientIp, {
      windowMs: 2 * 60 * 1000,
      max: 5,
    });

    if (!limitResult.success) {
      return NextResponse.json(
        { error: "Too many comments submitted. Please wait a couple minutes before trying again." },
        { 
          status: 429,
          headers: { "Retry-After": "120" },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { blogId, name, email, content, website, honeypot } = body;

    // 2. Anti-Bot Honeypot Defense
    // If hidden honeypot fields are filled, silently reject or return generic success to avoid tipping off bots
    if (website || honeypot) {
      return NextResponse.json(
        { success: true, message: "Comment submitted successfully" },
        { status: 200 }
      );
    }

    // 3. Required Fields & Type Checks
    if (!blogId || !name || !email || !content) {
      return NextResponse.json(
        { error: "Missing required fields (blogId, name, email, content)" },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanContent = String(content).trim();
    const cleanBlogId = String(blogId).trim();

    // 4. Input Length & Format Validation
    if (cleanName.length < 1 || cleanName.length > 80) {
      return NextResponse.json(
        { error: "Name must be between 1 and 80 characters" },
        { status: 400 }
      );
    }

    // Prevent visitors from spoofing the Admin label in their name
    if (cleanName.toLowerCase().includes("(admin)") || cleanName.toLowerCase().includes("[admin]")) {
      return NextResponse.json(
        { error: "Name cannot contain reserved administrative titles" },
        { status: 400 }
      );
    }

    if (cleanEmail.length > 150 || !EMAIL_REGEX.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    if (cleanContent.length < 2 || cleanContent.length > 3000) {
      return NextResponse.json(
        { error: "Comment content must be between 2 and 3,000 characters" },
        { status: 400 }
      );
    }

    // 5. Verify Target Blog Exists and is Active
    const blog = await prisma.blog.findFirst({
      where: {
        id: cleanBlogId,
        status: "published",
        isTrashed: false,
      },
      select: { id: true, allowComments: true },
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog post not found or comments are not currently accepted" },
        { status: 404 }
      );
    }

    if (!blog.allowComments) {
      return NextResponse.json(
        { error: "Comments are disabled for this article" },
        { status: 403 }
      );
    }

    // 6. Persist Comment with Strict Moderation & Explicit non-admin role
    await prisma.comment.create({
      data: {
        blogId: cleanBlogId,
        name: cleanName,
        email: cleanEmail,
        content: cleanContent,
        isApproved: false,
        isTrashed: false,
        isAdmin: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comment submitted successfully. It will appear once approved by a moderator.",
    });
  } catch (error: any) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { error: "Failed to submit comment. Please try again later." },
      { status: 500 }
    );
  }
}
