"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Beaker,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Circle,
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
import { navLinks, heroHighlights, featureTabs, stats, faqs, mockTasksData, mockPatientData, mockAnalysisData, mockCompteRenduData } from "@/data/landing/landing-content";
import type { TaskItem } from "@/types/tasks";

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
  const [showcaseTasks, setShowcaseTasks] = useState<TaskItem[]>(mockTasksData);
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const activeFeature = featureTabs.find((item) => item.id === activeTab) ?? featureTabs[0];

  const handleToggleTask = (taskId: string) => {
    setShowcaseTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, done: !task.done }
        : task
    ));
  };

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
                Orchestrateur clinique
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
        <section className="relative overflow-hidden pb-24 pt-16 bg-gradient-to-b from-indigo-50/80 via-purple-50/40 to-transparent">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-gradient-to-br from-fuchsia-400/40 to-pink-400/30 blur-3xl animate-pulse" />
            <div className="absolute -right-32 -top-20 h-80 w-80 rounded-full bg-gradient-to-bl from-cyan-400/30 to-blue-400/40 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-[-100px] left-1/3 h-96 w-96 rounded-full bg-gradient-to-t from-violet-400/30 to-purple-400/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className="relative mx-auto grid max-w-6xl gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr] h-full">
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
                Reliez vos <u>patients</u>, vos <u>actes</u> et vos <u>décision</u> dans une seule boucle opérationnelle.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                OpenCare orchestre les soins en temps réel : coordination IA, dossiers augmentés et analytics immédiat.
                Un cockpit élégant pour les praticiens, un parcours sans couture pour vos patients.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="primary" className="rounded-full px-8 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 border-0 shadow-lg shadow-fuchsia-400/50">
                  <Link href="/login" className="flex items-center gap-2">
                    Démarrer maintenant
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {heroHighlights.map(({ label, value, icon: Icon }, idx) => {
                  const gradients = [
                    "from-blue-500/20 to-cyan-500/20",
                    "from-fuchsia-500/20 to-pink-500/20",
                    "from-amber-500/20 to-orange-500/20"
                  ];
                  const accentColors = ["text-blue-600", "text-fuchsia-600", "text-amber-600"];
                  const borderColors = ["border-blue-200", "border-fuchsia-200", "border-amber-200"];

                  return (
                    <div
                      key={label}
                      className={`rounded-2xl border ${borderColors[idx]} bg-gradient-to-br ${gradients[idx]} backdrop-blur px-4 py-5 shadow-lg shadow-white/20 hover:shadow-xl transition`}
                    >
                      <div className={`flex items-center justify-between text-xs font-semibold uppercase tracking-wide ${accentColors[idx]}`}>
                        {label}
                        <span className={`flex h-8 w-8 items-center justify-center rounded-2xl bg-white/40 ${accentColors[idx]}`}>
                          <Icon className="h-4 w-4" />
                        </span>
                      </div>
                      <p className="mt-2 text-2xl font-semibold text-slate-800">{value}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.15}
              variants={containerVariants}
              className="relative h-full"
            >
              <div className="relative h-full rounded-[32px] border border-indigo-100 bg-white/50 p-6 shadow-2xl shadow-indigo-100 backdrop-blur overflow-hidden">
                {/* Animated background gradient orbs */}
                <div className="absolute inset-0 overflow-hidden rounded-[32px]">
                  <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br from-fuchsia-300/40 to-pink-300/30 blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                  <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gradient-to-tr from-cyan-300/40 to-blue-300/30 blur-3xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
                  <div className="absolute top-1/2 left-1/2 h-48 w-48 rounded-full bg-gradient-to-br from-purple-300/20 to-indigo-300/20 blur-3xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '5s' }} />

                  {/* Animated grid lines */}
                  <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col">
                  {/* Top section with creatively positioned cards */}
                  <div className="relative flex-1 mb-4 h-full">
                    {/* Left card - Données - positioned at top-left, normal size */}
                    <motion.div
                      initial={{ opacity: 0, x: -40, rotate: -5 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                      className="absolute top-0 left-0 w-40 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border border-white/80 p-4 shadow-lg backdrop-blur hover:shadow-xl transition z-20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="text-xs font-bold text-cyan-500"
                        >
                          ⟳
                        </motion.div>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Données consolidées</p>
                      <p className="text-xs text-slate-500 mt-1">DPI, imagerie, labo</p>
                      <div className="mt-3 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="h-full bg-gradient-to-r from-cyan-300 to-transparent"
                        />
                      </div>
                    </motion.div>

                    {/* Middle card - Paperasse - centered, slightly larger, slight rotation */}
                    <motion.div
                      initial={{ opacity: 0, y: -40, rotate: 3 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-48 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border border-white/80 p-4 shadow-lg backdrop-blur hover:shadow-xl transition z-30"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">-60%</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Paperasse réduite</p>
                      <p className="text-xs text-slate-500 mt-1">Formulaires auto-remplis</p>
                      <div className="mt-3 grid grid-cols-5 gap-0.5">
                        {[100, 85, 70, 55, 40].map((val, i) => (
                          <motion.div
                            key={i}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                            className="h-6 bg-gradient-to-t from-emerald-400 to-green-300 rounded-t-sm origin-bottom"
                            style={{ opacity: val / 100 }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Right card - Décisions - positioned at top-right, smaller */}
                    <motion.div
                      initial={{ opacity: 0, x: 40, rotate: -3 }}
                      animate={{ opacity: 1, x: 0, rotate: 0 }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      className="absolute top-0 right-0 w-40 rounded-2xl bg-gradient-to-br from-white/90 to-white/70 border border-white/80 p-4 shadow-lg backdrop-blur hover:shadow-xl transition z-20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                          <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-xs font-bold text-amber-600"
                        >
                          ★
                        </motion.span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">Meilleures décisions</p>
                      <p className="text-xs text-slate-500 mt-1">Contexte complet</p>
                      <div className="mt-3 space-y-1">
                        {['Patient', 'Analyses'].map((item, i) => (
                          <motion.div
                            key={item}
                            initial={{ width: 0 }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 0.5, delay: 0.4 + i * 0.15 }}
                            className="h-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom section - Real scenario example */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="rounded-2xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-white/30 p-4 backdrop-blur"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-slate-200">Exemple: Admission patient</p>
                      <span className="text-xs font-bold text-emerald-400">12 min vs 2h avant</span>
                    </div>
                    <div className="space-y-2">
                      {[
                        { label: 'Collecte données', time: '2 min', icon: '📋' },
                        { label: 'Analyses passées', time: '3 min', icon: '🔍' },
                        { label: 'Recommandations', time: '4 min', icon: '✓' },
                        { label: 'Plan de soins', time: '3 min', icon: '📝' }
                      ].map((item, i) => (
                        <motion.div
                          key={item.label}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                          className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-xs"
                        >
                          <span className="text-sm">{item.icon}</span>
                          <span className="flex-1 text-slate-200 font-medium">{item.label}</span>
                          <motion.span
                            animate={{ opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            className="text-emerald-300 font-bold"
                          >
                            {item.time}
                          </motion.span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
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
                  <h3 className="text-2xl font-semibold text-[#1d184f]">Essayez maintenant</h3>
                  <p className="text-sm text-slate-600">{activeFeature.description}</p>

                  {/* Interactive Component Showcase */}
                  <div className="space-y-4 pt-4">
                    {activeTab === "planning" && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-4">Consignes du jour</p>
                        {showcaseTasks.map((task) => (
                          <div key={task.id} className="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3 hover:bg-slate-100 transition">
                            <button
                              onClick={() => handleToggleTask(task.id)}
                              className="mt-0.5 flex-shrink-0"
                            >
                              {task.done ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                              ) : (
                                <Circle className="h-5 w-5 text-slate-300" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className={cn("text-sm font-medium", task.done && "line-through text-slate-400")}>
                                {task.title}
                              </p>
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-slate-500 mt-4">
                          {showcaseTasks.filter(t => t.done).length} / {showcaseTasks.length} complétées
                        </p>
                      </div>
                    )}

                    {activeTab === "patients" && (
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-slate-900">{mockPatientData.name}</p>
                              <p className="text-xs text-slate-600 mt-1">{mockPatientData.service}</p>
                            </div>
                            <span className="inline-flex px-2 py-1 rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                              {mockPatientData.status}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-slate-700"><span className="font-medium">Diagnostic :</span> {mockPatientData.diagnosis}</p>
                            <p className="text-slate-700"><span className="font-medium">Médecin :</span> {mockPatientData.doctor}</p>
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <div className="rounded-lg bg-white/60 p-2">
                                <p className="text-xs text-slate-500">Température</p>
                                <p className="font-semibold text-slate-900">{mockPatientData.lastVitals.temperature}°C</p>
                              </div>
                              <div className="rounded-lg bg-white/60 p-2">
                                <p className="text-xs text-slate-500">FC</p>
                                <p className="font-semibold text-slate-900">{mockPatientData.lastVitals.heartRate}/min</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "analytics" && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-4">Analyses récentes</p>
                        {mockAnalysisData.map((analysis) => (
                          <div key={analysis.id} className="flex items-start gap-3 rounded-xl bg-slate-50/80 p-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex-shrink-0">
                              <Beaker className="h-5 w-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">{analysis.type}</p>
                              <p className="text-xs text-slate-600">{analysis.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <p className="text-xs text-slate-500">{analysis.date}</p>
                                <span className={cn(
                                  "text-xs font-semibold px-2 py-1 rounded",
                                  analysis.status === "Reviewed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                )}>
                                  {analysis.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-200">
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
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section id="stats" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-400/10 blur-3xl" />
            <div className="absolute -left-40 -bottom-40 h-96 w-96 rounded-full bg-gradient-to-tr from-fuchsia-400/20 to-pink-400/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6">
            <motion.div
              className="flex flex-col gap-6 text-white lg:flex-row lg:items-end lg:justify-between"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              custom={0.1}
              variants={containerVariants}
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.35em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  Indicateurs clés
                </p>
                <h2 className="text-4xl font-bold leading-tight">
                  Des résultats mesurés<br />par les équipes de soins.
                </h2>
              </div>
              <p className="max-w-md text-sm text-slate-300">
                OpenCare est éprouvé sur des établissements de toutes tailles. Notre IA opérationnelle optimise blocs,
                parcours et coordination pour un impact mesurable dès les premières semaines d&apos;exploitation.
              </p>
            </motion.div>

            <motion.div
              className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              custom={0.2}
              variants={containerVariants}
            >
              {stats.map(({ label, value, icon: Icon }, idx) => {
                const gradients = [
                  "from-cyan-500/30 to-blue-500/20",
                  "from-fuchsia-500/30 to-pink-500/20",
                  "from-amber-500/30 to-orange-500/20",
                  "from-green-500/30 to-emerald-500/20"
                ];
                const borderColors = ["border-cyan-500/30", "border-fuchsia-500/30", "border-amber-500/30", "border-green-500/30"];
                const shadowColors = ["shadow-cyan-500/30", "shadow-fuchsia-500/30", "shadow-amber-500/30", "shadow-green-500/30"];
                const accentGradients = [
                  "from-cyan-400 to-blue-500",
                  "from-fuchsia-400 to-pink-500",
                  "from-amber-400 to-orange-500",
                  "from-green-400 to-emerald-500"
                ];

                return (
                  <div
                    key={label}
                    className={`group relative rounded-3xl border ${borderColors[idx]} bg-gradient-to-br ${gradients[idx]} p-6 backdrop-blur transition hover:border-opacity-100 shadow-lg ${shadowColors[idx]}`}
                  >
                    <div className="absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100 bg-gradient-to-br" />
                    <div className="relative space-y-4">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-semibold text-slate-200">{label}</p>
                        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${accentGradients[idx]} text-white shadow-lg`}>
                          <Icon className="h-6 w-6" />
                        </span>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-white">{value}</p>
                        <p className="mt-2 text-xs text-slate-400">
                          Consolidé Q1 2025
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
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
