import { NextResponse } from "next/server";
import { z } from "zod";
import { serviceSupabase } from "@/lib/supabase/admin";
export const runtime = "nodejs";
const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().max(200),
  message: z.string().trim().min(10).max(2000),
  website: z.string().optional().default(""),
});
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    return NextResponse.json(
      { error: "Contact form is in demo mode. Please configure Supabase." },
      { status: 503 },
    );
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success || parsed.data.website)
      return NextResponse.json(
        { error: "Please check your input." },
        { status: 400 },
      );
    const { name, email, message } = parsed.data;
    const { error } = await serviceSupabase()
      .from("contact_messages")
      .insert({ name, email, message });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Unable to send your message." },
      { status: 503 },
    );
  }
}
