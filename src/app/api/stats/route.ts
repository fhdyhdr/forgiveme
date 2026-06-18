import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type ClickEvent = {
  id: string;
  visitor_id: string;
  person_label: string;
  stage: "apology" | "loveQuestion" | "final";
  action: "yes" | "no" | "reset";
  no_count: number;
  created_at: string;
};

type SummaryItem = {
  personLabel: string;
  visitorId: string;
  apologyYes: number;
  apologyNo: number;
  loveQuestionYes: number;
  loveQuestionNo: number;
  finalReset: number;
  totalClicks: number;
  lastClickAt: string | null;
};

export async function GET(request: NextRequest) {
  const password = request.nextUrl.searchParams.get("password");

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      {
        success: false,
        message: "ADMIN_PASSWORD belum diatur.",
      },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      {
        success: false,
        message: "Password salah.",
      },
      { status: 401 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("love_click_events")
    .select("id, visitor_id, person_label, stage, action, no_count, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }

  const events = (data ?? []) as ClickEvent[];

  const summaryMap = new Map<string, SummaryItem>();

  for (const event of events) {
    const key = `${event.person_label}-${event.visitor_id}`;

    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        personLabel: event.person_label,
        visitorId: event.visitor_id,
        apologyYes: 0,
        apologyNo: 0,
        loveQuestionYes: 0,
        loveQuestionNo: 0,
        finalReset: 0,
        totalClicks: 0,
        lastClickAt: event.created_at,
      });
    }

    const item = summaryMap.get(key);

    if (!item) continue;

    if (event.stage === "apology" && event.action === "yes") {
      item.apologyYes += 1;
    }

    if (event.stage === "apology" && event.action === "no") {
      item.apologyNo += 1;
    }

    if (event.stage === "loveQuestion" && event.action === "yes") {
      item.loveQuestionYes += 1;
    }

    if (event.stage === "loveQuestion" && event.action === "no") {
      item.loveQuestionNo += 1;
    }

    if (event.stage === "final" && event.action === "reset") {
      item.finalReset += 1;
    }

    item.totalClicks += 1;
  }

  return NextResponse.json({
    success: true,
    summary: Array.from(summaryMap.values()),
    events,
  });
}