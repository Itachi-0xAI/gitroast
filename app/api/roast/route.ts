import { NextRequest, NextResponse } from "next/server";
import { buildRoastPayload } from "@/lib/github";
import { generateRoast } from "@/lib/roast";

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const clean = username.trim().replace(/^@/, "");
    const payload = await buildRoastPayload(clean);
    const roast = await generateRoast(payload);

    return NextResponse.json({ roast, profile: payload.profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
