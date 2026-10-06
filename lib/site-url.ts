const configuredUrl = process.env.SITE_URL
  || process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.NODE_ENV === "production"
    ? "https://www.jelajahsubang.id"
    : "http://localhost:3000");

export const siteUrl = new URL(configuredUrl).origin;

export function absoluteUrl(pathname: string) {
  return new URL(pathname, `${siteUrl}/`).toString();
}
