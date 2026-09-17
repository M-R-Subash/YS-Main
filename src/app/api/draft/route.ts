import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") || "/";

  const expectedSecret = process.env.PREVIEW_SECRET;
  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ message: "Invalid preview secret" }, { status: 401 });
  }

  const draft = await draftMode();
  draft.enable();

  redirect(slug);
}
