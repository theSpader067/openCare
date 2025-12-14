"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/LanguageContext"

function ResetPasswordContentInner() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    // Validate token
    async function validateToken() {
      if (!token) {
        setError(t("auth.resetPassword.invalidToken"))
        setTokenValid(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        if (!response.ok) {
          const data = await response.json()
          setError(data.error || t("auth.resetPassword.invalidToken"))
          setTokenValid(false)
        } else {
          setTokenValid(true)
        }
      } catch (err) {
        console.error("Token validation error:", err)
        setError(t("auth.resetPassword.invalidToken"))
        setTokenValid(false)
      }
    }

    validateToken()
  }, [token, t])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    // Validation
    if (password.length < 8) {
      setError(t("auth.resetPassword.passwordMinLength"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("auth.resetPassword.passwordMismatch"))
      return
    }

    if (!token) {
      setError(t("auth.resetPassword.invalidToken"))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t("auth.resetPassword.error"))
      } else {
        setSuccess(true)
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login?passwordReset=success")
        }, 3000)
      }
    } catch (err) {
      console.error("Error:", err)
      setError(t("auth.resetPassword.error"))
    } finally {
      setIsLoading(false)
    }
  }

  if (tokenValid === null) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#6d28d9]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />
          <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#6d28d9]">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />
          <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl" />
          <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <div className="rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_25px_80px_-25px_rgba(79,70,229,0.65)] backdrop-blur-xl">
              <div className="rounded-[30px] bg-white p-8 shadow-2xl shadow-indigo-900/25">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">
                  {t("auth.resetPassword.tokenExpired")}
                </h1>

                <p className="text-sm text-slate-600 text-center mb-8">
                  {error}
                </p>

                <Button
                  onClick={() => router.push("/forgot-password")}
                  variant="primary"
                  className="w-full"
                >
                  {t("auth.resetPassword.requestNewLink")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          <div className="rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_25px_80px_-25px_rgba(79,70,229,0.65)] backdrop-blur-xl">
            <div className="rounded-[30px] bg-white p-8 shadow-2xl shadow-indigo-900/25">
              {!success ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50">
                      <Lock className="h-8 w-8 text-indigo-600" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">
                    {t("auth.resetPassword.title")}
                  </h1>

                  <p className="text-sm text-slate-600 text-center mb-8">
                    {t("auth.resetPassword.subtitle")}
                  </p>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="text-sm font-semibold text-slate-700"
                      >
                        {t("auth.login.passwordLabel")}
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t("auth.login.passwordPlaceholder")}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-semibold text-slate-700"
                      >
                        {t("auth.resetPassword.confirmPasswordLabel")}
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder={t("auth.login.passwordPlaceholder")}
                          className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-xs text-blue-900">
                        {t("auth.resetPassword.passwordRequirement")}
                      </p>
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
                      <Lock className="mr-2 h-4 w-4" />
                      {isLoading
                        ? t("auth.resetPassword.resetting")
                        : t("auth.resetPassword.resetButton")}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>

                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {t("auth.resetPassword.success")}
                  </h1>

                  <p className="text-sm text-slate-600 mb-8">
                    {t("auth.resetPassword.successMessage")}
                  </p>

                  <p className="text-xs text-slate-500">
                    {t("auth.resetPassword.redirecting")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordContent() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#312e81] to-[#6d28d9]">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </div>
      }
    >
      <ResetPasswordContentInner />
    </Suspense>
  )
}
