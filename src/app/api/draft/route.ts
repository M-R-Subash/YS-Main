import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { isPreviewAuthorized } from "@/lib/preview";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "/";

  // Validate slug is strictly an internal relative path (prevents open redirect SEC-005)
  if (
    !slug.startsWith("/") ||
    slug.startsWith("//") ||
    slug.includes("\\") ||
    slug.includes(":") ||
    slug.startsWith("/\\")
  ) {
    return NextResponse.json(
      { message: "Invalid redirect destination. Slug must be a relative internal path." },
      { status: 400 }
    );
  }

  const isAuthorized = await isPreviewAuthorized(
    Promise.resolve(Object.fromEntries(searchParams.entries())),
    slug
  );

  if (!isAuthorized) {
    return NextResponse.json({ message: "Invalid preview secret or expired token" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(slug);
}
