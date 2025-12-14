"use client"

import Link from "next/link"
import { useState } from "react"
import { Mail, ChevronLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

export default function ForgotPasswordContent() {
  const { t } = useLanguage()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t("auth.forgotPassword.error"))
      } else {
        setSubmitted(true)
      }
    } catch (err) {
      console.error("Error:", err)
      setError(t("auth.forgotPassword.error"))
    } finally {
      setIsLoading(false)
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
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">{t("auth.forgotPassword.backToLogin")}</span>
            </Link>
          </div>

          {/* Card */}
          <div className="rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_25px_80px_-25px_rgba(79,70,229,0.65)] backdrop-blur-xl">
            <div className="rounded-[30px] bg-white p-8 shadow-2xl shadow-indigo-900/25">
              {!submitted ? (
                <>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {t("auth.forgotPassword.title")}
                  </h1>
                  <p className="text-sm text-slate-600 mb-8">
                    {t("auth.forgotPassword.subtitle")}
                  </p>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-slate-700"
                      >
                        {t("auth.login.emailLabel")}
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("auth.login.emailPlaceholder")}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                    </div>

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
                      <Mail className="mr-2 h-4 w-4" />
                      {isLoading
                        ? t("auth.forgotPassword.sending")
                        : t("auth.forgotPassword.sendLink")}
                    </Button>
                  </form>

                  <p className="mt-6 text-center text-xs text-slate-500">
                    {t("auth.forgotPassword.noAccount")}{" "}
                    <Link
                      href="/signup"
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      {t("auth.login.createAccount")}
                    </Link>
                  </p>
                </>
              ) : (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {t("auth.forgotPassword.checkEmail")}
                  </h1>

                  <p className="text-sm text-slate-600 mb-6">
                    {t("auth.forgotPassword.emailSent")} <span className="font-semibold text-slate-800">{email}</span>
                  </p>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4 mb-8 text-left">
                    <p className="text-sm text-indigo-900 leading-relaxed">
                      {t("auth.forgotPassword.instructions")}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 mb-6">
                    {t("auth.forgotPassword.noEmail")}
                  </p>

                  <Button
                    onClick={() => {
                      setSubmitted(false)
                      setEmail("")
                      setError(null)
                    }}
                    variant="outline"
                    className="w-full mb-4"
                  >
                    {t("auth.forgotPassword.tryAnother")}
                  </Button>

                  <Link
                    href="/login"
                    className="inline-block text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    {t("auth.forgotPassword.backToLogin")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
