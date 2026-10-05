import { createHash } from "node:crypto";

const allowedFolders = new Set([
  "jelajah-subang/hero",
  "jelajah-subang/blog",
  "jelajah-subang/destinasi",
  "jelajah-subang/shop",
  "jelajah-subang/sharelok/menu",
  "jelajah-subang/sharelok/merchant",
  "jelajah-subang/sharelok/kategori",
]);

export async function POST(request: Request) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return Response.json(
      { error: "Cloudinary belum dikonfigurasi. Isi CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null) as { folder?: unknown } | null;
  const folder = typeof body?.folder === "string" ? body.folder : "";

  if (!allowedFolders.has(folder)) {
    return Response.json({ error: "Folder unggahan tidak valid." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash("sha1")
    .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  return Response.json({ cloudName, apiKey, folder, timestamp, signature });
}
