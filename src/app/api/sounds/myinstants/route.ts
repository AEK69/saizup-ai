import { NextRequest, NextResponse } from "next/server";

type MyInstantsResult = {
  name?: string;
  slug?: string;
  sound?: string;
  description?: string;
  tags?: string[];
};

export async function GET(request: NextRequest) {
  const query = (request.nextUrl.searchParams.get("q") || "sound effects").trim().slice(0, 80);
  const requestedPage = Number.parseInt(request.nextUrl.searchParams.get("page") || "5", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, Math.min(100, requestedPage)) : 5;

  try {
    const apiUrl = new URL("https://www.myinstants.com/api/v1/instants/");
    apiUrl.searchParams.set("name", query || "sound effects");
    apiUrl.searchParams.set("page", String(page));

    const response = await fetch(apiUrl, {
      headers: { Accept: "application/json", "User-Agent": "SAIZUP-AI-Studio/1.0" },
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return NextResponse.json(
        { error: `MyInstants responded with ${response.status}. Try again in a moment.` },
        { status: response.status === 429 ? 429 : 502, headers: { "Cache-Control": "no-store" } },
      );
    }

    const data = await response.json();
    const results = (Array.isArray(data.results) ? data.results : [])
      .filter((item: MyInstantsResult) => typeof item.slug === "string" && typeof item.sound === "string")
      .map((item: MyInstantsResult) => ({
        name: String(item.name || item.slug),
        slug: item.slug,
        sound: new URL(item.sound!, "https://www.myinstants.com").toString(),
        description: String(item.description || ""),
        tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      }));

    return NextResponse.json(
      { count: Number(data.count) || results.length, next: data.next || null, previous: data.previous || null, results },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("MyInstants catalog request failed:", error);
    return NextResponse.json(
      { error: "Could not load sounds from MyInstants right now." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
