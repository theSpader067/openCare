"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarDays,
  ChevronRight,
  CircleCheck,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navLinks, heroHighlights, featureTabs, stats, faqs } from "@/data/landing/landing-content";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(featureTabs[0].id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const activeFeature = featureTabs.find((item) => item.id === activeTab) ?? featureTabs[0];

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-slate-900">
      <header className="relative z-30">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-200/80 to-transparent" />
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <div className="flex items-center justify-between gap-4 rounded-3xl border border-indigo-100 bg-white/70 px-5 py-4 shadow-lg shadow-indigo-100 backdrop-blur">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#6366f1] to-[#22d3ee] text-base font-semibold text-white shadow-lg shadow-indigo-300/60">
                OC
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">
                  OpenCare
                </span>
                <span className="text-sm font-semibold text-slate-800">
                  Suite clinique augmentée
                </span>
              </div>
            </Link>

            <div className="hidden items-center gap-6 text-sm font-medium lg:flex">
              {navLinks.map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="group relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[#454562] transition hover:text-indigo-600"
                >
                  <span className="relative z-10">{label}</span>
                  <span className="absolute inset-0 rounded-full bg-indigo-50 opacity-0 transition group-hover:opacity-100" />
                </a>
              ))}
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Button variant="ghost" size="sm" className="rounded-full px-4 text-sm">
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button variant="primary" size="sm" className="rounded-full px-4 text-sm">
                <Link href="/signup" className="flex items-center gap-2">
                  Créer un compte
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>

            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-indigo-100 bg-white text-indigo-600 shadow-sm shadow-indigo-100 transition lg:hidden"
              onClick={() => setIsMenuOpen((previous) => !previous)}
              aria-label="Ouvrir le menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isMenuOpen ? (
            <motion.div
              key="mobile-nav"
              className="mx-6 mt-3 rounded-3xl border border-indigo-100 bg-white/95 p-6 text-sm font-medium text-slate-600 shadow-xl shadow-indigo-100 lg:hidden"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
            >
              <div className="space-y-3">
                {navLinks.map(({ href, label }) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center justify-between rounded-2xl border border-transparent px-3 py-2 transition hover:border-indigo-100 hover:bg-indigo-50/70 hover:text-indigo-600"
                  >
                    <span>{label}</span>
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
              <div className="mt-6 grid gap-3">
                <Button variant="ghost" className="w-full rounded-full" onClick={() => setIsMenuOpen(false)}>
                  <Link href="/login">Se connecter</Link>
                </Button>
                <Button variant="primary" className="w-full rounded-full" onClick={() => setIsMenuOpen(false)}>
                  <Link href="/signup" className="flex items-center justify-center gap-2">
                    Créer un compte
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden pb-24 pt-16">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 top-16 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="absolute -right-28 top-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="absolute bottom-[-120px] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-purple-200/40 blur-3xl" />
          </div>
          <div className="relative mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.05}
              variants={containerVariants}
              className="space-y-8"
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-700 shadow-sm shadow-indigo-200">
                <Sparkles className="h-3.5 w-3.5" />
                Plateforme dédiée aux équipes de soins
              </span>
              <h1 className="text-4xl font-semibold leading-tight text-[#1d184f] sm:text-5xl">
                Reliez vos blocs, vos patients et vos décisions dans une seule boucle opérationnelle.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                OpenCare orchestre les soins en temps réel : coordination IA, dossiers augmentés et analytics immédiat.
                Un cockpit élégant pour les praticiens, un parcours sans couture pour vos patients.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="primary" className="rounded-full px-6 py-3">
                  <Link href="/login" className="flex items-center gap-2">
                    Démarrer maintenant
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-full px-6 py-3">
                  <Link href="#features">Découvrir la plateforme</Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map(({ label, value, icon: Icon }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-indigo-100 bg-white/80 px-4 py-5 shadow-sm shadow-indigo-100"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      {label}
                      <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                        <Icon className="h-4 w-4" />
                      </span>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-[#1d184f]">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.15}
              variants={containerVariants}
              className="relative"
            >
              <div className="relative rounded-[32px] border border-indigo-100 bg-white/80 p-6 shadow-2xl shadow-indigo-100 backdrop-blur">
                <div className="absolute -top-10 right-8 hidden rounded-full bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 md:flex">
                  Vision bloc en direct
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#22d3ee] p-5 text-white shadow-lg shadow-indigo-200/60">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                    Coordination IA
                  </p>
                  <p className="mt-3 text-3xl font-semibold">98%</p>
                  <p className="text-xs text-white/80">Score de préparation bloc</p>
                  <div className="mt-6 grid gap-2 text-xs">
                    <p className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-white/80">
                      <span>Checklists complétées</span>
                      <span className="font-semibold text-white">42 / 43</span>
                    </p>
                    <p className="flex items-center justify-between rounded-xl bg-white/10 px-3 py-2 text-white/80">
                      <span>Alertes critiques résolues</span>
                      <span className="font-semibold text-white">-12%</span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl border border-indigo-100 bg-white/90 p-5 shadow-sm shadow-indigo-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Parcours du jour
                  </p>
                  <div className="mt-4 space-y-3">
                    {["Pré-op", "En cours", "Surveillance"].map((stage) => (
                      <div
                        key={stage}
                        className="flex items-center justify-between rounded-2xl border border-indigo-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{stage}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-500">
                          <CircleCheck className="h-3.5 w-3.5" />
                          Validé
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 left-6 hidden w-64 rounded-3xl border border-white/60 bg-white/90 p-4 text-xs shadow-xl shadow-indigo-100 md:block">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                  Interventions sensibles
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  3 patients à risque à surveiller · alertes partagées avec l&apos;anesthésie.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* À propos / Modules */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            custom={0.1}
            variants={containerVariants}
          >
            <span className="rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
              À propos
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-[#1d184f]">
              Une plateforme co-créée avec vos blocs, vos services et vos cadres.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Naviguez dans nos modules comme dans un studio : chaque section révèle ses workflows, ses insights et sa valeur clinique.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_1fr]">
            <motion.div
              className="space-y-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.2}
              variants={containerVariants}
            >
              {featureTabs.map((feature) => {
                const Icon = feature.icon;
                const isActive = feature.id === activeTab;
                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "rounded-3xl border border-indigo-100 bg-white/70 p-5 shadow-sm shadow-indigo-100 transition",
                      isActive && "border-indigo-200 bg-indigo-50/70 shadow-lg shadow-indigo-200",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab(feature.id)}
                      className="flex w-full items-center justify-between gap-4 text-left"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-500">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-[#1d184f]">{feature.title}</p>
                          <p className="text-xs text-slate-500">Cliquez pour explorer</p>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-5 w-5 text-indigo-400 transition",
                          isActive && "rotate-90 text-indigo-600",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isActive ? (
                        <motion.div
                          key={`${feature.id}-content`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1, transition: { duration: 0.35 } }}
                          exit={{ height: 0, opacity: 0, transition: { duration: 0.25 } }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 space-y-3 text-sm text-slate-600">
                            <p>{feature.description}</p>
                            <ul className="space-y-2">
                              {feature.highlights.map((item) => (
                                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                                  <CircleCheck className="mt-0.5 h-4 w-4 text-indigo-500" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>

            <motion.div
              className="relative"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.25}
              variants={containerVariants}
            >
              <div className="relative overflow-hidden rounded-[32px] border border-indigo-100 bg-white p-8 shadow-2xl shadow-indigo-100">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 blur-3xl", activeFeature.accent)} />
                <div className="relative space-y-6">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-600">
                    {activeFeature.badge}
                  </span>
                  <h3 className="text-2xl font-semibold text-[#1d184f]">{activeFeature.title}</h3>
                  <p className="text-sm text-slate-600">{activeFeature.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeFeature.highlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm shadow-indigo-100"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {activeFeature.insights.map(({ label, value }) => (
                      <div
                        key={label}
                        className="rounded-2xl bg-gradient-to-br from-white/90 to-white/70 px-4 py-4 shadow-inner shadow-indigo-100"
                      >
                        <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">{label}</p>
                        <p className="mt-2 text-xl font-semibold text-[#1d184f]">{value}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="group inline-flex items-center gap-2 text-sm font-semibold text-indigo-600"
                  >
                    Explorer les workflows
                    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="bg-slate-900 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              className="flex flex-col gap-6 text-white lg:flex-row lg:items-end lg:justify-between"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0.1}
              variants={containerVariants}
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-indigo-300">
                  Indicateurs clés
                </p>
                <h2 className="text-3xl font-semibold">
                  Des chiffres qui traduisent l&apos;adhésion des équipes hospitalières.
                </h2>
              </div>
              <p className="max-w-md text-sm text-indigo-200">
                OpenCare est éprouvé sur des établissements de toutes tailles. Notre IA opérationnelle optimise blocs,
                parcours et coordination pour un impact mesurable dès les premières semaines d&apos;exploitation.
              </p>
            </motion.div>

            <motion.div
              className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.2}
              variants={containerVariants}
            >
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6 shadow-inner shadow-indigo-900/30"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-indigo-200">{label}</p>
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-white">{value}</p>
                  <p className="mt-2 text-xs text-indigo-200/80">
                    Données consolidées au 1er trimestre 2025.
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-6 py-20">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={0.1}
            variants={containerVariants}
          >
            <span className="rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-semibold text-[#1d184f]">
              Questions fréquentes des équipes de soins.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Besoin de précisions ? Notre équipe projet vous accompagne pour un déploiement serein.
            </p>
          </motion.div>

          <motion.div
            className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            custom={0.2}
            variants={containerVariants}
          >
            {faqs.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={item.question}
                  className={cn(
                    "rounded-3xl border border-slate-200 bg-white px-5 py-5 shadow-sm transition",
                    isOpen && "border-indigo-200 bg-indigo-50/70 shadow-md shadow-indigo-100",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-slate-700"
                  >
                    <span>{item.question}</span>
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 text-indigo-500 transition",
                        isOpen && "bg-indigo-500 text-white",
                      )}
                    >
                      {isOpen ? "–" : "+"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.p
                        key={`${item.question}-answer`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden pt-3 text-sm leading-relaxed text-slate-600"
                      >
                        {item.answer}
                      </motion.p>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </motion.div>
        </section>

        {/* Contact */}
        <section id="contact" className="bg-slate-50 py-20">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0.1}
              variants={containerVariants}
              className="rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 p-8 text-white shadow-2xl shadow-indigo-200/40"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/80">Contact</p>
              <h2 className="mt-3 text-3xl font-semibold">
                Planifions une démonstration personnalisée pour votre service.
              </h2>
              <p className="mt-4 text-sm text-white/80">
                Laissez-nous quelques informations : un expert OpenCare vous recontactera en 24h pour cadrer vos enjeux et définir un plan de déploiement.
              </p>
              <div className="mt-10 space-y-4 text-sm">
                <p className="flex items-center gap-3 text-white/90">
                  <ShieldCheck className="h-5 w-5" />
                  Hébergement HDS, conformité RGPD, authentification forte inclus.
                </p>
                <p className="flex items-center gap-3 text-white/90">
                  <Brain className="h-5 w-5" />
                  Roadmap IA partagée avec votre équipe pour améliorer les parcours.
                </p>
                <p className="flex items-center gap-3 text-white/90">
                  <MessageCircle className="h-5 w-5" />
                  Support dédié praticiens et cellules d&apos;organisation hospitalière.
                </p>
              </div>
            </motion.div>

            <motion.form
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0.2}
              variants={containerVariants}
            >
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Nom &amp; Prénom
                  </label>
                  <input
                    id="name"
                    required
                    placeholder="Dr. Elise Fontaine"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    E-mail professionnel
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="prenom.nom@hopital.fr"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="service" className="text-sm font-semibold text-slate-700">
                    Service / spécialité
                  </label>
                  <input
                    id="service"
                    required
                    placeholder="Bloc, chirurgie, coordination..."
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="message" className="text-sm font-semibold text-slate-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    placeholder="Parlez-nous de vos enjeux ou besoins spécifiques."
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" className="mt-6 w-full rounded-full">
                Envoyer ma demande
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500">
                Nous vous recontactons sous 24h ouvrées. Données sécurisées et utilisées uniquement pour le suivi de votre demande.
              </p>
            </motion.form>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden bg-[#0b1120] py-16 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 text-lg font-semibold text-white shadow-lg shadow-indigo-900/40">
                OC
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-indigo-200">
                  OpenCare
                </p>
                <p className="text-sm font-semibold text-white">Orchestrateur clinique</p>
              </div>
            </div>
            <p className="text-sm text-indigo-200">
              Nous aidons les praticiens et équipes hospitalières à offrir une expérience patient cohérente, fluide et mesurable.
            </p>
            <div className="flex flex-wrap gap-3 text-xs text-indigo-200/80">
              <span>© {new Date().getFullYear()} OpenCare</span>
              <span>·</span>
              <Link href="#" className="hover:text-white">
                Mentions légales
              </Link>
              <span>·</span>
              <Link href="#" className="hover:text-white">
                Politique de confidentialité
              </Link>
            </div>
          </div>

          <div className="grid flex-1 gap-6 text-sm text-indigo-200 md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                Plateforme
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#features" className="hover:text-white">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#stats" className="hover:text-white">
                    Indicateurs
                  </a>
                </li>
                <li>
                  <a href="#contact" className="hover:text-white">
                    Démo personnalisée
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                Ressources
              </p>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#faq" className="hover:text-white">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Centre d&apos;aide
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Programme partenaires
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">
                Rester informé
              </p>
              <p className="mt-4 text-xs text-indigo-200/80">
                Abonnez-vous à notre bulletin trimestriel pour découvrir nos innovations.
              </p>
              <form className="mt-4 space-y-3">
                <input
                  type="email"
                  placeholder="votre.email@hopital.fr"
                  className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs text-white placeholder:text-indigo-200 focus:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-200/60"
                />
                <Button type="submit" variant="primary" size="sm" className="w-full rounded-full">
                  S&apos;abonner
                </Button>
              </form>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
