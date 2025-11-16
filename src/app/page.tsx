"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
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
  PlayCircle,
  X,
  Wand2,
  Check,
  Copy,
  Bold,
  Italic,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navLinks, featureTabs, stats, faqs, mockTasksData, mockPatientData, mockAnalysisData, mockCompteRenduData } from "@/data/landing/landing-content";
import type { TaskItem } from "@/types/tasks";
import tasks_screen from '../../public/tasks_screen.png'
const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

const heroPillars = [
  { title: "Coordination IA", description: "Bloc, lit, imagerie et logistique alignés" },
  { title: "Expérience patient", description: "Portails intuitifs, messages rassurants" },
  { title: "Pilotage temps réel", description: "KPIs live, alertes et trajectoires" },
];

const heroCreativeBursts = [
  { title: "Flux patient", detail: "12 parcours synchronisés", gradient: "from-cyan-400 to-sky-500" },
  { title: "Cellule bloc", detail: "3 salles libérées", gradient: "from-fuchsia-400 to-rose-500" },
  { title: "Alertes IA", detail: "5 actions prioritaires", gradient: "from-amber-400 to-orange-500" },
];

const heroCreativeTimeline = [
  { label: "Captation terrain", value: "Flux IoT & DPI" },
  { label: "Traduction IA", value: "Synthèse contexte" },
  { label: "Activation équipe", value: "Checklists + SMS" },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState(featureTabs[0].id);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [showcaseTasks, setShowcaseTasks] = useState<TaskItem[]>(mockTasksData);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [mockupTasks, setMockupTasks] = useState({
    "task-private": true,
    "task-public-1": false,
    "task-public-2": false,
  });
  const [selectedPatient, setSelectedPatient] = useState<string | null>("PAT-002");
  const [topZComponent, setTopZComponent] = useState<"planning" | "analytics" | "documents" | null>(null);
  const [currentGapIndex, setCurrentGapIndex] = useState(0);
  const [typedCharCount, setTypedCharCount] = useState(0);
  const [gapOrder, setGapOrder] = useState<number[]>([0, 1, 2, 3, 4]);

  const typingGaps = [
    { section: "Anesthésie", placeholder: "Rachianesthésie" },
    { section: "Voie d'abord", placeholder: "Médiane sus-ombilicale" },
    { section: "Diagnostic opératoire", placeholder: "Appendicite perforée" },
    { section: "Geste réalisé", placeholder: "Appendicectomie, drainage" },
    { section: "Hémostase", placeholder: "Suturée à l'Acide polyglactique" },
  ];

  const getRandomGapOrder = () => {
    const order = [0, 1, 2, 3, 4];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  };

  // Observation lines for building the mockup
  const observationLines = [
    "Il s'agit d'un patient agé de 58 ans, qui s'est présenté aux urgences avec douleur abdominal au nv de FID.",
    "Examen clinique: FC: 72/min, TA: 125/80, FR: 16/min, T°: 37.2°C.",
    "Abdomen sensible à la palpation au niveau de la FID, défense localisée. Pas de contracture diffuse.",
    "Bilan biologique: NFS normale, CRP légèrement élevée à 15 mg/L. Bilan hépatique et rénal sans particularités.",
    "Imagerie (TDM abdominale): petite collection intra-abdominale. Appendice dilaté avec paroi épaissie.",
    "Diagnostic retenu: appendicite aiguë compliquée.",
    "Traitement initié: antalgiques, antibiotiques IV (céphalotine et métronidazole).",
    "Décision chirurgicale prise après consultation avec le service de chirurgie.",
    "Intervention programmée: appendicectomie en urgence sous anesthésie générale.",
    "Patient informé des risques et bénéfices. Consentement écrit obtenu.",
    "Préparation per-opératoire réalisée: jeûne, voie veineuse établie, prémédication administrée.",
    "Patient en attente de salle opératoire. Signes vitaux stables. Surveillance continue.",
  ];

  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [editorText, setEditorText] = useState("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState("");
  const activeFeature = featureTabs.find((item) => item.id === activeTab) ?? featureTabs[0];

  // Documents typing animation loop - char by char
  useEffect(() => {
    if (activeTab !== "documents") return;

    const typingLoop = async () => {
      const gapIdx = gapOrder[currentGapIndex];
      const currentGap = typingGaps[gapIdx];
      const currentText = currentGap.placeholder;

      // Type out the current gap character by character
      if (typedCharCount < currentText.length) {
        await new Promise(resolve => setTimeout(resolve, 80)); // Typing speed
        setTypedCharCount(typedCharCount + 1);
      } else {
        // Finished typing this gap, move to next
        await new Promise(resolve => setTimeout(resolve, 1500)); // Pause before next gap
        const nextGapIdx = (currentGapIndex + 1) % gapOrder.length;

        if (nextGapIdx === 0) {
          // Cycle complete, randomize new order
          setGapOrder(getRandomGapOrder());
        }

        setCurrentGapIndex(nextGapIdx);
        setTypedCharCount(0);
      }
    };

    typingLoop();
  }, [typedCharCount, currentGapIndex, activeTab, gapOrder]);

  // Smart Editor animation loop - cycling through observation lines
  useEffect(() => {
    if (activeTab !== "editor") return;

    const animationLoop = async () => {
      // If we're cycling back to the first line, clear the editor
      if (currentLineIndex === 0 && editorText !== "") {
        setEditorText("");
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const nextIndex = currentLineIndex;
      const nextLine = observationLines[nextIndex];

      // Wait before showing suggestion
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Show suggestion (the next line)
      setCurrentSuggestion(nextLine);
      setShowSuggestion(true);

      // Wait while showing suggestion
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Accept suggestion
      setIsAccepting(true);
      await new Promise(resolve => setTimeout(resolve, 600));

      // Add the line to the editor text
      setEditorText(prev => prev + (prev ? "\n" : "") + nextLine);

      // Reset animation states
      setShowSuggestion(false);
      setIsAccepting(false);
      setCurrentSuggestion("");

      // Move to next line, or restart from beginning
      const nextIdx = (nextIndex + 1) % observationLines.length;
      setCurrentLineIndex(nextIdx);
    };

    animationLoop();
  }, [currentLineIndex, activeTab, editorText]);

  // Mockup patients data
  const mockupPatients = [
    {
      id: "PAT-001",
      name: "Marie Bernard",
      age: 58,
      service: "Chirurgie digestive",
      status: "Post-op",
      admission: "2025-11-02",
      doctor: "Dr. Paul Martin",
      diagnosis: "Colectomie laparoscopique · J+7",
      vitals: { temp: 37.2, hr: 72, bp: "125/80", o2: 98 },
      labs: { hemoglobin: "11.5 g/dL", crp: "12 mg/L", glucose: "98 mg/dL" },
      medications: ["Amoxicilline 500mg", "Paracétamol 1000mg", "Oméprazole 20mg"]
    },
    {
      id: "PAT-002",
      name: "Jean Dupont",
      age: 65,
      service: "Chirurgie générale",
      status: "J+3",
      admission: "2025-11-05",
      doctor: "Dr. Sophie Bernard",
      diagnosis: "Herniorraphie inguinale · J+3",
      vitals: { temp: 36.8, hr: 68, bp: "130/82", o2: 99 },
      labs: { hemoglobin: "12.8 g/dL", crp: "5 mg/L", glucose: "102 mg/dL" },
      medications: ["Ibuprofen 400mg", "Cephalexin 500mg", "Melatonin 5mg"]
    },
    {
      id: "PAT-003",
      name: "Fatou Diop",
      age: 42,
      service: "Orthopédie",
      status: "En cours",
      admission: "2025-11-08",
      doctor: "Dr. Michel Lefevre",
      diagnosis: "Fracture tibia · J+2",
      vitals: { temp: 37.0, hr: 75, bp: "118/76", o2: 97 },
      labs: { hemoglobin: "13.2 g/dL", crp: "8 mg/L", glucose: "95 mg/dL" },
      medications: ["Tramadol 50mg", "Thromboprophylaxie", "Vitamine C"]
    },
    {
      id: "PAT-004",
      name: "Luc Moreau",
      age: 71,
      service: "Cardiologie",
      status: "Stable",
      admission: "2025-11-06",
      doctor: "Dr. Anne Dubois",
      diagnosis: "Infarctus du myocarde · J+5",
      vitals: { temp: 36.9, hr: 62, bp: "128/80", o2: 98 },
      labs: { hemoglobin: "12.1 g/dL", troponin: "0.8 ng/mL", glucose: "110 mg/dL" },
      medications: ["Aspirine 100mg", "Atorvastatine 40mg", "Bisoprolol 2.5mg"]
    },
    {
      id: "PAT-005",
      name: "Claire Rousseau",
      age: 52,
      service: "Neurochirurgie",
      status: "Stable",
      admission: "2025-11-04",
      doctor: "Dr. Jacques Martin",
      diagnosis: "Craniotomie · J+6",
      vitals: { temp: 37.1, hr: 70, bp: "124/78", o2: 99 },
      labs: { hemoglobin: "11.8 g/dL", crp: "15 mg/L", glucose: "108 mg/dL" },
      medications: ["Lévétiracétam 500mg", "Décaméthasone 4mg", "Morphine 10mg"]
    },
  ];

  const selectedPatientData = mockupPatients.find(p => p.id === selectedPatient);

  const handleToggleTask = (taskId: string) => {
    if (taskId in mockupTasks) {
      setMockupTasks(prev => ({
        ...prev,
        [taskId]: !prev[taskId as keyof typeof prev]
      }));
    } else {
      setShowcaseTasks(prev => prev.map(task =>
        task.id === taskId
          ? { ...task, done: !task.done }
          : task
      ));
    }
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
                Reliez vos <u>patients</u>, vos <u>actes</u> et vos <u>décisions</u> dans une seule boucle opérationnelle.
              </h1>
              <p className="max-w-xl text-lg text-slate-600">
                OpenCare orchestre les soins en temps réel : coordination IA, dossiers augmentés et analytics immédiats.
                Conçu comme un cockpit clinique pour synchroniser terrain, cellule planification et pilotage patient.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="primary" className="rounded-full px-8 py-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 border-0 shadow-lg shadow-fuchsia-400/50">
                  <Link href="/login" className="flex items-center gap-2">
                    Démarrer maintenant
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-indigo-200/80 bg-white/70 px-8 py-3 text-[#1d184f]"
                  type="button"
                  onClick={() => setShowDemoVideo(true)}
                >
                  <span className="flex items-center gap-2 font-semibold text-[#1d184f]">
                    Voir la démo guidée
                    <PlayCircle className="h-4 w-4" />
                  </span>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              custom={0.15}
              variants={containerVariants}
              className="relative h-full"
            >
              <div className="relative h-full overflow-hidden rounded-[40px] border border-white/30 bg-gradient-to-br from-[#1c0f47] via-[#5b21b6] to-[#f43f5e] p-8 text-white shadow-[0_20px_80px_rgba(76,29,149,0.5)]">
                <motion.div
                  aria-hidden
                  className="absolute -top-12 -right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl"
                  animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.2, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  aria-hidden
                  className="absolute bottom-4 left-0 h-56 w-56 rounded-full bg-fuchsia-400/20 blur-3xl"
                  animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -12, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative z-10 flex h-full flex-col gap-6">
                  {/* Header */}
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                      <Stethoscope className="h-4 w-4" />
                      Par médecins, pour médecins
                    </span>
                    <h2 className="text-2xl font-semibold leading-tight">
                      Reprenez du contrôle sur vos workflows critiques.
                    </h2>
                    <p className="text-sm text-white/80 leading-relaxed">
                      Une interface conçue par des praticiens pour éliminer les blocages, centraliser l'information et simplifier vos décisions quotidiennes.
                    </p>
                  </div>

                  {/* Key Benefits Cards */}
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4 hover:bg-white/15 transition">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-sky-500 text-white flex-shrink-0 mt-0.5">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">Efficace</p>
                          <p className="text-xs text-white/70">Réduit les temps de recherche information et les appels téléphoniques</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4 hover:bg-white/15 transition">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 to-rose-500 text-white flex-shrink-0 mt-0.5">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">Organisé</p>
                          <p className="text-xs text-white/70">Toutes vos tâches, alertes et patients au même endroit</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4 hover:bg-white/15 transition">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white flex-shrink-0 mt-0.5">
                          <Brain className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-white">Pilotage en temps réel</p>
                          <p className="text-xs text-white/70">KPIs live, alertes et trajectoires</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom stat/highlight */}
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="rounded-2xl border border-white/25 bg-white/15 backdrop-blur p-4 text-center"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70 mb-2">Déployé dans</p>
                    <p className="text-2xl font-bold text-white">20+ établissements</p>
                    <p className="text-xs text-white/70 mt-1">Partout en France, dès les 1ères semaines</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <AnimatePresence>
          {showDemoVideo ? (
            <motion.div
              key="demo-video"
              className="fixed inset-0 z-[200] flex items-center justify-center px-4 py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div
                className="absolute inset-0 bg-slate-950/80 backdrop-blur"
                onClick={() => setShowDemoVideo(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                className="relative z-10 w-full max-w-5xl rounded-[32px] border border-white/10 bg-slate-900/90 p-6 shadow-2xl"
              >
                <button
                  type="button"
                  className="absolute right-6 top-6 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/20"
                  onClick={() => setShowDemoVideo(false)}
                  aria-label="Fermer la vidéo"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="space-y-4 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                    Aperçu immersif
                  </p>
                  <video
                    className="h-[60vh] w-full rounded-3xl border border-white/10 object-cover"
                    autoPlay
                    loop
                    muted
                    controls
                  >
                    <source
                      src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
                      type="video/mp4"
                    />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                  <p className="text-sm text-white/80">
                    Démo fictive : remplacez ce clip par votre walkthrough produit pour montrer les flux en direct.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

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
              Une suite complète conçue par des médecins pour les médecins et résidents.
            </h2>
            <p className="mt-3 text-base text-slate-600">
              OpenCare est un studio intégré pour gérer vos tâches, vos patients, vos analyses et vos documents. Explorez chaque module et découvrez comment simplifier votre quotidien clinique.
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
              <div className="relative h-full min-h-[500px]">
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-60 blur-3xl", activeFeature.accent)} />
                <div className="relative h-full">
                  {/* Double Display - Planning/Tasks & Activities */}
                  {activeTab === "planning" && (
                    <div className="relative h-full min-h-[600px]">
                      {/* Top Left - Add Task Mockup */}
                      <div
                        onClick={() => setTopZComponent("planning")}
                        className={cn(
                          "absolute top-0 left-0 w-2/3 h-2/3 rounded-[32px] border border-indigo-100 overflow-hidden shadow-2xl shadow-indigo-100 bg-white flex flex-col cursor-pointer transition-all duration-300",
                          topZComponent === "planning" ? "z-20" : "z-10"
                        )}
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white p-4 flex-shrink-0">
                          <p className="text-xs font-semibold uppercase tracking-wide">Créer une tâche</p>
                          <h3 className="text-lg font-bold mt-2">Nouvelle consigne</h3>
                        </div>

                        {/* Form */}
                        <div className="flex-1 p-4 overflow-auto flex flex-col gap-3">
                          {/* Task Input */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Titre de la tâche</label>
                            <input
                              type="text"
                              placeholder="Ex: Vérifier les vitaux du patient"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          {/* Type Selection */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Type</label>
                            <div className="flex gap-2">
                              <button className="flex-1 px-3 py-2 rounded-lg bg-purple-100 text-purple-700 text-xs font-semibold border-2 border-purple-300 hover:bg-purple-50">
                                Privée
                              </button>
                              <button className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold border-2 border-slate-200 hover:bg-slate-50">
                                Équipe
                              </button>
                            </div>
                          </div>

                          {/* Patient Input */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase mb-1 block">Patient (optionnel)</label>
                            <input
                              type="text"
                              placeholder="Ex: PAT-001"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                          </div>

                          {/* Priority */}
                          <div>
                            <label className="text-xs font-semibold text-slate-600 uppercase mb-2 block">Priorité</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                              <option>Normale</option>
                              <option>Haute</option>
                              <option>Urgente</option>
                            </select>
                          </div>
                        </div>

                        {/* Footer - Action Button */}
                        <div className="border-t border-slate-200 p-4 flex-shrink-0 bg-slate-50">
                          <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-sm font-semibold hover:shadow-lg transition">
                            Créer la tâche
                          </button>
                        </div>
                      </div>

                      {/* Bottom Right - Component Card */}
                      <div
                        onClick={() => setTopZComponent(null)}
                        className={cn(
                          "absolute bottom-0 right-0 w-2/3 h-2/3 rounded-[32px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100 p-6 cursor-pointer transition-all duration-300",
                          topZComponent !== "planning" ? "z-20" : "z-10"
                        )}
                      >
                        <div className="relative h-full flex flex-col justify-center">
                          <div className="space-y-3">
                            {/* Private Task */}
                            <button
                              onClick={() => handleToggleTask("task-private")}
                              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition text-left w-full"
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {mockupTasks["task-private"] ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium", mockupTasks["task-private"] && "line-through text-slate-400")}>Vérifier l&apos;analgésie</p>
                                <p className="text-xs text-slate-500 mt-1">Personnel · Vous</p>
                              </div>
                              <span className="inline-flex px-2 py-1 rounded-full bg-purple-100 text-xs font-semibold text-purple-700 flex-shrink-0">Privée</span>
                            </button>

                            {/* Public Task 1 */}
                            <button
                              onClick={() => handleToggleTask("task-public-1")}
                              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition text-left w-full"
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {mockupTasks["task-public-1"] ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium", mockupTasks["task-public-1"] && "line-through text-slate-400")}>Pansement stérile</p>
                                <p className="text-xs text-slate-500 mt-1">Équipe · Fatou Diop</p>
                              </div>
                              <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-xs font-semibold text-blue-700 flex-shrink-0">Publique</span>
                            </button>

                            {/* Public Task 2 */}
                            <button
                              onClick={() => handleToggleTask("task-public-2")}
                              className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 hover:bg-slate-100 transition text-left w-full"
                            >
                              <div className="mt-0.5 flex-shrink-0">
                                {mockupTasks["task-public-2"] ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-300" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn("text-sm font-medium", mockupTasks["task-public-2"] && "line-through text-slate-400")}>Mobilisation passive</p>
                                <p className="text-xs text-slate-500 mt-1">Équipe · Jean Dupont</p>
                              </div>
                              <span className="inline-flex px-2 py-1 rounded-full bg-blue-100 text-xs font-semibold text-blue-700 flex-shrink-0">Publique</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single Display - Patients */}
                  {activeTab === "patients" && (
                    <div className="rounded-[32px] border border-indigo-100 overflow-hidden shadow-2xl shadow-indigo-100 bg-white h-full relative flex">
                      
                      {/* Patients List */}
                      <div className="flex-1 p-6 overflow-auto flex flex-col">
                        {/* Prompt Text */}
                        {!selectedPatient && (
                          <div className="mb-6 pb-6 border-b border-slate-200 flex items-center justify-center gap-2 text-center">
                            <Stethoscope className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                            <p className="text-xs text-slate-500">Cliquez sur un patient pour voir les détails</p>
                          </div>
                        )}
                        <div className="space-y-2 flex-1">
                          {mockupPatients.map((patient) => (
                            <button
                              key={patient.id}
                              onClick={() => setSelectedPatient(patient.id)}
                              className={cn(
                                "w-full text-left p-4 rounded-2xl border-2 transition duration-200 hover:shadow-md",
                                selectedPatient === patient.id
                                  ? "border-indigo-400 bg-gradient-to-r from-indigo-50 to-blue-50"
                                  : "border-slate-200 bg-white hover:border-slate-300"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900">{patient.id}</p>
                                  <p className="text-xs text-slate-500 mt-1">{patient.name} · {patient.age}y</p>
                                </div>
                                <span className={cn(
                                  "text-xs font-semibold px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap",
                                  patient.status === "Post-op" ? "bg-emerald-100 text-emerald-700" : patient.status === "Stable" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                                )}>
                                  {patient.status}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>

                        
                      </div>

                      {/* Sliding Detail Panel - Only show when selected */}
                      <AnimatePresence>
                        {selectedPatient && selectedPatientData && (
                          <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute inset-y-0 right-0 w-96 bg-gradient-to-b from-white to-slate-50 border-l-2 border-indigo-200 shadow-2xl flex flex-col overflow-hidden"
                          >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 text-white p-6 flex-shrink-0">
                              <button
                                onClick={() => setSelectedPatient(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
                              >
                                <X className="h-5 w-5" />
                              </button>
                              <div>
                                <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wide">Patient ID</p>
                                <h2 className="text-3xl font-bold mt-1">{selectedPatientData.id}</h2>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-auto p-6 space-y-4">
                              {/* Status & Service Row */}
                              <div className="grid grid-cols-2 gap-3">
                                <div className={cn(
                                  "rounded-xl p-3 border-2",
                                  selectedPatientData.status === "Post-op" ? "bg-emerald-50 border-emerald-200" : selectedPatientData.status === "Stable" ? "bg-blue-50 border-blue-200" : "bg-amber-50 border-amber-200"
                                )}>
                                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">État</p>
                                  <p className={cn(
                                    "text-sm font-bold",
                                    selectedPatientData.status === "Post-op" ? "text-emerald-700" : selectedPatientData.status === "Stable" ? "text-blue-700" : "text-amber-700"
                                  )}>
                                    {selectedPatientData.status}
                                  </p>
                                </div>
                                <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-3">
                                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Service</p>
                                  <p className="text-sm font-bold text-indigo-700">{selectedPatientData.service}</p>
                                </div>
                              </div>

                              {/* Diagnosis */}
                              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Diagnostic</p>
                                <p className="text-sm font-semibold text-slate-900">{selectedPatientData.diagnosis}</p>
                              </div>

                              {/* Doctor & Admission */}
                              <div className="space-y-3">
                                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Médecin</p>
                                  <p className="text-sm font-bold text-slate-900">{selectedPatientData.doctor}</p>
                                </div>
                                <div className="bg-slate-100 rounded-xl p-4 border border-slate-200">
                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Admission</p>
                                  <p className="text-sm font-bold text-slate-900">{selectedPatientData.admission}</p>
                                </div>
                              </div>

                              {/* Vital Signs */}
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Signes vitaux</p>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                                    <p className="text-xs text-red-600 font-semibold">Temp.</p>
                                    <p className="text-lg font-bold text-red-700 mt-1">{selectedPatientData.vitals.temp}°C</p>
                                  </div>
                                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                                    <p className="text-xs text-orange-600 font-semibold">FC</p>
                                    <p className="text-lg font-bold text-orange-700 mt-1">{selectedPatientData.vitals.hr}/min</p>
                                  </div>
                                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                                    <p className="text-xs text-purple-600 font-semibold">TA</p>
                                    <p className="text-lg font-bold text-purple-700 mt-1">{selectedPatientData.vitals.bp}</p>
                                  </div>
                                  <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-center">
                                    <p className="text-xs text-cyan-600 font-semibold">O₂</p>
                                    <p className="text-lg font-bold text-cyan-700 mt-1">{selectedPatientData.vitals.o2}%</p>
                                  </div>
                                </div>
                              </div>

                              {/* Lab Values */}
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Valeurs de laboratoire</p>
                                <div className="space-y-2">
                                  {Object.entries(selectedPatientData.labs).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                      <p className="text-sm font-bold text-slate-900">{value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Medications */}
                              <div>
                                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Medications</p>
                                <div className="space-y-1">
                                  {selectedPatientData.medications.map((med, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-lg p-3">
                                      <div className="h-2 w-2 rounded-full bg-indigo-500 flex-shrink-0" />
                                      <p className="text-sm text-slate-900">{med}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Clinical Observations Timeline */}
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Observations cliniques</p>
                                  <button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">+ Ajouter</button>
                                </div>
                                <div className="space-y-3">
                                  {/* Observation 1 */}
                                  <div className="relative pl-4 pb-4 border-l-2 border-indigo-300">
                                    <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-2 top-1 border-2 border-white" />
                                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-indigo-700 mb-1">Aujourd'hui - 14:30</p>
                                      <p className="text-sm text-slate-900">Patient conscient et orienté, douleur contrôlée. Pansements secs.</p>
                                    </div>
                                  </div>

                                  {/* Observation 2 */}
                                  <div className="relative pl-4 pb-4 border-l-2 border-blue-300">
                                    <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-2 top-1 border-2 border-white" />
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-blue-700 mb-1">Hier - 09:15</p>
                                      <p className="text-sm text-slate-900">Mobilisation progressive tolérée. Tension stable.</p>
                                    </div>
                                  </div>

                                  {/* Observation 3 */}
                                  <div className="relative pl-4 border-l-2 border-cyan-300">
                                    <div className="absolute w-3 h-3 bg-cyan-500 rounded-full -left-2 top-1 border-2 border-white" />
                                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-cyan-700 mb-1">22 novembre - 16:45</p>
                                      <p className="text-sm text-slate-900">Post-opératoire immédiat. Patient sous surveillance continue.</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="border-t border-slate-200 p-6 space-y-3 bg-white flex-shrink-0">
                              <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition">
                                Voir le dossier complet
                              </button>
                              <button
                                onClick={() => setSelectedPatient(null)}
                                className="w-full px-4 py-3 rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300 transition"
                              >
                                Fermer
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Single Display - Smart Editor */}
                  {activeTab === "editor" && (
                    <div className="rounded-[32px] border border-indigo-100 overflow-hidden shadow-2xl shadow-indigo-100 bg-white flex flex-col h-full">
                      {/* Toolbar */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 p-4 flex items-center gap-2 flex-shrink-0">
                        <p className="text-xs font-semibold text-slate-600 uppercase mr-2">Outils</p>
                        <button className="p-2 hover:bg-slate-200 rounded-lg transition" title="Bold">
                          <Bold className="h-4 w-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-200 rounded-lg transition" title="Italic">
                          <Italic className="h-4 w-4 text-slate-600" />
                        </button>
                        <button className="p-2 hover:bg-slate-200 rounded-lg transition" title="List">
                          <List className="h-4 w-4 text-slate-600" />
                        </button>
                        <div className="flex-1" />

                        {/* AI Suggestion Button - Dynamic */}
                        <motion.button
                          animate={isAccepting ? { scale: 0.95 } : { scale: 1 }}
                          className={cn(
                            "p-2 rounded-lg transition relative",
                            isAccepting
                              ? "bg-emerald-100 hover:bg-emerald-200"
                              : "bg-indigo-100 hover:bg-indigo-200"
                          )}
                          title={isAccepting ? "Accept" : "AI Suggestion"}
                        >
                          {isAccepting ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <Wand2 className="h-4 w-4 text-indigo-600" />
                          )}
                          {showSuggestion && !isAccepting && (
                            <motion.div
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                              className="absolute inset-0 rounded-lg border-2 border-indigo-400"
                            />
                          )}
                        </motion.button>

                        <button className="p-2 hover:bg-slate-200 rounded-lg transition" title="Copy">
                          <Copy className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>

                      {/* Editor Area */}
                      <div className="flex-1 p-6 overflow-auto flex flex-col">
                        <label className="text-xs font-semibold text-slate-600 uppercase mb-3 block">Observation clinique</label>

                        {/* Textarea Container */}
                        <div className="relative flex-1 border-2 border-slate-200 rounded-xl overflow-hidden bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
                          <textarea
                            value={editorText}
                            onChange={(e) => setEditorText(e.target.value)}
                            placeholder="Commencez à écrire... l'IA suggérera automatiquement"
                            className="w-full h-full p-4 text-sm resize-none focus:outline-none bg-white"
                          />

                          {/* Ghost Text Suggestion */}
                          {showSuggestion && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 0.5 }}
                              exit={{ opacity: 0 }}
                              className="absolute top-4 left-4 right-4 text-sm text-slate-400 pointer-events-none whitespace-pre-wrap"
                            >
                              {editorText}{editorText && "\n"}{currentSuggestion}
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="border-t border-slate-200 p-6 bg-slate-50 flex-shrink-0">
                        <button className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm font-semibold hover:shadow-lg transition">
                          Valider et sauvegarder
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Single Display - Analyses */}
                  {/* Double Display - Analyses */}
                  {activeTab === "analytics" && (
                    <div className="relative h-full min-h-[600px]">
                      {/* Top Left - Camera Scan Demo */}
                      <div
                        onClick={() => setTopZComponent("analytics")}
                        className={cn(
                          "absolute top-0 left-0 w-2/3 h-2/3 rounded-[32px] border border-indigo-100 overflow-hidden shadow-2xl shadow-indigo-100 bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col cursor-pointer transition-all duration-300",
                          topZComponent === "analytics" ? "z-20" : "z-10"
                        )}
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-4 flex-shrink-0">
                          <p className="text-xs font-semibold uppercase tracking-wide">Scanner de lab</p>
                          <h3 className="text-lg font-bold mt-2">Capturez un résultat</h3>
                        </div>

                        {/* Camera Preview Area */}
                        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
                          {/* Camera Frame Mockup */}
                          <div className="w-full max-w-xs aspect-square border-4 border-indigo-300 rounded-2xl bg-white relative overflow-hidden">
                            {/* Grid overlay */}
                            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                              {Array.from({ length: 9 }).map((_, i) => (
                                <div key={i} className="border border-indigo-200/50" />
                              ))}
                            </div>

                            {/* Animated scanning line */}
                            <motion.div
                              animate={{ y: ["-100%", "100%"] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                            />

                            {/* Placeholder text */}
                            <div className="absolute inset-0 flex items-center justify-center text-center">
                              <div className="space-y-3">
                                <Beaker className="h-12 w-12 text-slate-300 mx-auto" />
                                <p className="text-sm text-slate-400">Pointez votre caméra</p>
                              </div>
                            </div>
                          </div>

                          {/* Camera button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="mt-6 w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg flex items-center justify-center hover:shadow-xl transition"
                          >
                            <Circle className="h-8 w-8" />
                          </motion.button>
                        </div>
                      </div>

                      {/* Bottom Right - Lab Result Card */}
                      <div
                        onClick={() => setTopZComponent(null)}
                        className={cn(
                          "absolute bottom-0 right-0 w-2/3 h-2/3 rounded-[32px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100 p-6 overflow-auto cursor-pointer transition-all duration-300",
                          topZComponent !== "analytics" ? "z-20" : "z-10"
                        )}
                      >
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="border-b border-slate-200 pb-4">
                            <h3 className="text-sm font-bold text-slate-900">Résultat numérisé</h3>
                            <p className="text-xs text-slate-500 mt-1">CBC - 22 novembre 2025 · Automatiquement rempli</p>
                          </div>

                          {/* Lab Values Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "Hémoglobine", value: "13.5", unit: "g/dL", status: "Normal" },
                              { label: "Hématocrite", value: "40.2", unit: "%", status: "Normal" },
                              { label: "RBC", value: "4.8", unit: "M/µL", status: "Normal" },
                              { label: "WBC", value: "7.2", unit: "K/µL", status: "Normal" },
                              { label: "Plaquettes", value: "245", unit: "K/µL", status: "Normal" },
                              { label: "MCV", value: "88", unit: "fL", status: "Normal" },
                            ].map((item, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-3"
                              >
                                <p className="text-xs font-semibold text-slate-600">{item.label}</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                  <p className="text-lg font-bold text-slate-900">{item.value}</p>
                                  <p className="text-xs text-slate-500">{item.unit}</p>
                                </div>
                                <p className="text-xs text-emerald-700 font-semibold mt-1">✓ {item.status}</p>
                              </motion.div>
                            ))}
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-4 border-t border-slate-200">
                            <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-semibold hover:shadow-lg transition">
                              Ajouter à la visite
                            </button>
                            <button className="w-full px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition">
                              Scanner à nouveau
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Single Display - Documents */}
                  {/* Double Display - Documents */}
                  {activeTab === "documents" && (
                    <div className="relative h-full min-h-[600px]">
                      {/* Top Left - Document Templates */}
                      <div
                        onClick={() => setTopZComponent("documents")}
                        className={cn(
                          "absolute top-0 left-0 w-2/3 h-2/3 rounded-[32px] border border-indigo-100 overflow-hidden shadow-2xl shadow-indigo-100 bg-white flex flex-col cursor-pointer transition-all duration-300",
                          topZComponent === "documents" ? "z-20" : "z-10"
                        )}
                      >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 flex-shrink-0">
                          <p className="text-xs font-semibold uppercase tracking-wide">Modèles</p>
                          <h3 className="text-lg font-bold mt-2">Choisissez un modèle</h3>
                        </div>

                        {/* Templates List */}
                        <div className="flex-1 overflow-auto p-6 space-y-3">
                          {[
                            { title: "Compte-rendu opératoire", icon: "📋", recent: "2 modèles" },
                            { title: "Ordonnance de sortie", icon: "💊", recent: "5 modèles" },
                            { title: "Lettre de référence", icon: "✉️", recent: "3 modèles" },
                          ].map((doc, idx) => (
                            <button
                              key={idx}
                              className="w-full p-4 border border-slate-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition text-left"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{doc.icon}</span>
                                <div className="flex-1">
                                  <p className="text-sm font-semibold text-slate-900">{doc.title}</p>
                                  <p className="text-xs text-slate-500">{doc.recent}</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Right - Template Editor with Ghost Text */}
                      <div
                        onClick={() => setTopZComponent(null)}
                        className={cn(
                          "absolute bottom-0 right-0 w-2/3 h-2/3 rounded-[32px] border border-indigo-100 bg-white shadow-2xl shadow-indigo-100 p-6 overflow-auto cursor-pointer transition-all duration-300 flex flex-col",
                          topZComponent !== "documents" ? "z-20" : "z-10"
                        )}
                      >
                        <div className="space-y-3">
                          {/* Header */}
                          <div className="border-b border-slate-200 pb-3">
                            <h3 className="text-sm font-bold text-slate-900">Compte-rendu opératoire</h3>
                            <p className="text-xs text-slate-500 mt-1">Cliquez dans les champs pour ajouter vos détails</p>
                          </div>

                          {/* Template Text Area */}
                          <div className="flex-1 relative border-2 border-slate-200 rounded-xl overflow-hidden bg-slate-50 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100">
                            <div className="p-4 text-sm space-y-4 whitespace-pre-wrap text-slate-900">
                              {typingGaps.map((gap, idx) => {
                                const isCurrentGap = gapOrder[currentGapIndex] === idx;
                                const typedText = isCurrentGap ? gap.placeholder.substring(0, typedCharCount) : "";
                                const hasTyped = isCurrentGap && typedCharCount > 0;

                                return (
                                  <div key={idx}>
                                    <span className="font-semibold text-slate-400">{gap.section} : </span>
                                    <span className="text-slate-400">
                                      {idx === 0 && "Anesthésie régionale"}
                                      {idx === 1 && "Chirurgicale"}
                                      {idx === 2 && "Pathologie abdominale"}
                                      {idx === 3 && "Intervention chirurgicale"}
                                      {idx === 4 && "Technique standard"}
                                    </span>
                                    {hasTyped && (
                                      <span className="ml-1 text-slate-900 font-semibold">
                                        {typedText}
                                        <motion.span
                                          animate={{ opacity: [1, 0] }}
                                          transition={{ duration: 0.6, repeat: Infinity }}
                                          className="text-slate-900"
                                        >
                                          |
                                        </motion.span>
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="space-y-2">
                            <button className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-lg transition">
                              Sauvegarder le compte-rendu
                            </button>
                            <button className="w-full px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition">
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
