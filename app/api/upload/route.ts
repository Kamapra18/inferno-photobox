import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert base64 → buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    const filename = `photobox-${Date.now()}.png`;

    // 🔥 Upload ke Vercel Blob
    const blob = await put(filename, buffer, {
      access: "public",
      contentType: "image/png",
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
