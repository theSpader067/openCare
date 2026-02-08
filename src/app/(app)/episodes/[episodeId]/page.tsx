"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, Loader, Plus, X, Trash2, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type Episode = {
  id: string;
  entryAt: string;
  exitAt?: string;
  motif: string;
  status: "ACTIVE" | "CLOSED";
  fullname: string;
  sex?: string;
  age?: number;
  origin?: string;
  patientId?: number;
  atcds?: string;
  clinique?: string;
  paraclinique?: string;
  createdAt: string;
  updatedAt: string;
};

type Patient = {
  id: number;
  fullName: string;
  dateOfBirth?: string;
  age?: number;
  service?: string;
};

type BlockType = "ACTION" | "CONDITION" | "WAIT";

type BlockTask = {
  id: string;
  text: string;
  completed: boolean;
};

type BlockOption = {
  id: string;
  resultat: string;
  decision: string;
};

type Block = {
  id: string;
  type: BlockType;
  tasks?: BlockTask[]; // For ACTION
  condition?: string; // For CONDITION
  options?: BlockOption[]; // For CONDITION
  duration?: number; // For WAIT (in minutes)
  blockDepth?: number;
  parentBlockIds?: string[];
  childBlockIds?: string[];
};

export default function EpisodeDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const episodeId = params.episodeId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [newBlock, setNewBlock] = useState<Block | null>(null);
  const [catId, setCatId] = useState<string | null>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [editForm, setEditForm] = useState({
    motif: "",
    fullname: "",
    age: "",
    origin: "",
    sex: "",
    status: "ACTIVE" as "ACTIVE" | "CLOSED",
    atcds: "",
    clinique: "",
    paraclinique: "",
  });

  // Load episode data and CAT blocks
  useEffect(() => {
    const loadEpisode = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/episodes?id=${episodeId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        const result = await response.json();

        if (result.success) {
          const episodeData = result.data;
          setEpisode(episodeData);
          setEditForm({
            motif: episodeData.motif,
            fullname: episodeData.fullname,
            age: episodeData.age ? String(episodeData.age) : "",
            origin: episodeData.origin || "",
            sex: episodeData.sex || "",
            status: episodeData.status,
            atcds: episodeData.atcds || "",
            clinique: episodeData.clinique || "",
            paraclinique: episodeData.paraclinique || "",
          });

          // Load patient if linked
          if (episodeData.patientId) {
            const patientResponse = await fetch(
              `/api/patients/${episodeData.patientId}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            const patientResult = await patientResponse.json();
            if (patientResult.success) {
              setPatient(patientResult.data);
            }
          }

          // Create or fetch CAT
          const catCreateResponse = await fetch("/api/cat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operation: "createCAT",
              episodeId,
              title: `CAT for ${episodeData.motif}`,
            }),
          });
          const catCreateResult = await catCreateResponse.json();
          if (catCreateResult.success) {
            const cat = catCreateResult.data;
            setCatId(cat.id);

            // Fetch CAT with blocks
            const catFetchResponse = await fetch(
              `/api/cat?id=${cat.id}`,
              {
                method: "GET",
                headers: { "Content-Type": "application/json" },
              }
            );
            const catFetchResult = await catFetchResponse.json();
            if (catFetchResult.success && catFetchResult.data.blocks) {
              // Convert loaded blocks back to frontend format
              const loadedBlocks = catFetchResult.data.blocks.map(
                (block: any) => {
                  const blockData: Block = {
                    id: block.id,
                    type: block.type,
                    parentBlockIds: block.parentBlockIds,
                    childBlockIds: block.childBlockIds,
                  };
                  const parsed = JSON.parse(block.content || "{}");
                  if (block.type === "ACTION") {
                    blockData.tasks = parsed.tasks || [];
                  } else if (block.type === "CONDITION") {
                    blockData.condition = parsed.condition || "";
                    blockData.options = parsed.options || [];
                  } else if (block.type === "WAIT") {
                    blockData.duration = parsed.duration || 0;
                  }
                  return blockData;
                }
              );
              setBlocks(loadedBlocks);
              // Initialize newBlock with default ACTION type
              setNewBlock({
                id: `block-${Date.now()}`,
                type: "ACTION",
                tasks: [],
                options: [
                  { id: `option-${Date.now()}`, resultat: "", decision: "" },
                  { id: `option-${Date.now()}-2`, resultat: "", decision: "" },
                ],
              });
            }
          }
        } else {
          console.error("Failed to load episode");
        }
      } catch (error) {
        console.error("Error loading episode:", error);
      } finally {
        setLoading(false);
      }
    };

    if (episodeId) {
      loadEpisode();
    }
  }, [episodeId]);

  // Timer effect for WAIT blocks
  useEffect(() => {
    if (!isRunning || !isTimerRunning || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          // Auto-advance to next block when timer finishes
          if (currentBlockIndex + 1 < blocks.length) {
            setCurrentBlockIndex(currentBlockIndex + 1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isTimerRunning, timerSeconds, currentBlockIndex, blocks.length]);

  // Build tree structure from blocks
  const buildBlockTree = (): { block: Block; depth: number }[] => {
    const tree: { block: Block; depth: number }[] = [];
    const visited = new Set<string>();

    const addToTree = (blockId: string, depth: number) => {
      if (visited.has(blockId)) return;
      visited.add(blockId);

      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      tree.push({ block, depth });

      // Add children
      if (block.childBlockIds && block.childBlockIds.length > 0) {
        block.childBlockIds.forEach((childId) => {
          addToTree(childId, depth + 1);
        });
      }
    };

    // Start with root blocks (blocks with no parents)
    blocks.forEach((block) => {
      if (!block.parentBlockIds || block.parentBlockIds.length === 0) {
        addToTree(block.id, 0);
      }
    });

    return tree;
  };

  const addNewBlock = (type: BlockType) => {
    setNewBlock({
      id: `block-${Date.now()}`,
      type,
      tasks: type === "ACTION" ? [] : undefined,
      condition: type === "CONDITION" ? "" : undefined,
      options: type === "CONDITION" ? [
        { id: `option-${Date.now()}`, resultat: "", decision: "" },
        { id: `option-${Date.now()}-2`, resultat: "", decision: "" },
      ] : undefined,
      duration: type === "WAIT" ? undefined : undefined,
    });
  };

  const addTaskToBlock = () => {
    if (!newBlock) return;
    if (newBlock.type !== "ACTION") return;
    const newTask: BlockTask = {
      id: `task-${Date.now()}`,
      text: "",
      completed: false,
    };
    setNewBlock({
      ...newBlock,
      tasks: [...(newBlock.tasks || []), newTask],
    });
  };

  const updateTask = (taskId: string, text: string) => {
    if (!newBlock || newBlock.type !== "ACTION") return;
    setNewBlock({
      ...newBlock,
      tasks: (newBlock.tasks || []).map((task) =>
        task.id === taskId ? { ...task, text } : task
      ),
    });
  };

  const deleteTask = (taskId: string) => {
    if (!newBlock || newBlock.type !== "ACTION") return;
    setNewBlock({
      ...newBlock,
      tasks: (newBlock.tasks || []).filter((task) => task.id !== taskId),
    });
  };

  const addOptionToBlock = () => {
    if (!newBlock || newBlock.type !== "CONDITION") return;
    const newOption: BlockOption = {
      id: `option-${Date.now()}`,
      resultat: "",
      decision: "",
    };
    setNewBlock({
      ...newBlock,
      options: [...(newBlock.options || []), newOption],
    });
  };

  const updateOption = (optionId: string, field: "resultat" | "decision", value: string) => {
    if (!newBlock || newBlock.type !== "CONDITION") return;
    setNewBlock({
      ...newBlock,
      options: (newBlock.options || []).map((option) =>
        option.id === optionId ? { ...option, [field]: value } : option
      ),
    });
  };

  const deleteOption = (optionId: string) => {
    if (!newBlock || newBlock.type !== "CONDITION") return;
    // Don't delete if only 2 options remain
    if ((newBlock.options || []).length <= 2) return;
    setNewBlock({
      ...newBlock,
      options: (newBlock.options || []).filter((option) => option.id !== optionId),
    });
  };

  const handleBlockDrop = async (parentBlockId: string, childBlockId: string) => {
    if (parentBlockId === childBlockId) return; // Prevent self-linking

    const updatedBlocks = blocks.map((block) => {
      if (block.id === parentBlockId) {
        // Add child relationship
        return {
          ...block,
          childBlockIds: [
            ...(block.childBlockIds || []),
            childBlockId,
          ].filter((id, idx, arr) => arr.indexOf(id) === idx), // Remove duplicates
        };
      }
      if (block.id === childBlockId) {
        // Add parent relationship
        return {
          ...block,
          parentBlockIds: [
            ...(block.parentBlockIds || []),
            parentBlockId,
          ].filter((id, idx, arr) => arr.indexOf(id) === idx), // Remove duplicates
        };
      }
      return block;
    });

    setBlocks(updatedBlocks);

    // Persist relationships to database for both parent and child blocks
    const childBlock = updatedBlocks.find((b) => b.id === childBlockId);
    const parentBlock = updatedBlocks.find((b) => b.id === parentBlockId);

    if (childBlock) {
      try {
        await fetch(`/api/cat`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "updateBlockRelationships",
            blockId: childBlockId,
            blockData: {
              parentBlockIds: childBlock.parentBlockIds || [],
              childBlockIds: childBlock.childBlockIds || [],
            },
          }),
        });
      } catch (error) {
        console.error("Error updating child block relationships:", error);
      }
    }

    if (parentBlock) {
      try {
        await fetch(`/api/cat`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "updateBlockRelationships",
            blockId: parentBlockId,
            blockData: {
              parentBlockIds: parentBlock.parentBlockIds || [],
              childBlockIds: parentBlock.childBlockIds || [],
            },
          }),
        });
      } catch (error) {
        console.error("Error updating parent block relationships:", error);
      }
    }

    setDraggedBlockId(null);
  };

  const getBlockPreview = (block: Block): string => {
    if (block.type === "ACTION") {
      return block.tasks?.[0]?.text || "No tasks";
    } else if (block.type === "CONDITION") {
      return block.condition || "No condition";
    } else if (block.type === "WAIT") {
      return `${block.duration} min`;
    }
    return "";
  };

  const saveBlock = async () => {
    if (!newBlock || !catId) return;
    setSavingBlock(true);
    try {
      const isExistingBlock = !newBlock.id?.startsWith("block-");

      if (isExistingBlock) {
        // Update existing block
        const blockDataPayload: any = {
          type: newBlock.type,
        };

        if (newBlock.type === "ACTION") {
          blockDataPayload.taskData = { tasks: newBlock.tasks || [] };
        } else if (newBlock.type === "CONDITION") {
          blockDataPayload.conditionData = {
            condition: newBlock.condition || "",
            options: newBlock.options || [],
          };
        } else if (newBlock.type === "WAIT") {
          blockDataPayload.waitData = { duration: newBlock.duration || 0 };
        }

        const response = await fetch(`/api/cat`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "updateBlock",
            blockId: newBlock.id,
            blockData: blockDataPayload,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Update the block in the list
          setBlocks(
            blocks.map((block) =>
              block.id === newBlock.id ? newBlock : block
            )
          );
          setNewBlock(null);
          setSelectedBlockId(null);
        } else {
          console.error("Failed to update block:", result.error);
        }
      } else {
        // Create new block
        const blockDataPayload: any = {
          catId,
          type: newBlock.type,
        };

        if (newBlock.type === "ACTION") {
          blockDataPayload.taskData = { tasks: newBlock.tasks || [] };
        } else if (newBlock.type === "CONDITION") {
          blockDataPayload.conditionData = {
            condition: newBlock.condition || "",
            options: newBlock.options || [],
          };
        } else if (newBlock.type === "WAIT") {
          blockDataPayload.waitData = { duration: newBlock.duration || 0 };
        }

        const response = await fetch(`/api/cat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            operation: "createBlock",
            blockData: blockDataPayload,
          }),
        });

        const result = await response.json();

        if (result.success) {
          // Add the saved block with its database ID
          const savedBlock: Block = {
            id: result.data.id,
            type: newBlock.type,
            tasks: newBlock.tasks,
            condition: newBlock.condition,
            options: newBlock.options,
            duration: newBlock.duration,
            parentBlockIds: [],
            childBlockIds: [],
          };
          setBlocks([...blocks, savedBlock]);
          // Reset the block creation UI for the same type so user can create another block
          addNewBlock(newBlock.type);
        } else {
          console.error("Failed to create block:", result.error);
        }
      }
    } catch (error) {
      console.error("Error saving block:", error);
    } finally {
      setSavingBlock(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/episodes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: episodeId,
          ...editForm,
          age: editForm.age ? parseInt(editForm.age) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEpisode(result.data);
        setIsEditing(false);
      } else {
        console.error("Failed to save episode");
      }
    } catch (error) {
      console.error("Error saving episode:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner label={t("episodes.loading.fetchingEpisodes")} />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-slate-600">Episode not found</p>
        <Button variant="primary" onClick={() => router.push("/episodes")}>
          {t("episodes.buttons.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 lg:pb-0">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-medium">{t("episodes.buttons.back")}</span>
        </button>
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                // Reset form to original values
                setEditForm({
                  motif: episode.motif,
                  fullname: episode.fullname,
                  age: episode.age ? String(episode.age) : "",
                  origin: episode.origin || "",
                  sex: episode.sex || "",
                  status: episode.status,
                  atcds: episode.atcds || "",
                  clinique: episode.clinique || "",
                  paraclinique: episode.paraclinique || "",
                });
              }}
              disabled={saving}
            >
              {t("episodes.buttons.cancel")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {t("episodes.loading.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {t("episodes.buttons.save")}
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Episode and Patient Details */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Episode Details */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
            <CardTitle className="text-lg">{t("episodes.details.episodeTitle")}</CardTitle>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              >
                {t("episodes.buttons.edit")}
              </button>
            )}
          </CardHeader>
          <CardContent className="space-y-8 px-8 py-10">
            {isEditing ? (
              <div className="space-y-6">
                {/* Motif */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.details.motif")}
                  </label>
                  <input
                    type="text"
                    value={editForm.motif}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        motif: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.table.headers.status")}
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        status: e.target.value as "ACTIVE" | "CLOSED",
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="ACTIVE">{t("episodes.statuses.ACTIVE")}</option>
                    <option value="CLOSED">{t("episodes.statuses.CLOSED")}</option>
                  </select>
                </div>

                {/* Entry Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.form.entryDate")}
                  </label>
                  <input
                    type="text"
                    disabled
                    value={new Date(episode.entryAt).toLocaleString()}
                    className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                    {t("episodes.details.motif")}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {episode.motif}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                    {t("episodes.details.status")}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {t(`episodes.statuses.${episode.status}`)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                    {t("episodes.details.entryDateLabel")}
                  </p>
                  <p className="text-sm text-slate-700">
                    {new Date(episode.entryAt).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Details */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <CardTitle className="text-lg">{t("episodes.details.patientTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 px-8 py-10">
            {isEditing ? (
              <div className="space-y-6">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.details.fullNameLabel")}
                  </label>
                  <input
                    type="text"
                    value={editForm.fullname}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        fullname: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.details.ageLabel")}
                  </label>
                  <input
                    type="number"
                    value={editForm.age}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        age: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Origin */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.details.originLabel")}
                  </label>
                  <input
                    type="text"
                    value={editForm.origin}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        origin: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Sex */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    {t("episodes.form.sex")}
                  </label>
                  <select
                    value={editForm.sex}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        sex: e.target.value,
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  >
                    <option value="">{t("episodes.form.notSpecified")}</option>
                    <option value="M">{t("episodes.form.male")}</option>
                    <option value="F">{t("episodes.form.female")}</option>
                  </select>
                </div>

                {/* ATCDS */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    ATCDS
                  </label>
                  <textarea
                    value={editForm.atcds}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        atcds: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Examen Clinique */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    Examen Clinique
                  </label>
                  <textarea
                    value={editForm.clinique}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        clinique: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                {/* Paraclinique */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-600">
                    Paraclinique
                  </label>
                  <textarea
                    value={editForm.paraclinique}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        paraclinique: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                    {t("episodes.details.fullNameLabel")}
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {episode.fullname}
                  </p>
                </div>
                {episode.age && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                      {t("episodes.details.ageLabel")}
                    </p>
                    <p className="text-sm text-slate-700">{episode.age} {t("episodes.details.yearsOld")}</p>
                  </div>
                )}
                {episode.origin && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                      {t("episodes.details.originLabel")}
                    </p>
                    <p className="text-sm text-slate-700">{episode.origin}</p>
                  </div>
                )}
                {episode.sex && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                      {t("episodes.details.sexLabel")}
                    </p>
                    <p className="text-sm text-slate-700">{episode.sex}</p>
                  </div>
                )}
                {patient && (
                  <div className="border-t border-slate-200 pt-3 mt-2">
                    <p className="text-xs font-semibold uppercase text-slate-600 mb-2">
                      {t("episodes.details.linkedPatient")}
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {patient.fullName}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-1">ATCDS</p>
                  <p className="text-sm text-slate-700">{episode.atcds || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Examen Clinique</p>
                  <p className="text-sm text-slate-700">{episode.clinique || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-600 mb-1">Paraclinique</p>
                  <p className="text-sm text-slate-700">{episode.paraclinique || "-"}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conduite à Tenir (CAT) Section */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <CardTitle className="text-lg">{t("episodes.blocks.title")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 flex">
          {/* Left Sidebar - Block Hierarchy List */}
          <div className="w-1/3 border-r border-slate-200 overflow-y-auto max-h-96">
            {blocks.length > 0 ? (
              <div className="p-4">
                {buildBlockTree().map(({ block, depth }, index, array) => {
                  const blockIndex = blocks.indexOf(block) + 1;
                  const hasChildren = block.childBlockIds && block.childBlockIds.length > 0;
                  const isChild = block.parentBlockIds && block.parentBlockIds.length > 0;
                  const marginLeft = `${depth * 1.5}rem`;

                  // Check if next block is a direct child of this one
                  const nextBlockData = index < array.length - 1 ? array[index + 1] : null;
                  const nextIsDirectChild = nextBlockData &&
                    block.childBlockIds?.includes(nextBlockData.block.id) &&
                    nextBlockData.depth === depth + 1;

                  // Draw vertical line if blocks are not linked by L-shapes
                  const shouldDrawVerticalLine = nextBlockData && !nextIsDirectChild;

                  return (
                    <div key={block.id} style={{ marginLeft }}>
                      {/* Vertical Line - connects to next block if not linked by L-shapes */}
                      {shouldDrawVerticalLine && (
                        <div
                          className="relative"
                          style={{
                            height: "0.5rem",
                            display: "flex",
                            justifyContent: "center",
                            marginBottom: "-0.25rem",
                            zIndex: 10,
                          }}
                        >
                          <div
                            className="border-l border-slate-300"
                            style={{
                              width: "1px",
                              height: "0.5rem",
                            }}
                          />
                        </div>
                      )}

                      <div
                        draggable
                        onDragStart={() => setDraggedBlockId(block.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => {
                          if (draggedBlockId && draggedBlockId !== block.id) {
                            handleBlockDrop(block.id, draggedBlockId);
                          }
                        }}
                        onDragEnd={() => setDraggedBlockId(null)}
                        onClick={() => {
                          setSelectedBlockId(block.id);
                          setNewBlock(block);
                        }}
                        className={`cursor-move p-2 mb-2 border rounded transition-all relative ${
                          selectedBlockId === block.id
                            ? "bg-cyan-50 border-cyan-300"
                            : draggedBlockId === block.id
                            ? "bg-amber-50 border-amber-300 opacity-70"
                            : "bg-white border-slate-200"
                        }`}
                      >
                      {/* Tree line - Vertical connector from parent */}
                      {isChild && (
                        <div
                          className="absolute top-0 bottom-0 border-l border-slate-300"
                          style={{
                            left: "-0.75rem",
                            width: "1px",
                            height: "1.5rem",
                          }}
                        />
                      )}

                      {/* Tree line - Horizontal connector to this block */}
                      {isChild && (
                        <div
                          className="absolute top-6 border-t border-slate-300"
                          style={{
                            left: "-0.75rem",
                            width: "0.75rem",
                            height: "1px",
                          }}
                        />
                      )}

                      {/* Tree line - Vertical line extending down if has children */}
                      {hasChildren && (
                        <div
                          className="absolute border-l border-slate-300"
                          style={{
                            left: "calc(100% - 0.25rem)",
                            top: "1.5rem",
                            height: "2rem",
                            width: "1px",
                          }}
                        />
                      )}

                      {/* Block Header - Number and Type Badge */}
                      <div className="flex items-center gap-2 mb-1 pl-2">
                        <span className="text-xs font-bold text-slate-500">#{blockIndex}</span>
                        {block.type === "ACTION" && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-emerald-600 rounded-full">
                            ✓
                          </span>
                        )}
                        {block.type === "CONDITION" && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                            ?
                          </span>
                        )}
                        {block.type === "WAIT" && (
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-amber-600 rounded-full">
                            ⏱
                          </span>
                        )}
                      </div>

                      {/* Block Preview Text */}
                      <p className="text-xs text-slate-600 line-clamp-2 mb-1 pl-4">
                        {getBlockPreview(block)}
                      </p>

                      {/* Children Block Numbers */}
                      {hasChildren && (
                        <div className="text-xs text-slate-400 pt-1 border-t border-slate-100">
                          {block.childBlockIds!.map((childId) => {
                            const childBlock = blocks.find((b) => b.id === childId);
                            const childIndex = childBlock ? blocks.indexOf(childBlock) + 1 : "?";
                            return (
                              <span key={childId} className="inline-block mr-1">
                                → #{childIndex}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <p className="text-sm text-slate-500 mb-2">Aucun bloc</p>
                <p className="text-xs text-slate-400">
                  Créez votre premier bloc pour commencer
                </p>
              </div>
            )}
          </div>

          {/* Right Content Area - Block Editor or Running Block */}
          <div className="flex-1 px-6 py-5">
            {isRunning ? (
              // Running Mode - Show current block
              blocks.length > 0 && currentBlockIndex < blocks.length ? (
                <div className="space-y-6">
                  {/* Block Navigation */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">
                      Bloc {currentBlockIndex + 1} sur {blocks.length}
                    </span>
                    <button
                      onClick={() => setIsRunning(false)}
                      className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                    >
                      Retour à l'édition
                    </button>
                  </div>

                  {/* Current Block Display */}
                  {(() => {
                    const currentBlock = blocks[currentBlockIndex];
                    const blockIndex = currentBlockIndex + 1;

                    return (
                      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                        {/* Block Header */}
                        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
                          <span className="text-lg font-bold text-slate-400">#{blockIndex}</span>
                          {currentBlock.type === "ACTION" && (
                            <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-white bg-emerald-600 rounded-full">
                              ✓ Action
                            </span>
                          )}
                          {currentBlock.type === "CONDITION" && (
                            <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-white bg-blue-600 rounded-full">
                              ? Condition
                            </span>
                          )}
                          {currentBlock.type === "WAIT" && (
                            <span className="px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-white bg-amber-600 rounded-full">
                              ⏱ Attente
                            </span>
                          )}
                        </div>

                        {/* Block Content */}
                        <div className="space-y-4 px-4 py-3">
                          {/* ACTION Block */}
                          {currentBlock.type === "ACTION" && currentBlock.tasks && (
                            <div className="space-y-2">
                              <div className="space-y-1.5">
                                {currentBlock.tasks.map((task) => (
                                  <div key={task.id} className="flex items-start gap-2 p-2 rounded bg-emerald-50 border border-emerald-100">
                                    <input
                                      type="checkbox"
                                      checked={task.completed}
                                      onChange={(e) => {
                                        const updatedBlocks = blocks.map((b) =>
                                          b.id === currentBlock.id
                                            ? {
                                                ...b,
                                                tasks: (b.tasks || []).map((t) =>
                                                  t.id === task.id ? { ...t, completed: e.target.checked } : t
                                                ),
                                              }
                                            : b
                                        );
                                        setBlocks(updatedBlocks);

                                        // Check if all tasks are completed and auto-advance
                                        const updatedBlock = updatedBlocks[currentBlockIndex];
                                        if (updatedBlock.tasks && updatedBlock.tasks.every((t) => t.completed)) {
                                          if (currentBlockIndex + 1 < blocks.length) {
                                            setCurrentBlockIndex(currentBlockIndex + 1);
                                          }
                                        }
                                      }}
                                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 cursor-pointer mt-0.5 flex-shrink-0"
                                    />
                                    <span className={`text-xs flex-1 ${task.completed ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                      {task.text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CONDITION Block */}
                          {currentBlock.type === "CONDITION" && (
                            <div className="space-y-2">
                              <div>
                                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded p-2 leading-relaxed">
                                  {currentBlock.condition}
                                </p>
                              </div>
                              {currentBlock.options && currentBlock.options.length > 0 && (
                                <div className="space-y-1">
                                  {currentBlock.options.map((option) => (
                                    <button
                                      key={option.id}
                                      onClick={() => setCurrentBlockIndex(currentBlockIndex + 1)}
                                      className="w-full text-left flex items-start gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-100 hover:border-blue-300 hover:shadow-sm rounded px-3 py-2 transition-all"
                                    >
                                      <span className="text-blue-600 font-bold flex-shrink-0 mt-0.5">→</span>
                                      <div className="flex-1">
                                        <div className="font-medium">{option.resultat}</div>
                                        <div className="text-slate-600">{option.decision}</div>
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* WAIT Block with Timer */}
                          {currentBlock.type === "WAIT" && (
                            <div className="bg-amber-50 border border-amber-100 rounded p-3 space-y-3">
                              <div className="text-center">
                                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">Durée d'attente</p>
                                <p className="text-3xl font-bold text-amber-600 font-mono">
                                  {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:{String(timerSeconds % 60).padStart(2, "0")} <span className="text-sm">min</span>
                                </p>
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => {
                                    if (timerSeconds === 0) {
                                      setTimerSeconds(currentBlock.duration || 0);
                                    }
                                    setIsTimerRunning(!isTimerRunning);
                                  }}
                                  className="px-3 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all flex items-center gap-1"
                                >
                                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => {
                                    if (currentBlockIndex + 1 < blocks.length) {
                                      setCurrentBlockIndex(currentBlockIndex + 1);
                                    }
                                  }}
                                  className="px-3 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all flex items-center gap-1"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })()}
                </div>
              ) : null
            ) : (
              // Building Mode - Show creation UI
              (() => {
                const displayBlock = newBlock || {
                  id: `block-new`,
                  type: "ACTION" as BlockType,
                  tasks: [],
                  condition: "",
                  options: [
                    { id: `option-default-1`, resultat: "", decision: "" },
                    { id: `option-default-2`, resultat: "", decision: "" },
                  ],
                  duration: undefined,
                };

                return (
              <div className="rounded-lg border border-cyan-200 bg-white shadow-sm">
                <div className="mb-4 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    {(["ACTION", "CONDITION", "WAIT"] as BlockType[]).map(
                      (type) => (
                        <button
                          key={type}
                          onClick={() => setNewBlock({ ...displayBlock, type })}
                          className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded border ${
                            displayBlock.type === type
                              ? "bg-cyan-600 text-white border-cyan-600"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {type === "ACTION" && "Action"}
                          {type === "CONDITION" && "Condition"}
                          {type === "WAIT" && "Attente"}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setNewBlock(null)}
                    className="text-slate-400 hover:text-slate-600 p-1 transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* ACTION Block UI */}
                {displayBlock.type === "ACTION" && (
                  <div className="space-y-2 px-4 py-3">
                    <div className="space-y-1.5">
                      {displayBlock.tasks && displayBlock.tasks.length > 0 ? (
                        displayBlock.tasks.map((task) => (
                          <div key={task.id} className="group flex items-start gap-2 bg-emerald-50 p-2 rounded border border-emerald-100">
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={(e) => {
                                setNewBlock({
                                  ...displayBlock,
                                  tasks: (displayBlock.tasks || []).map((t) =>
                                    t.id === task.id
                                      ? { ...t, completed: e.target.checked }
                                      : t
                                  ),
                                });
                              }}
                              className="h-4 w-4 mt-0.5 flex-shrink-0 rounded border-slate-300 text-emerald-600 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={task.text}
                              onChange={(e) => updateTask(task.id, e.target.value)}
                              placeholder="Entrez la tâche..."
                              className="flex-1 bg-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            />
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-all"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-3 text-slate-400 text-xs">
                          Aucune tâche
                        </div>
                      )}
                    </div>
                    <button
                      onClick={addTaskToBlock}
                      className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 rounded transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter
                    </button>
                  </div>
                )}

                {/* CONDITION Block UI */}
                {displayBlock.type === "CONDITION" && (
                  <div className="space-y-5 px-6 py-4">
                    {/* Condition Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2 px-4">
                        {t("episodes.blocks.condition")}
                      </label>
                      <textarea
                        value={displayBlock.condition || ""}
                        onChange={(e) =>
                          setNewBlock({ ...displayBlock, condition: e.target.value })
                        }
                        placeholder="Décrivez la condition..."
                        rows={3}
                        className="w-full rounded border border-slate-200 bg-white px-6 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                      />
                    </div>

                    {/* Options/Outcomes */}
                    <div className="space-y-2">
                      <div className="space-y-2">
                        {displayBlock.options && displayBlock.options.length > 0 ? (
                          displayBlock.options.map((option) => (
                            <div key={option.id} className="group flex items-end gap-2 bg-blue-50 p-3 rounded border border-blue-100">
                              <span className="text-blue-600 font-bold flex-shrink-0 mt-1">→</span>
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={option.resultat}
                                  onChange={(e) => updateOption(option.id, "resultat", e.target.value)}
                                  placeholder="Résultat..."
                                  className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                                <input
                                  type="text"
                                  value={option.decision}
                                  onChange={(e) => updateOption(option.id, "decision", e.target.value)}
                                  placeholder="Décision..."
                                  className="w-full bg-white border border-blue-200 rounded px-2 py-1 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                              </div>
                              {(displayBlock.options || []).length > 2 && (
                                <button
                                  onClick={() => deleteOption(option.id)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 transition-all flex-shrink-0"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-3 text-slate-400 text-xs">
                            Aucune option
                          </div>
                        )}
                      </div>
                      <button
                        onClick={addOptionToBlock}
                        className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded transition-all"
                      >
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                )}

              {/* WAIT Block UI */}
              {displayBlock.type === "WAIT" && (
                <div className="bg-amber-50 border border-amber-100 rounded px-6 py-8 flex flex-col items-center justify-center space-y-4">
                  <label className="text-sm font-bold uppercase tracking-wide text-amber-700">
                    Durée d'attente
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      value={displayBlock.duration || ""}
                      onChange={(e) =>
                        setNewBlock({
                          ...displayBlock,
                          duration: e.target.value ? parseInt(e.target.value) : undefined,
                        })
                      }
                      placeholder="0"
                      className="w-32 rounded border border-amber-200 bg-white px-4 py-3 text-xl font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none text-center"
                    />
                    <span className="text-lg font-semibold text-amber-700">minutes</span>
                  </div>
                </div>
              )}

              {/* Save/Cancel Block Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 -mx-4 -mb-4 px-4 py-3 bg-slate-50">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    setNewBlock(null);
                    setSelectedBlockId(null);
                  }}
                  disabled={savingBlock}
                  className="flex-1"
                >
                  {t("episodes.buttons.cancel")}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={saveBlock}
                  disabled={savingBlock}
                  className="flex-1 shadow-md flex items-center justify-center gap-2"
                >
                  {savingBlock ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      {t("episodes.loading.saving")}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {t("episodes.blocks.saveBlock")}
                    </>
                  )}
                </Button>
              </div>
            </div>
                );
              })()
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
