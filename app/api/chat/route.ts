import { NextRequest, NextResponse } from "next/server";
import { buildChatResponse } from "@/lib/chatbot";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const message: string = typeof body?.message === "string" ? body.message : "";

  if (!message.trim()) {
    return NextResponse.json(
      { error: "Message is required." },
      { status: 400 },
    );
  }

  const { reply, referencedReports } = buildChatResponse(message);

  return NextResponse.json(
    {
      reply,
      referencedReports,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
