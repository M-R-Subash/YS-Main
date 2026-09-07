import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import crypto from "crypto";

function isSecretValid(providedSecret: string | null | undefined): boolean {
  const expectedSecret = process.env.REVALIDATION_SECRET || process.env.PREVIEW_SECRET;
  if (!providedSecret || !expectedSecret) return false;

  const bufProvided = Buffer.from(providedSecret);
  const bufExpected = Buffer.from(expectedSecret);

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { secret, path, type } = body;

    if (!isSecretValid(secret)) {
      return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
    }

    if (!path) {
      return NextResponse.json({ message: "Path is required" }, { status: 400 });
    }

    if (type === "layout") {
      revalidatePath(path, "layout");
    } else {
      revalidatePath(path, "page");
    }

    return NextResponse.json({
      revalidated: true,
      path,
      type: type || "page",
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Revalidation error", error: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const path = searchParams.get("path");
  const type = (searchParams.get("type") as "page" | "layout") || "page";

  if (!isSecretValid(secret)) {
    return NextResponse.json({ message: "Invalid secret token" }, { status: 401 });
  }

  if (!path) {
    return NextResponse.json({ message: "Path is required" }, { status: 400 });
  }

  if (type === "layout") {
    revalidatePath(path, "layout");
  } else {
    revalidatePath(path, "page");
  }

  return NextResponse.json({
    revalidated: true,
    path,
    type,
    timestamp: Date.now(),
  });
}
