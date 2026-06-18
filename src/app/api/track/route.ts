import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type TrackBody = {
  visitorId?: string;
  personLabel?: string;
  stage?: "apology" | "loveQuestion" | "final";
  action?: "yes" | "no" | "reset";
  noCount?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TrackBody;

    const visitorId = body.visitorId?.trim();
    const personLabel = body.personLabel?.trim();
    const stage = body.stage;
    const action = body.action;
    const noCount = Number(body.noCount ?? 0);

    if (!visitorId || !personLabel || !stage || !action) {
      return NextResponse.json(
        {
          success: false,
          message: "Data tracking tidak lengkap.",
        },
        { status: 400 }
      );
    }

    if (!["apology", "loveQuestion", "final"].includes(stage)) {
      return NextResponse.json(
        {
          success: false,
          message: "Stage tidak valid.",
        },
        { status: 400 }
      );
    }

    if (!["yes", "no", "reset"].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          message: "Action tidak valid.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("love_click_events").insert({
      visitor_id: visitorId,
      person_label: personLabel,
      stage,
      action,
      no_count: noCount,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat menyimpan tracking.",
      },
      { status: 500 }
    );
  }
}