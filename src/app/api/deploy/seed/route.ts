import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runSeed } from "@/lib/seed";

/**
 * One-time, token-gated seed endpoint for hosts without easy terminal/SSH access
 * (e.g. Hostinger shared Node.js hosting). Disabled unless DEPLOY_SEED_TOKEN is set
 * in the environment — set it, visit /api/deploy/seed?token=YOUR_TOKEN once, then
 * remove the env var so the endpoint stops working.
 */
export async function GET(request: NextRequest) {
  const configuredToken = process.env.DEPLOY_SEED_TOKEN;
  if (!configuredToken) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const providedToken = request.nextUrl.searchParams.get("token");
  if (!providedToken || providedToken !== configuredToken) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const log = await runSeed(prisma);
    return new NextResponse(
      `<!doctype html><html><body style="font-family: monospace; white-space: pre-wrap; padding: 2rem;">Seed complete.\n\n${log.join("\n")}\n\nYou can now remove the DEPLOY_SEED_TOKEN environment variable.</body></html>`,
      { headers: { "content-type": "text/html" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Seed failed." },
      { status: 500 }
    );
  }
}
