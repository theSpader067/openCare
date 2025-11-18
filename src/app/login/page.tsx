"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ShieldCheck, LogIn, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import { getLoginRedirectUrl } from "@/lib/utils";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [callbackUrl, setCallbackUrl] = useState<string>("/dashboard");

  useEffect(() => {
    // Check for verification success
    if (searchParams.get('verified') === '1') {
      setSuccess('Email vérifié avec succès! connectez-vous pour continuer.')
    }
    // Check for unverified error
    if (searchParams.get('unverified') === '1') {
      setError('Please verify your email before logging in.')
    }
    // Check for other errors
    const errorParam = searchParams.get('error')
    if (errorParam === 'invalid_token') {
      setError('Invalid verification link. Please request a new one.')
    } else if (errorParam === 'expired') {
      setError('Verification link has expired. Please request a new one.')
    }
  }, [searchParams])

  useEffect(() => {
    // Detect device type and set appropriate callback URL
    const redirectUrl = getLoginRedirectUrl();
    setCallbackUrl(redirectUrl);
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        callbackUrl: callbackUrl,
      })

      if (res?.error) {
        setIsLoading(false)
        setError(res.error || 'An unexpected error occurred')
      } else if (res?.ok) {
        // NextAuth callback will handle the redirect based on user state
        return
      }
    } catch (err) {
      console.error('Login error:', err)
      setIsLoading(false)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#6d28d9]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mb-12 flex items-center gap-3 text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#4f46e5] text-2xl font-bold text-white shadow-lg shadow-indigo-300/60">
            OC
          </span>
          <div>
            <h1 className="text-4xl font-bold">OpenCare</h1>
            <p className="text-xs uppercase tracking-widest text-white/60">
              Plateforme des praticiens
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_25px_80px_-25px_rgba(79,70,229,0.65)] backdrop-blur-xl">
          <div className="grid gap-6 rounded-[30px] bg-white/10 p-8 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-white/10 p-6 text-white shadow-inner shadow-indigo-900/40 hidden md:block">
              <h2 className="text-2xl font-semibold">
                Bienvenue de retour 👋
              </h2>
              <p className="mt-2 text-sm text-white/70">
                Connectez-vous pour retrouver votre agenda, vos dossiers patients
                et l&apos;activité du bloc opératoire consolidée.
              </p>

              <ul className="mt-6 space-y-4 text-sm text-white/80">
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  Accès sécurisé conforme aux standards hospitaliers.
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                    <Mail className="h-4 w-4" />
                  </span>
                  Notifications instantanées sur vos suivis critiques.
                </li>
              </ul>

              <div className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-4 text-xs text-white/70">
                <p>
                  Besoin d&apos;un compte ?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-white hover:underline"
                  >
                    Demandez un accès sécurisé
                  </Link>
                  .
                </p>
                <p className="mt-2">
                  Support disponible 24/7 pour les praticiens et équipes de bloc.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-8 shadow-2xl shadow-indigo-900/25">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Identifiant médical ou e-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="prenom.nom@chu.fr"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Se souvenir de moi
                  </label>
                  <Link href="#" className="font-semibold text-indigo-600 hover:underline">
                    Mot de passe oublié ?
                  </Link>
                </div>

                {success && (
                  <div className="rounded-xl bg-green-50 p-4 border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-800">{success}</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isLoading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {isLoading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <span className="block border-t border-slate-200" />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs uppercase tracking-wide text-slate-400">
                    ou
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
                  onClick={() => signIn("google", { callbackUrl: callbackUrl })}
                >
                  <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white">
                    <span className="text-lg font-bold text-indigo-600">G</span>
                  </span>
                  Continuer avec Google
                </Button>
              </div>

              <p className="mt-6 text-center text-xs text-slate-500">
                Pas encore inscrit ?{" "}
                <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold">Loading...</h1></div></div>}>
      <LoginPageContent />
    </Suspense>
  );
}
