"use client"

import { useSession } from "next-auth/react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1f2937] to-[#312e81]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="text-center text-white mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#4f46e5] text-xl font-bold text-white shadow-lg shadow-indigo-300/60">
              OC
            </span>
            <h1 className="text-3xl font-bold">OpenCare</h1>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_25px_80px_-25px_rgba(79,70,229,0.65)] backdrop-blur-xl">
          <div className="rounded-[30px] bg-white p-8 shadow-2xl shadow-indigo-900/25">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 rounded-full bg-blue-100">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-900">
                {t('auth.verifyEmail.title')}
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {t('auth.verifyEmail.sentTo')}
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {session?.user?.email}
              </p>
              <p className="mt-4 text-sm text-slate-600">
                {t('auth.verifyEmail.instruction')}
              </p>
            </div>

            <div className="mt-8 rounded-xl bg-blue-50 p-4 border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>{t('auth.verifyEmail.tipTitle')}</strong> {t('auth.verifyEmail.tipMessage')}
              </p>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              {t('auth.verifyEmail.autoRedirect')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
  