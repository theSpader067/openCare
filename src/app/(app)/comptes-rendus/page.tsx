"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import { Calendar, FilePlus, Stethoscope, User, X, Plus, MoreVertical, Trash2, Download } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { CompteRenduPDF } from "@/components/pdf/CompteRenduPDF";
import { CRTemplatesSidebar } from "@/components/comptes-rendus/CRTemplatesSidebar";
import { CreateCRTemplateModal } from "@/components/comptes-rendus/CreateCRTemplateModal";
import { QuillEditor } from "@/components/QuillEditor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataListLayout } from "@/components/document/DataListLayout";
import { PatientModal } from "@/components/document/PatientModal";
import type { Patient } from "@/types/document";
import { operationTypes, mockPatients } from "@/data/comptes-rendus/comptes-rendus-data";
import { createCompteRendu, getComptesRendus, deleteCompteRendu } from "@/lib/api/comptes-rendus";
import type { DocumentItem } from "@/types/document";
import "quill/dist/quill.snow.css";

type Operation = {
  id: string;
  title: string;
  type: string;
  date: string;
  duration: number;
  operators: Operator[];
  participants?: Operator[];
  details: string;
  postNotes: string;
  patient?: Patient;
  patientName?: string;
  patientAge?: string;
  patientHistory?: string;
  createdAt: string;
  createdBy: string;
};

type Operator = {
  id: string;
  name: string;
  role: string;
};

type TeamMember = {
  id: string;
  name: string;
  role: string;
};

