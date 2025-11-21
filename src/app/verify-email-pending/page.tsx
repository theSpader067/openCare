"use client";

import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function VerifyEmailPendingPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // Get email from localStorage if it was stored during signup
    const storedEmail = localStorage.getItem("signupEmail");
    if (storedEmail) {
      setEmail(storedEmail);
      localStorage.removeItem("signupEmail");
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#312e81]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-12 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute inset-x-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_30px_90px_-35px_rgba(59,130,246,0.55)] backdrop-blur-xl">
          <div className="rounded-[30px] bg-white p-8 shadow-2xl shadow-indigo-900/20">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] shadow-lg shadow-indigo-900/50">
                <Mail className="h-8 w-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-slate-900">
                {t('auth.verifyEmailPending.title')}
              </h1>

              <p className="mt-3 text-sm text-slate-600">
                {email ? (
                  <>
                    {t('auth.verifyEmailPending.sentTo')}{" "}
                    <span className="font-semibold text-slate-900">{email}</span>
                  </>
                ) : (
                  t('auth.verifyEmailPending.sentGeneric')
                )}
              </p>

              <div className="mt-8 space-y-4 rounded-xl bg-blue-50 p-4 text-left">
                <p className="text-sm font-semibold text-blue-900">
                  {t('auth.verifyEmailPending.nextSteps')}
                </p>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">
                      1
                    </span>
                    <span>{t('auth.verifyEmailPending.step1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">
                      2
                    </span>
                    <span>{t('auth.verifyEmailPending.step2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold">
                      3
                    </span>
                    <span>{t('auth.verifyEmailPending.step3')}</span>
                  </li>
                </ol>
              </div>

              <p className="mt-8 text-sm text-slate-600">
                {t('auth.verifyEmailPending.alreadyVerified')}{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1"
                >
                  {t('auth.verifyEmailPending.login')}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </p>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  {t('auth.verifyEmailPending.needHelp')}{" "}
                  <a
                    href={`mailto:${t('auth.verifyEmailPending.supportEmail')}`}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    {t('auth.verifyEmailPending.supportEmail')}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
