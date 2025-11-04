"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    speciality: "",
    establishment: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/login");
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#111827] via-[#1f2937] to-[#312e81]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-20 right-12 h-72 w-72 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="absolute inset-x-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mb-12 text-center text-white">
          <p className="text-xs uppercase tracking-[0.45em] text-white/70">
            OpenCare
          </p>
          <h1 className="mt-3 text-3xl font-semibold">
            Rejoignez la communauté des praticiens connectés
          </h1>
          <p className="mt-2 text-sm text-white/70">
            Créez votre accès sécurisé pour centraliser votre activité clinique.
          </p>
        </div>

        <div className="grid w-full max-w-5xl gap-6 rounded-[36px] border border-white/10 bg-white/10 p-1 shadow-[0_30px_90px_-35px_rgba(59,130,246,0.55)] backdrop-blur-xl md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-white/10 bg-white/10 p-8 text-white shadow-inner shadow-indigo-900/30">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#8b5cf6] text-xl font-semibold text-white shadow-lg shadow-indigo-900/50">
                ✨
              </span>
              <div>
                <h2 className="text-xl font-semibold">Pourquoi OpenCare ?</h2>
                <p className="text-xs text-white/70">
                  Simplifiez votre quotidien hospitalier et améliorez la coordination patient.
                </p>
              </div>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-white/80">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Accès aux dossiers patients avec parcours opératoire en temps réel.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                Synchronisation automatique avec le bloc et les laboratoires.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-rose-400" />
                Collaboration fluide avec votre équipe via messagerie sécurisée.
              </li>
            </ul>

            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/75">
              <p className="font-semibold uppercase tracking-wide text-xs text-white/60">
                Déjà membre ?
              </p>
              <p className="mt-2">
                <Link href="/login" className="font-semibold text-white hover:underline">
                  Connectez-vous
                </Link>{" "}
                pour reprendre votre activité là où vous l&apos;avez laissée.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-2xl shadow-indigo-900/20">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                  Nom et prénom
                </label>
                <input
                  id="fullName"
                  required
                  value={formState.fullName}
                  onChange={handleChange("fullName")}
                  placeholder="Dr. Marie Dupuis"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Adresse e-mail professionnelle
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formState.email}
                  onChange={handleChange("email")}
                  placeholder="prenom.nom@hopital.fr"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="speciality" className="text-sm font-semibold text-slate-700">
                  Spécialité
                </label>
                <input
                  id="speciality"
                  required
                  value={formState.speciality}
                  onChange={handleChange("speciality")}
                  placeholder="Ex. Chirurgie digestive"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="establishment" className="text-sm font-semibold text-slate-700">
                  Établissement / Service
                </label>
                <input
                  id="establishment"
                  required
                  value={formState.establishment}
                  onChange={handleChange("establishment")}
                  placeholder="CHU OpenCare - Bloc opératoire 5"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formState.password}
                  onChange={handleChange("password")}
                  placeholder="Créez un mot de passe robuste"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isLoading ? "Création du compte..." : "Créer mon accès sécurisé"}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <span className="block border-t border-slate-200" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs uppercase tracking-wide text-slate-400">
                  Alternativement
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                className="mt-4 w-full border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50"
              >
                Inviter un confrère
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Vous possédez déjà un compte ?{" "}
              <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