// Simple Quill editor component for details field
function QuillDetailsEditor({ value, onChange, placeholder }: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current) return;

    import("quill").then((Quill) => {
      if (!editorRef.current || quillRef.current) return;

      const quill = new Quill.default(editorRef.current, {
        theme: "snow",
        placeholder: placeholder || "Déroulement de l'intervention, observations, incidents…",
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            ["list", { "list": "ordered" }],
          ],
        },
        formats: ["bold", "italic", "underline", "list"],
      });

      quillRef.current = quill;

      if (value) {
        quill.root.innerHTML = value;
      }

      quill.on("text-change", () => {
        onChange(quill.root.innerHTML);
      });

      return () => {
        quillRef.current = null;
      };
    });
  }, [mounted, placeholder]);

  useEffect(() => {
    if (quillRef.current && value !== undefined && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  if (!mounted) {
    return (
      <div className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500">
        Chargement de l'éditeur…
      </div>
    );
  }

  return (
    <div className="quill-details-editor">
      <div ref={editorRef} />
      <style jsx global>{`
        .quill-details-editor .ql-container {
          border: none !important;
          font-family: inherit;
        }

        .quill-details-editor .ql-editor {
          min-height: 150px;
          padding: 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: rgb(15 23 42);
          border: 1px solid rgb(226 232 240);
          border-radius: 0.75rem;
        }

        .quill-details-editor .ql-editor.ql-blank::before {
          color: rgb(148 163 184);
          font-style: normal;
          left: 0.75rem;
        }

        .quill-details-editor .ql-toolbar {
          border: 1px solid rgb(226 232 240);
          border-bottom: none;
          border-radius: 0.75rem 0.75rem 0 0;
          background-color: rgb(248 250 252);
        }

        .quill-details-editor .ql-toolbar button {
          color: rgb(100 116 139);
        }

        .quill-details-editor .ql-toolbar button:hover,
        .quill-details-editor .ql-toolbar button.ql-active {
          color: rgb(79 70 229);
        }

        .quill-details-editor {
          border-radius: 0.75rem;
          overflow: hidden;
          border: 1px solid rgb(226 232 240);
          focus-within: ring(2) ring-indigo-200);
        }

        .quill-details-editor .ql-editor {
          border-radius: 0 0 0.75rem 0.75rem;
        }
      `}</style>
    </div>
  );
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function ComptesRendusPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [activeOperationId, setActiveOperationId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelMode, setMobilePanelMode] = useState<"view" | "create" | null>(null);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showOperatorSelect, setShowOperatorSelect] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [teammates, setTeammates] = useState<TeamMember[]>([]);
  const [accessiblePatients, setAccessiblePatients] = useState<Patient[]>([]);
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null);
  const [templateRefreshTrigger, setTemplateRefreshTrigger] = useState(0);

  // Load comptes-rendus from API on mount
  useEffect(() => {
    const loadOperations = async () => {
      try {
        setIsLoading(true);
        const result = await getComptesRendus();
        if (result.success && result.data) {
          const convertedOps = result.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            date: item.date,
            duration: item.duration,
            operators: item.operators,
            details: item.details,
            postNotes: item.postNotes,
            patient: item.patient,
            patientName: item.patientName,
            patientAge: item.patientAge,
            patientHistory: item.patientHistory,
            createdAt: item.createdAt,
            createdBy: "Vous",
          }));
          setOperations(convertedOps);
          if (convertedOps.length > 0) {
            setActiveOperationId(convertedOps[0].id);
          }
        } else {
          console.error("Failed to load comptes-rendus:", result.error);
        }
      } catch (error) {
        console.error("Error loading comptes-rendus:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadOperations();
  }, []);

  // Load current user information
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const user = result.data;
            const firstName = user.firstName?.trim() || "";
            const lastName = user.lastName?.trim() || "";
            const username = user.username?.trim() || "";
            const userName = (firstName && lastName) ? `${firstName} ${lastName}` : username;

            setCurrentUser({
              id: String(user.id),
              name: userName,
              role: user.specialty || "Équipe médicale",
            });
          }
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    if (session?.user?.email) {
      loadCurrentUser();
    }
  }, [session?.user?.email]);

  // Load teammates from teams API
  useEffect(() => {
    const loadTeammates = async () => {
      try {
        const response = await fetch("/api/teams", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (result.success && result.data) {
          // Collect all teammates from all user's teams
          const allTeammates = new Set<string>();
          const teammateMaps = new Map<string, TeamMember>();

          result.data.forEach((team: any) => {
            if (team.members && Array.isArray(team.members)) {
              team.members.forEach((member: any) => {
                const firstName = member.firstName?.trim() || "";
                const lastName = member.lastName?.trim() || "";
                const username = member.username?.trim() || "";
                const teammateName = (firstName && lastName) ? `${firstName} ${lastName}` : username;
                const id = String(member.id);

                if (teammateName && !allTeammates.has(id)) {
                  allTeammates.add(id);
                  teammateMaps.set(id, {
                    id,
                    name: teammateName,
                    role: member.specialty || "Équipe médicale",
                  });
                }
              });
            }
          });

          setTeammates(Array.from(teammateMaps.values()));
        } else {
          // Fallback to empty teammates if API fails
          setTeammates([]);
        }
      } catch (error) {
        console.error("Error loading teammates:", error);
        setTeammates([]);
      }
    };

    loadTeammates();
  }, []);

  // Load patients that user has access to
  useEffect(() => {
    const loadAccessiblePatients = async () => {
      try {
        const response = await fetch("/api/patients", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          setAccessiblePatients(result.data);
        } else {
          setAccessiblePatients([]);
        }
      } catch (error) {
        console.error("Error loading patients:", error);
        setAccessiblePatients([]);
      }
    };

    loadAccessiblePatients();
  }, []);

  const [createForm, setCreateForm] = useState({
    title: "",
    type: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    operators: [] as Operator[],
    patient: null as Patient | null,
    patientSource: null as "db" | "new" | null,
    patientName: "",
    patientAge: "",
    patientHistory: "",
    details: "",
    postNotes: "",
  });

  // Helper to get current user as an operator
  const getCurrentUserOperator = (): Operator | null => {
    // First, use the fetched current user if available (has real database ID)
    if (currentUser) {
      return currentUser;
    }

    if (!session?.user) return null;

    // Fallback to session user
    const user = session.user as any;
    return {
      id: String(user.id || `user-${Date.now()}`),
      name: `${user.firstName || user.name || ""}`.trim() || user.username || "Vous",
      role: user.specialty || "Équipe médicale",
    };
  };

  // Add current user to surgical team when current user is loaded
  useEffect(() => {
    if (currentUser && createForm.operators.length === 0) {
      setCreateForm((prev) => ({
        ...prev,
        operators: [currentUser],
      }));
    }
  }, [currentUser?.id]);

  const userOperations = useMemo(() => {
    return operations.filter((op) => op.createdBy === "Vous");
  }, [operations]);

  const filteredOperations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return userOperations.filter((op) => {
      return (
        !query ||
        op.title.toLowerCase().includes(query) ||
        op.type.toLowerCase().includes(query) ||
        op.details.toLowerCase().includes(query) ||
        op.patient?.fullName.toLowerCase().includes(query) ||
        op.patientName?.toLowerCase().includes(query) ||
        op.operators.some((o) => o.name.toLowerCase().includes(query))
      );
    });
  }, [userOperations, searchTerm]);

  const parsedOperations = useMemo(() => {
    return operations.map((op) => ({
      id: op.id,
      title: op.title,
      date: op.date,
      type: op.type,
      duration: op.duration,
      operators: op.operators,
      details: op.details,
      postNotes: op.postNotes,
      patient: op.patient,
      patientName: op.patientName,
      patientAge: op.patientAge,
      patientHistory: op.patientHistory,
      createdAt: op.createdAt,
      createdBy: op.createdBy,
    } as DocumentItem));
  }, [operations]);

  const parsedFilteredOperations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return parsedOperations
      .filter((op) => op.createdBy === "Vous")
      .filter((op) => {
        return (
          !query ||
          op.title.toLowerCase().includes(query) ||
          ((op as any).type && (op as any).type.toLowerCase().includes(query)) ||
          ((op as any).details && (op as any).details.toLowerCase().includes(query)) ||
          (op.patient?.fullName && op.patient.fullName.toLowerCase().includes(query)) ||
          ((op as any).patientName && (op as any).patientName.toLowerCase().includes(query)) ||
          ((op as any).operators && (op as any).operators.some((o: any) => o.name.toLowerCase().includes(query)))
        );
      });
  }, [parsedOperations, searchTerm]);

  useEffect(() => {
    if (!isCreateMode && !activeOperationId && parsedFilteredOperations.length > 0) {
      setActiveOperationId(parsedFilteredOperations[0].id);
    }
  }, [activeOperationId, parsedFilteredOperations, isCreateMode]);

  const activeOperation = useMemo(() => {
    if (!activeOperationId) {
      return null;
    }
    return parsedOperations.find((op) => op.id === activeOperationId) as Operation | null ?? null;
  }, [activeOperationId, parsedOperations]);

  const closeMobilePanel = () => {
    setIsMobilePanelOpen(false);
    setMobilePanelMode(null);
  };

  const openMobilePanel = (mode: "view" | "create") => {
    setMobilePanelMode(mode);
    setIsMobilePanelOpen(true);
  };

  const handleSelectOperation = (operationId: string) => {
    setActiveOperationId(operationId);
    setIsCreateMode(false);
    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("view");
    }
  };

  const handleOpenCreate = () => {
    setIsCreateMode(true);
    setActiveOperationId(null);
    setCreateForm({
      title: "",
      type: "",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      operators: currentUser ? [currentUser] : [],
      patient: null,
      patientSource: null,
      patientName: "",
      patientAge: "",
      patientHistory: "",
      details: "",
      postNotes: "",
    });
    setShowOperatorSelect(false);

    if (typeof window !== "undefined" && window.innerWidth < 1280) {
      openMobilePanel("create");
    }
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
    closeMobilePanel();
  };

  const handleAddOperator = (member: TeamMember) => {
    const alreadyAdded = createForm.operators.some((op) => op.id === member.id);
    if (!alreadyAdded) {
      setCreateForm((prev) => ({
        ...prev,
        operators: [
          ...prev.operators,
          { id: member.id, name: member.name, role: member.role },
        ],
      }));
    }
    setShowOperatorSelect(false);
  };

  const handleRemoveOperator = (id: string) => {
    // Prevent removing the current user from the surgical team
    const currentUser = getCurrentUserOperator();
    if (currentUser && id === currentUser.id) {
      return;
    }
    setCreateForm((prev) => ({
      ...prev,
      operators: prev.operators.filter((op) => op.id !== id),
    }));
  };

  // Helper function to convert markdown to HTML for Quill editor
  const markdownToHtml = (markdown: string): string => {
    if (!markdown) return "";

    let html = markdown;

    // Convert headings (must be done in order from # to ### to avoid conflicts)
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Convert italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Convert unordered lists
    html = html.replace(/^\s*[-•]\s+(.*?)$/gm, '<li>$1</li>');

    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*?<\/li>)/s, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, ''); // Remove duplicate ul tags

    // Convert paragraphs (wrap text that's not already in a tag)
    const lines = html.split('\n');
    html = lines.map(line => {
      line = line.trim();
      if (!line) return '<br>';
      if (line.match(/^<[^>]+>/)) return line; // Already a tag
      return `<p>${line}</p>`;
    }).join('');

    return html;
  };

  const handleSelectTemplate = (template: any) => {
    setCreateForm((prev) => ({
      ...prev,
      title: template.title,
      details: markdownToHtml(template.details),
      postNotes: template.recommendationsPostop || "",
    }));
  };

  const handleSelectPatient = (patient: Patient) => {
    setCreateForm((prev) => ({
      ...prev,
      patient,
      patientSource: "db",
      patientName: "",
      patientAge: "",
      patientHistory: "",
    }));
    setShowPatientModal(false);
  };

  const handleCreateNewPatient = (formData: Record<string, string>) => {
    if (!formData.fullName?.trim()) {
      return;
    }

    setCreateForm((prev) => ({
      ...prev,
      patientSource: "new",
      patientName: formData.fullName.trim(),
      patientAge: formData.age?.trim() || "",
      patientHistory: formData.histoire?.trim() || "",
      patient: null,
    }));
    setShowPatientModal(false);
  };

  // Helper function to check if Quill editor has actual content (not just HTML tags)
  const hasQuillContent = (html: string): boolean => {
    if (!html) return false;
    // Remove HTML tags and check if there's actual text content
    const text = html.replace(/<[^>]*>/g, "").trim();
    return text.length > 0;
  };

  const handleCreateOperation = async () => {
    if (
      !createForm.title ||
      !createForm.type ||
      !createForm.date ||
      !createForm.duration ||
      !hasQuillContent(createForm.details) ||
      !hasQuillContent(createForm.postNotes) ||
      !createForm.patientSource
    ) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare API data based on patient source
      const apiData = {
        title: createForm.title,
        type: createForm.type,
        date: createForm.date,
        duration: parseInt(createForm.duration),
        details: createForm.details,
        postNotes: createForm.postNotes,
      };

      if (createForm.patientSource === "db" && createForm.patient) {
        // Use existing patient from DB
        Object.assign(apiData, {
          patientId: createForm.patient.id,
          patientName: '',
          patientAge: '',
          patientHistory: '',
        });
      } else {
        // Use new patient data
        Object.assign(apiData, {
          patientId: '',
          patientName: createForm.patientName,
          patientAge: createForm.patientAge,
          patientHistory: createForm.patientHistory,
        });
      }

      // Prepare operator IDs (all operators including the current user)
      const operatorIds = createForm.operators.map((op) => parseInt(op.id) || op.id);

      console.log("===== SUBMITTING FORM DEBUG =====");
      console.log("createForm.operators:", createForm.operators);
      console.log("operatorIds about to send:", operatorIds);
      console.log("operatorIds types:", operatorIds.map((id) => typeof id));
      console.log("=================================");

      // Prepare participant IDs (residents added to the surgical team, excluding current user)
      const currentUserOp = getCurrentUserOperator();
      const participantIds = createForm.operators
        .filter((op) => !currentUserOp || op.id !== currentUserOp.id)
        .map((op) => parseInt(op.id) || op.id);

      const result = await createCompteRendu({
        ...apiData,
        operatorIds,
        participantIds,
      } as any);

      if (result.success && result.data) {
        // Convert the response data to match our Operation type
        const newOperation: Operation = {
          id: result.data.id,
          title: result.data.title,
          type: result.data.type,
          date: result.data.date,
          duration: result.data.duration,
          operators: result.data.operators,
          participants: result.data.participants,
          details: result.data.details,
          postNotes: result.data.postNotes,
          patient: result.data.patient,
          patientName: result.data.patientName,
          patientAge: result.data.patientAge,
          patientHistory: result.data.patientHistory,
          createdAt: result.data.createdAt,
          createdBy: "Vous",
        };

        console.log("===== NEW OPERATION DEBUG =====");
        console.log("newOperation.operators:", newOperation.operators);
        console.log("newOperation.participants:", newOperation.participants);
        console.log("================================");

        setOperations((prev) => [newOperation, ...prev]);
        setIsCreateMode(false);
        closeMobilePanel();
        setActiveOperationId(newOperation.id);

        // Reset form with current user as operator
        const currentUserForReset = getCurrentUserOperator();
        setCreateForm({
          title: "",
          type: "",
          date: new Date().toISOString().split("T")[0],
          duration: "",
          operators: currentUserForReset ? [currentUserForReset] : [],
          patient: null,
          patientSource: null,
          patientName: "",
          patientAge: "",
          patientHistory: "",
          details: "",
          postNotes: "",
        });
      } else {
        console.error("Failed to create compte-rendu:", result.error);
      }
    } catch (error) {
      console.error("Error creating compte-rendu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOperation = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      const result = await deleteCompteRendu(deleteTargetId);
      if (result.success) {
        // Remove from list
        setOperations((prev) => prev.filter((op) => op.id !== deleteTargetId));
        // Clear selection if it was the active item
        if (activeOperationId === deleteTargetId) {
          setActiveOperationId(null);
          setIsCreateMode(false);
        }
        // Close dialog
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      } else {
        console.error("Failed to delete rapport:", result.error);
      }
    } catch (error) {
      console.error("Error deleting rapport:", error);
    } finally {
      setIsDeleting(false);
      setOpenMenuId(null);
    }
  };

  const handleExportPDF = async () => {
    if (!activeOperation) return;

    try {
      const patientName = activeOperation.patient?.fullName || activeOperation.patientName || "N/A";
      const patientDateOfBirth = activeOperation.patient?.dateOfBirth || null;
      const patientAge = activeOperation.patient?.age || activeOperation.patientAge;

      const pdfDocument = (
        <CompteRenduPDF
          title={activeOperation.title}
          type={activeOperation.type}
          date={activeOperation.date}
          formattedDate={formatDate(activeOperation.date)}
          patientName={patientName}
          patientAge={patientAge}
          patientDateOfBirth={patientDateOfBirth}
          duration={String(activeOperation.duration || "0")}
          createdBy={currentUser?.name || activeOperation.createdBy}
          operators={activeOperation.operators}
          details={activeOperation.details || "N/A"}
          postNotes={activeOperation.postNotes || "N/A"}
        />
      );

      const filename = `compte-rendu-${activeOperation.title.replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.pdf`;

      try {
        const blob = await pdf(pdfDocument).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error generating PDF blob:", error);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const availableOperators = teammates.filter(
    (member) => !createForm.operators.some((op) => op.id === member.id)
  );

  const isFormValid =
    createForm.type &&
    createForm.title &&
    createForm.date &&
    createForm.duration &&
    hasQuillContent(createForm.details) &&
    hasQuillContent(createForm.postNotes) &&
    createForm.patientSource;

  const createFormContent = (
    <div className="flex h-full gap-0 bg-white">
      {/* Templates Sidebar */}
      <CRTemplatesSidebar
        onSelectTemplate={handleSelectTemplate}
        onOpenCreateTemplate={() => setShowCreateTemplateModal(true)}
        refreshTrigger={templateRefreshTrigger}
      />

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-4 max-w-2xl">
          {/* Title */}
          <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.title")}
        </label>
        <input
          type="text"
          value={createForm.title}
          onChange={(e) =>
            setCreateForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder={t("reports.forms.titlePlaceholder")}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.type")}
        </label>
        <select
          value={createForm.type}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, type: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <option value="">{t("reports.forms.selectType")}</option>
          {operationTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.date")}
        </label>
        <input
          type="date"
          value={createForm.date}
          onChange={(event) =>
            setCreateForm((prev) => ({ ...prev, date: event.target.value }))
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.duration")}
        </label>
        <input
          type="number"
          value={createForm.duration}
          onChange={(event) =>
            setCreateForm((prev) => ({
              ...prev,
              duration: event.target.value,
            }))
          }
          placeholder="120"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {/* Patient Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.patient")}
        </label>

        {!createForm.patientSource ? (
          // Show patient selection button
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPatientModal(true)}
            className="w-full justify-center"
          >
            <User className="mr-2 h-4 w-4" />
            {t("reports.buttons.selectPatient")}
          </Button>
        ) : createForm.patientSource === "db" ? (
          // Show selected patient from DB
          <div className="space-y-2">
            <input
              type="text"
              value={createForm.patient ? `${createForm.patient.fullName} (${(createForm.patient as any).pid || createForm.patient.id})` : ""}
              readOnly
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            />
            <input
              type="hidden"
              value={createForm.patient?.id || ""}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setCreateForm((prev) => ({
                  ...prev,
                  patientSource: null,
                  patient: null,
                }))
              }
              className="w-full text-sm"
            >
              {t("reports.buttons.changePatient")}
            </Button>
          </div>
        ) : (
          // Show new patient fields
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("reports.forms.patientName")}
              </label>
              <input
                type="text"
                value={createForm.patientName}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientName: e.target.value }))
                }
                placeholder={t("reports.forms.patientNamePlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("reports.forms.patientAge")}
              </label>
              <input
                type="number"
                min="0"
                max="150"
                value={createForm.patientAge}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientAge: e.target.value }))
                }
                placeholder={t("reports.forms.patientAgePlaceholder")}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("reports.forms.patientHistory")}
              </label>
              <textarea
                value={createForm.patientHistory}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, patientHistory: e.target.value }))
                }
                placeholder={t("reports.forms.patientHistoryPlaceholder")}
                rows={2}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 mt-1"
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setCreateForm((prev) => ({
                  ...prev,
                  patientSource: null,
                  patientName: "",
                  patientAge: "",
                  patientHistory: "",
                }))
              }
              className="w-full text-sm"
            >
              {t("reports.buttons.selectAnotherPatient")}
            </Button>
          </div>
        )}
      </div>

      {/* Operators */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.surgicalTeam")}
          <span className="text-slate-400 font-normal ml-1">(optionnel)</span>
        </label>

        {createForm.operators.length === 0 ? (
          // Empty state when no operators added
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-2 bg-slate-200 rounded-lg">
                <Plus className="h-5 w-5 text-slate-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">
                {t("reports.surgical_team.empty_title")}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {t("reports.surgical_team.empty_description")}
              </p>
            </div>
            {availableOperators.length > 0 ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowOperatorSelect(!showOperatorSelect)}
                className="w-full"
              >
                <Plus className="h-3 w-3 mr-2" />
                {t("reports.buttons.add")}
              </Button>
            ) : (
              <p className="text-xs text-slate-500 italic">
                {t("reports.surgical_team.no_teammates")}
              </p>
            )}
          </div>
        ) : (
          // Show added operators
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {createForm.operators.map((operator) => {
                const currentUser = getCurrentUserOperator();
                const isCurrentUser = !!(currentUser && operator.id === currentUser.id);
                return (
                  <Badge
                    key={operator.id}
                    variant="muted"
                    className="rounded-full pl-3 pr-1.5 py-1"
                  >
                    {operator.name}
                    {isCurrentUser && <span className="ml-1 text-xs text-slate-400">(Vous)</span>}
                    <button
                      onClick={() => handleRemoveOperator(operator.id)}
                      disabled={isCurrentUser}
                      className="ml-1.5 hover:text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title={isCurrentUser ? "Vous ne pouvez pas vous retirer de l'équipe" : undefined}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowOperatorSelect(!showOperatorSelect)}
              className="w-full"
            >
              <Plus className="h-3 w-3 mr-2" />
              {t("reports.buttons.add")}
            </Button>
          </div>
        )}

        {showOperatorSelect && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 max-h-40 overflow-y-auto">
            {availableOperators.length === 0 ? (
              <p className="text-xs text-slate-500 py-2 text-center">
                {t("reports.forms.allOperatorsAdded")}
              </p>
            ) : (
              availableOperators.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleAddOperator(member)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition text-sm"
                >
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.role}</p>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.details")}
        </label>
        <div className="h-80 border border-slate-300 rounded-lg overflow-y-auto">
          <QuillEditor
            value={createForm.details}
            onChange={(value) =>
              setCreateForm((prev) => ({ ...prev, details: value }))
            }
          />
        </div>
      </div>

      {/* Post Notes */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {t("reports.forms.postOpRecommendations")}
        </label>
        <textarea
          value={createForm.postNotes}
          onChange={(event) =>
            setCreateForm((prev) => ({
              ...prev,
              postNotes: event.target.value,
            }))
          }
          rows={6}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder={t("reports.forms.postOpPlaceholder")}
        />
      </div>
        </div>
      </div>
    </div>
  );

  // Debug logging for active operation
  useEffect(() => {
    if (activeOperation) {
      console.log("===== ACTIVE OPERATION DEBUG =====");
      console.log("activeOperation.operators:", activeOperation.operators);
      console.log("activeOperation.operators length:", activeOperation.operators?.length);
      console.log("===================================");
    }
  }, [activeOperation?.id]);

  const detailViewContent = activeOperation ? (
    <>
      {/* Header with Type/Surgeon and Date */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Chirurgien principal
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {activeOperation.createdBy}
          </p>
        </div>
        <div className="text-center flex-1">
          <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
            Date
          </p>
          <p className="text-sm font-bold text-slate-900 mt-1">
            {formatDate(activeOperation.date)}
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 transition-colors whitespace-nowrap"
          title="Exporter en PDF"
        >
          <Download className="h-4 w-4 text-slate-700" />
          <span className="text-sm font-medium text-slate-700">PDF</span>
        </button>
      </div>

      {/* Title and Type */}
      <div>
        <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold mb-1">
          {activeOperation.type}
        </p>
        <h2 className="text-2xl font-bold text-slate-900">
          {activeOperation.title}
        </h2>
      </div>

      {/* Patient Info */}
      {(activeOperation.patient || activeOperation.patientName) && (
        <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm">
          <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
            <User className="h-4 w-4" />
            Patient
          </header>
          <div className="space-y-3">
            {/* Patient from DB */}
            {activeOperation.patient && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                    {t("reports.sections.patientName")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeOperation.patient.fullName}
                  </p>
                </div>
                {(activeOperation.patient as any).age && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      {t("reports.sections.patientAge")}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {(activeOperation.patient as any).age} ans
                    </p>
                  </div>
                )}
                {(activeOperation.patient as any).histoire && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      {t("reports.sections.patientHistory")}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {(activeOperation.patient as any).histoire}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Inline Patient Data */}
            {!activeOperation.patient && activeOperation.patientName && (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                    {t("reports.sections.patientName")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {activeOperation.patientName}
                  </p>
                </div>
                {activeOperation.patientAge && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      {t("reports.sections.patientAge")}
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {activeOperation.patientAge} ans
                    </p>
                  </div>
                )}
                {activeOperation.patientHistory && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-indigo-500 font-semibold mb-1">
                      {t("reports.sections.patientHistory")}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {activeOperation.patientHistory}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Operation Info */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Calendar className="h-4 w-4" />
          {t("reports.sections.operativeInfo")}
        </header>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("reports.sections.duration")}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeOperation.duration} {t("reports.units.minutes")}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {t("reports.sections.team")}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {activeOperation.operators.length} {t("reports.units.people")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t("reports.sections.surgicalTeam")} ({activeOperation.operators.length})
        </header>
        <div className="flex flex-wrap gap-2">
          {activeOperation.operators.map((operator) => (
            <div
              key={operator.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
            >
              <div className="h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                {operator.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900">{operator.name}</p>
                <p className="text-xs text-slate-500">{operator.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Participants - Residents/Staff */}
      {activeOperation.participants && activeOperation.participants.length > 0 && (
        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t("reports.sections.participants")} ({activeOperation.participants.length})
          </header>
          <div className="flex flex-wrap gap-2">
            {activeOperation.participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm"
              >
                <div className="h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                  {participant.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{participant.name}</p>
                  <p className="text-xs text-slate-500">{participant.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Details */}
      <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {t("reports.sections.interventionDetails")}
        </header>
        <div className="text-sm leading-relaxed text-slate-700 quill-details-view">
          <div dangerouslySetInnerHTML={{ __html: activeOperation.details }} />
        </div>
      </section>

      {/* Post Notes */}
      <section className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm flex-1">
        <header className="mb-3 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {t("reports.sections.postOpRecommendations")}
        </header>
        <div className="text-sm leading-relaxed text-slate-700 quill-details-view">
          <div dangerouslySetInnerHTML={{ __html: activeOperation.postNotes }} />
        </div>
      </section>
    </>
  ) : null;

  const renderListItemContent = (item: DocumentItem) => {
    const operation = item as Operation;
    return (
      <>
        <div className="flex flex-wrap items-start justify-between gap-3 relative">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-semibold text-slate-800">
              {operation.title}
            </p>
            <p className="text-xs text-slate-500">
              {(operation as any).type} • {t("reports.sections.createdBy")} {operation.createdBy}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              {formatDate(operation.date)}
            </span>
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === operation.id ? null : operation.id);
                }}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              {openMenuId === operation.id && (
                <div className="absolute right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(operation.id);
                      setShowDeleteConfirm(true);
                      setOpenMenuId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-t-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("reports.buttons.delete")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {(operation.patient || (operation as any).patientName) && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <p className="font-semibold text-slate-700 text-xs">
              {operation.patient?.fullName || (operation as any).patientName}
            </p>
          </div>
        )}
        <div className="mt-3 space-y-1 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">
            {(operation as any).duration}{t("reports.units.minutes").charAt(0).toLowerCase()} • {(operation as any).operators.length} {t("reports.units.operators")}
          </p>
          <p className="text-xs text-slate-500 line-clamp-1">
            {(operation as any).operators.map((o: any) => o.name).join(", ")}
          </p>
        </div>
      </>
    );
  };

  return (
    <>
    <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between my-2">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{t("reports.title")}</h1>
          <p className="text-sm text-slate-500">
            {t("reports.subtitle")}
          </p>
        </div>
        <Button
          variant="primary"
          className="w-full sm:w-auto hidden xl:flex"
          onClick={handleOpenCreate}
        >
          <FilePlus className="mr-2 h-4 w-4" />
          {t("reports.buttons.new")}
        </Button>
      </section>
      <DataListLayout
        items={parsedOperations}
        filteredItems={parsedFilteredOperations}
        activeItemId={activeOperationId}
        isCreateMode={isCreateMode}
        isMobilePanelOpen={isMobilePanelOpen}
        mobilePanelMode={mobilePanelMode}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSelectItem={(item: DocumentItem) => handleSelectOperation(item.id)}
        onOpenCreate={handleOpenCreate}
        onCancelCreate={handleCancelCreate}
        onCloseMobilePanel={closeMobilePanel}
        title={t("reports.title")}
        renderListItemContent={renderListItemContent}
        renderDetailViewContent={activeOperation ? () => detailViewContent : () => null}
        createFormContent={createFormContent}
        emptyIcon={Stethoscope}
        emptyTitle={t("reports.empty.title")}
        emptyDescription={t("reports.empty.description")}
        searchPlaceholder={t("reports.searchPlaceholder")}
        isSubmitting={isSubmitting}
        createTitle={t("reports.modals.createTitle")}
        createDescription={t("reports.modals.createDescription")}
        saveButtonText={t("reports.buttons.save")}
        isFormValid={isFormValid as boolean}
        isLoading={isLoading}
        onSave={handleCreateOperation}
      />

      <PatientModal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        patients={accessiblePatients}
        onSelectPatient={handleSelectPatient}
        newPatientFields={["fullName", "age","histoire"]}
        onCreatePatient={handleCreateNewPatient}
      />

      <CreateCRTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        onSuccess={() => {
          setTemplateRefreshTrigger((prev) => prev + 1);
        }}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Supprimer le compte rendu</h2>
            </div>
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer ce compte rendu? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTargetId(null);
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteOperation}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Suppression...
                  </>
                ) : (
                  "Supprimer"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .quill-details-view {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }

        .quill-details-view h1 {
          font-size: 2em;
          font-weight: 700;
          margin: 0.67em 0;
        }

        .quill-details-view h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 0.75em 0;
        }

        .quill-details-view h3 {
          font-size: 1.17em;
          font-weight: 700;
          margin: 0.83em 0;
        }

        .quill-details-view p {
          margin: 0.5em 0;
        }

        .quill-details-view strong,
        .quill-details-view b {
          font-weight: 700;
        }

        .quill-details-view em,
        .quill-details-view i {
          font-style: italic;
        }

        .quill-details-view u {
          text-decoration: underline;
        }

        .quill-details-view ul,
        .quill-details-view ol {
          margin: 0.5em 0;
          padding-left: 1.5em;
        }

        .quill-details-view ul {
          list-style-type: disc;
        }

        .quill-details-view ol {
          list-style-type: decimal;
        }

        .quill-details-view li {
          margin: 0.25em 0;
        }

        .quill-details-view blockquote {
          border-left: 4px solid #e2e8f0;
          margin: 0.5em 0;
          padding-left: 1em;
          color: #64748b;
        }

        .quill-details-view a {
          color: #4f46e5;
          text-decoration: underline;
        }

        .quill-details-view a:hover {
          color: #4338ca;
        }
      `}</style>
    </>
  );
}
