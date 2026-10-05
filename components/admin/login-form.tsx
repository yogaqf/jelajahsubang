"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "Login gagal.");

      const requestedPath = searchParams.get("next");
      const destination = requestedPath?.startsWith("/admin") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/admin";
      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login gagal.");
    } finally {
      setLoading(false);
    }
  }

  return <form onSubmit={submit} className="mt-8 space-y-4">
    <label className="block"><span className="text-xs font-bold text-zinc-700">Email admin</span><span className="relative mt-1.5 block"><Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /></span></label>
    <label className="block"><span className="text-xs font-bold text-zinc-700">Password</span><span className="relative mt-1.5 block"><LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 py-3 pl-10 pr-11 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100" /><button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-200">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
    {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-semibold leading-5 text-red-700">{error}</p>}
    <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}{loading ? "Memeriksa..." : "Masuk ke Dashboard"}</button>
  </form>;
}
