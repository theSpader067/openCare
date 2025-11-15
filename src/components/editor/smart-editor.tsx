"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedListExt from "@tiptap/extension-ordered-list";
import {
  Bold,
  Check,
  Copy,
  Italic,
  List,
  ListOrdered,
  RefreshCcw,
  Sparkles,
  Underline as UnderlineIcon,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const suggestionPool = [
  "Planifiez le suivi post-opératoire en mentionnant les examens à programmer et les consignes de surveillance.",
  "Résumez l'évolution clinique des dernières 24 heures et listez les prochaines étapes thérapeutiques.",
  "Rédigez un message rassurant pour l'équipe de garde en soulignant les points d'attention prioritaires.",
  "Détaillez les actions de coordination à mener avec le laboratoire et le service social avant la sortie.",
];

interface SmartEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  headerSlot?: ReactNode;
}

/**
 * SmartEditor renders a TipTap editor enhanced with a simple formatting toolbar
 * and a Tab-triggered “ghost text” suggestion preview.
 */
export function SmartEditor({
  value,
  onChange,
  placeholder = "Commencez votre rédaction clinique…",
  className,
  headerSlot,
}: SmartEditorProps) {
  const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const initialContent = useMemo(() => value ?? "", [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedListExt.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      Underline,
    ],
    content: initialContent,
    autofocus: "end",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[280px] outline-none text-slate-900 selection:bg-violet-200/60",
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML());
      }
    },
  });

  useEffect(() => {
    if (!editor || typeof value !== "string") {
      return;
    }

    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  const showNextSuggestion = useCallback(() => {
    setGhostSuggestion(suggestionPool[suggestionIndex]);
    setSuggestionIndex((prev) => (prev + 1) % suggestionPool.length);
  }, [suggestionIndex]);

  const acceptCurrentSuggestion = useCallback(() => {
    if (!editor || !ghostSuggestion) {
      return;
    }

    editor.chain().focus().insertContent(`${ghostSuggestion} `).run();
    setGhostSuggestion(null);
  }, [editor, ghostSuggestion]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        if (!ghostSuggestion) {
          showNextSuggestion();
          return;
        }

        acceptCurrentSuggestion();
        return;
      }

      if (event.key === "Escape" && ghostSuggestion) {
        event.preventDefault();
        setGhostSuggestion(null);
      }
    };

    editor.view.dom.addEventListener("keydown", handleKeyDown);
    return () => {
      editor.view.dom.removeEventListener("keydown", handleKeyDown);
    };
  }, [editor, ghostSuggestion, showNextSuggestion, acceptCurrentSuggestion]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-12 shadow-inner text-sm text-slate-500">
        Chargement de l’éditeur…
      </div>
    );
  }

  const handleShuffleSuggestion = () => {
    showNextSuggestion();
  };

  const handleCopyContent = async () => {
    if (!editor || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      const plainText = editor.getText({ blockSeparator: "\n" });
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const hasGhostSuggestion = Boolean(ghostSuggestion);

  const toolbarButtonClass = (isActive: boolean, disabled?: boolean) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition",
      isActive && "bg-violet-100 text-violet-700 border-violet-200 shadow-sm",
      !isActive && "bg-white hover:bg-slate-50",
      disabled && "opacity-40 pointer-events-none",
    );

  const headingValue = (() => {
    if (!editor) {
      return "paragraph";
    }
    if (editor.isActive("heading", { level: 1 })) {
      return "h1";
    }
    if (editor.isActive("heading", { level: 2 })) {
      return "h2";
    }
    if (editor.isActive("heading", { level: 3 })) {
      return "h3";
    }
    return "paragraph";
  })();

  const handleHeadingSelect = (value: string) => {
    if (!editor) {
      return;
    }

    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    const level = Number(value.replace("h", "")) as 1 | 2 | 3;
    editor.chain().focus().setHeading({ level }).run();
  };

  return (
    <div className={cn("space-y-4", className)}>
     

      <div className="flex max-h-[80vh] flex-col rounded-3xl border border-slate-200 bg-white/80 shadow-[0_20px_50px_-25px_rgba(79,70,229,0.4)]">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <select
            value={headingValue}
            onChange={(event) => handleHeadingSelect(event.target.value)}
            className="min-w-[140px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200"
            aria-label="Niveau de titre"
          >
            <option value="paragraph">Paragraphe</option>
            <option value="h1">Titre H1</option>
            <option value="h2">Titre H2</option>
            <option value="h3">Titre H3</option>
          </select>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={toolbarButtonClass(editor.isActive("bold"))}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            title="Gras"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={toolbarButtonClass(editor.isActive("italic"))}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            title="Italique"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={toolbarButtonClass(editor.isActive("underline"))}
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            title="Souligné"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <span className="mx-1 h-6 w-px bg-slate-200" />
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={toolbarButtonClass(editor.isActive("bulletList"))}
            disabled={!editor.can().chain().focus().toggleBulletList().run()}
            title="Liste à puces"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={toolbarButtonClass(editor.isActive("orderedList"))}
            disabled={!editor.can().chain().focus().toggleOrderedList().run()}
            title="Liste numérotée"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <button
              type="button"
              onClick={() =>
                hasGhostSuggestion
                  ? acceptCurrentSuggestion()
                  : showNextSuggestion()
              }
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                hasGhostSuggestion
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-violet-200 bg-white text-violet-700 hover:bg-violet-50",
              )}
              title={
                hasGhostSuggestion
                  ? "Valider la suggestion"
                  : "Proposer une suggestion"
              }
              aria-pressed={hasGhostSuggestion}
            >
              {hasGhostSuggestion ? (
                <Check className="h-4 w-4" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
            </button>
            {copied && (
              <span className="flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 font-medium text-green-700">
                <Check className="h-3.5 w-3.5 text-green-600" />
                contenu copié
              </span>
            )}
            <button
              type="button"
              onClick={handleCopyContent}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              title="Copier uniquement le texte"
            >
              <Copy className="h-4 w-4" />
              
            </button>
          </div>
        </div>

        <div className="relative flex-1 overflow-y-auto px-5 pb-5 pt-4">
          {!editor.getText({ blockSeparator: "\n" }) && !ghostSuggestion && (
            <span className="pointer-events-none absolute left-5 top-4 text-sm text-slate-400">
              {placeholder}
            </span>
          )}

          <EditorContent editor={editor} />

          {ghostSuggestion && (
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-500 opacity-50">
              {ghostSuggestion}
              <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">
                ↹ pour valider
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
