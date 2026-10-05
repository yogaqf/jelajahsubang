const encoder = new TextEncoder();

export const ADMIN_SESSION_COOKIE = "jelajah_admin_session";
export const ADMIN_SESSION_DURATION_SECONDS = 8 * 60 * 60;

type AdminSession = {
  email: string;
  role: "admin";
  exp: number;
};

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

async function signingKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim()
    && process.env.ADMIN_PASSWORD
    && process.env.ADMIN_PASSWORD.length >= 10
    && sessionSecret(),
  );
}

export async function createAdminSessionToken(email: string) {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET belum dikonfigurasi dengan minimal 32 karakter.");

  const payload: AdminSession = {
    email,
    role: "admin",
    exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_DURATION_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = await crypto.subtle.sign("HMAC", await signingKey(secret), encoder.encode(encodedPayload));
  return `${encodedPayload}.${Buffer.from(signature).toString("base64url")}`;
}

export async function verifyAdminSessionToken(token?: string | null): Promise<AdminSession | null> {
  const secret = sessionSecret();
  if (!secret || !token) return null;

  try {
    const [encodedPayload, encodedSignature, extra] = token.split(".");
    if (!encodedPayload || !encodedSignature || extra) return null;
    const valid = await crypto.subtle.verify(
      "HMAC",
      await signingKey(secret),
      Buffer.from(encodedSignature, "base64url"),
      encoder.encode(encodedPayload),
    );
    if (!valid) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as AdminSession;
    if (payload.role !== "admin" || !payload.email || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
