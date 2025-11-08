"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

const specialties = [
  "Cardiologie",
  "Chirurgie générale",
  "Chirurgie viscérale",
  "Chirurgie thoracique",
  "Neurochirurgie",
  "Orthopédie",
  "Urologie",
  "Gynécologie-Obstétrique",
  "Pédiatrie",
  "Anesthésie-Réanimation",
  "Radiologie",
  "Pathologie",
  "Oncologie",
  "Gastro-entérologie",
  "Pneumologie",
  "Médecine interne",
  "Rhumatologie",
  "Dermatologie",
  "Neurologie",
  "Ophtalmologie",
  "ORL",
  "Dentisterie",
  "Autre",
];

const hospitals = [
  "Hôpital Bicêtre (APHP)",
  "Hôpital Broussais (APHP)",
  "Hôpital Cochin (APHP)",
  "Hôpital de la Pitié-Salpêtrière (APHP)",
  "Hôpital Lariboisière (APHP)",
  "Hôpital Saint-Louis (APHP)",
  "Hôpital Américain de Paris",
  "Clinique du Val d'Or",
  "Hospices Civils de Lyon",
  "CHU de Marseille",
  "CHU de Nice",
  "CHU de Toulouse",
  "CHU de Bordeaux",
  "CHU de Montpellier",
  "CHU de Nancy",
  "CHU de Strasbourg",
  "CHU de Grenoble",
  "CHU de Lille",
  "CHU de Rennes",
  "CHU de Rouen",
  "Autre",
];

const years = [
  "1ère année",
  "2ème année",
  "3ème année",
  "4ème année",
  "5ème année",
  "Spécialiste",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();

  const [formState, setFormState] = useState({
    specialty: "",
    hospital: "",
    year: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  const handleChange = (field: keyof typeof formState) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormState((prev) => ({ ...prev, [field]: e.target.value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (res.ok) {
        // Update the session to refresh the JWT token with new user data
        // Pass an empty object to trigger the "update" event in JWT callback
        await updateSession({});

        // Wait for session to update, then redirect
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 500);
      } else {
        const data = await res.json();
        setError(data.error || "An error occurred");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1f2937] to-[#312e81]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 h-80 w-80 rounded-full bg-indigo-400/40 blur-3xl" />
        <div className="absolute bottom-0 left-8 h-72 w-72 rounded-full bg-rose-500/30 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="mb-12 text-center text-white">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#4f46e5] text-xl font-bold text-white shadow-lg shadow-indigo-300/60">
              OC
            </span>
            <h1 className="text-3xl font-bold">OpenCare</h1>
          </div>
          <h2 className="text-3xl font-semibold">Complétez votre profil</h2>
          <p className="mt-3 text-sm text-white/70">
            Quelques informations pour personnaliser votre expérience et vous proposer le meilleur contenu.
          </p>
        </div>

        <div className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/10 p-1 shadow-[0_25px_80px_-25px_rgba(79,70,229,0.65)] backdrop-blur-xl">
          <div className="rounded-[30px] bg-white p-8 shadow-2xl shadow-indigo-900/25">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="specialty" className="text-sm font-semibold text-slate-700">
                  Spécialité médicale
                </label>
                <select
                  id="specialty"
                  required
                  value={formState.specialty}
                  onChange={handleChange("specialty")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Sélectionnez votre spécialité</option>
                  {specialties.map((specialty) => (
                    <option key={specialty} value={specialty}>
                      {specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="hospital" className="text-sm font-semibold text-slate-700">
                  Établissement hospitalier
                </label>
                <select
                  id="hospital"
                  required
                  value={formState.hospital}
                  onChange={handleChange("hospital")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Sélectionnez votre établissement</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital} value={hospital}>
                      {hospital}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="year" className="text-sm font-semibold text-slate-700">
                  Année de formation / Statut
                </label>
                <select
                  id="year"
                  required
                  value={formState.year}
                  onChange={handleChange("year")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">Sélectionnez votre année</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sauvegarde en cours…" : "Continuer vers le tableau de bord"}
                {!isLoading && <ChevronRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Vous pourrez modifier ces informations à tout moment dans vos paramètres.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
