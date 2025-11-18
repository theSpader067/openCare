"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Check,
  Copy,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import Quill types
interface QuillType {
  getLength(): number;
  getText(): string;
  insertText(index: number, text: string): void;
  setSelection(index: number): void;
  root: HTMLElement;
  format(name: string, value: any): void;
  getFormat(): any;
}

interface SmartEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  headerSlot?: ReactNode;
  /** Array of input IDs to include as context for AI suggestions */
  contextInputIds?: string[];
}

/**
 * SmartEditor renders a Quill editor with custom toolbar buttons
 * for copy and AI suggestions
 */
export function SmartEditor({
  value,
  onChange,
  placeholder = "Commencez votre rédaction clinique…",
  className,
  headerSlot,
  contextInputIds = [],
}: SmartEditorProps) {
  const [ghostSuggestion, setGhostSuggestion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<QuillType | null>(null);
  const lastTabTimeRef = useRef<number>(0);
  const tabTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const ghostSuggestionRef = useRef<string | null>(null);
  const isLoadingSuggestionRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !editorRef.current) return;

    // Dynamically import Quill only on client side
    import("quill").then((Quill) => {
      if (!editorRef.current || quillRef.current) return;

      const quill = new Quill.default(editorRef.current, {
        theme: "snow",
        placeholder,
        modules: {
          toolbar: "#toolbar",
          keyboard: {
            bindings: {
              // Disable default tab behavior completely
              tab: {
                key: 9,
                handler: () => {
                  return false; // Prevent Quill from handling tab
                },
              },
            },
          },
        },
        formats: ["header", "bold", "italic", "underline", "list"],
      });

      quillRef.current = quill as unknown as QuillType;

      // Set initial value
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle changes
      quill.on("text-change", () => {
        if (onChange) {
          onChange(quill.root.innerHTML);
        }
      });

      // Handle keyboard shortcuts for AI suggestions
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Tab" && !event.shiftKey) {
          event.preventDefault();

          const currentTime = Date.now();
          const timeSinceLastTab = currentTime - lastTabTimeRef.current;

          // Double tab detection (within 500ms)
          if (timeSinceLastTab < 500 && ghostSuggestionRef.current) {
            // Double tab: accept suggestion
            if (tabTimeoutRef.current) {
              clearTimeout(tabTimeoutRef.current);
              tabTimeoutRef.current = null;
            }
            acceptCurrentSuggestion();
            lastTabTimeRef.current = 0;
          } else {
            // Single tab: show suggestion
            lastTabTimeRef.current = currentTime;

            if (!ghostSuggestionRef.current && !isLoadingSuggestionRef.current) {
              showNextSuggestion();
            }

            // Reset the double-tap window after 500ms
            if (tabTimeoutRef.current) {
              clearTimeout(tabTimeoutRef.current);
            }
            tabTimeoutRef.current = setTimeout(() => {
              lastTabTimeRef.current = 0;
            }, 500);
          }
        } else if (event.key === "Escape" && (ghostSuggestionRef.current || isLoadingSuggestionRef.current)) {
          event.preventDefault();
          setGhostSuggestion(null);
          ghostSuggestionRef.current = null;
          setIsLoadingSuggestion(false);
          isLoadingSuggestionRef.current = false;
        }
      };

      quill.root.addEventListener("keydown", handleKeyDown);

      return () => {
        quill.root.removeEventListener("keydown", handleKeyDown);
      };
    });

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current = null;
      }
    };
  }, [mounted, placeholder]);

  // Update content when value prop changes
  useEffect(() => {
    if (quillRef.current && value !== undefined && quillRef.current.root.innerHTML !== value) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  // Keep refs in sync with state
  useEffect(() => {
    ghostSuggestionRef.current = ghostSuggestion;
  }, [ghostSuggestion]);

  useEffect(() => {
    isLoadingSuggestionRef.current = isLoadingSuggestion;
  }, [isLoadingSuggestion]);

  const showNextSuggestion = useCallback(async () => {
    setIsLoadingSuggestion(true);
    isLoadingSuggestionRef.current = true;

    try {
      // Get current editor content as context
      const editorContext = quillRef.current?.getText() || "";

      // Collect additional context from specified input IDs
      const additionalContext: Record<string, string> = {};
      contextInputIds.forEach((inputId) => {
        const element = document.getElementById(inputId) as HTMLInputElement | HTMLTextAreaElement;
        if (element) {
          const label = element.getAttribute("aria-label") || element.getAttribute("placeholder") || inputId;
          additionalContext[label] = element.value;
        }
      });

      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: editorContext,
          additionalContext
        }),
      });

      const data = await response.json();

      if (data.success && data.suggestion) {
        setGhostSuggestion(data.suggestion);
        ghostSuggestionRef.current = data.suggestion;
      } else {
        // Fallback suggestion if API fails
        const fallback = "Continuez votre rédaction clinique ici";
        setGhostSuggestion(fallback);
        ghostSuggestionRef.current = fallback;
      }
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      // Fallback suggestion on error
      const fallback = "Continuez votre rédaction clinique ici";
      setGhostSuggestion(fallback);
      ghostSuggestionRef.current = fallback;
    } finally {
      setIsLoadingSuggestion(false);
      isLoadingSuggestionRef.current = false;
    }
  }, [contextInputIds]);

  const acceptCurrentSuggestion = useCallback(() => {
    const suggestion = ghostSuggestionRef.current;
    if (!quillRef.current || !suggestion) {
      return;
    }

    const currentLength = quillRef.current.getLength();
    quillRef.current.insertText(currentLength - 1, ` ${suggestion} `);
    setGhostSuggestion(null);
    ghostSuggestionRef.current = null;
    quillRef.current.setSelection(currentLength + suggestion.length + 2);
  }, []);

  const handleCopyContent = async () => {
    if (!quillRef.current || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      const plainText = quillRef.current.getText();
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleMagicWand = () => {
    if (!ghostSuggestionRef.current && !isLoadingSuggestionRef.current) {
      showNextSuggestion();
    } else if (ghostSuggestionRef.current) {
      acceptCurrentSuggestion();
    }
  };

  const hasGhostSuggestion = Boolean(ghostSuggestion);

  const toolbarButtonClass = (isActive: boolean) =>
    cn(
      "flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-slate-500 transition",
      isActive && "bg-violet-100 text-violet-700 border-violet-200 shadow-sm",
      !isActive && "bg-white hover:bg-slate-50"
    );

  if (!mounted) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white py-12 shadow-inner text-sm text-slate-500">
        Chargement de l'éditeur…
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex max-h-[80vh] flex-col rounded-3xl bg-white/80 shadow-[0_20px_50px_-25px_rgba(79,70,229,0.4)]">
        <div id="toolbar" className="flex flex-wrap items-center gap-2 px-4 py-3">
          {/* Heading formats */}
          <button className="ql-header" value="1" title="Titre H1">
            <span className="text-sm font-semibold">H1</span>
          </button>
          <button className="ql-header" value="2" title="Titre H2">
            <span className="text-sm font-semibold">H2</span>
          </button>
          <button className="ql-header" value="3" title="Titre H3">
            <span className="text-sm font-semibold">H3</span>
          </button>
          <button className="ql-header" value="" title="Paragraphe">
            <span className="text-sm font-semibold">P</span>
          </button>

          <span className="mx-1 h-6 w-px bg-slate-200" />

          {/* Text formatting */}
          <button className="ql-bold" title="Gras" />
          <button className="ql-italic" title="Italique" />
          <button className="ql-underline" title="Souligné" />

          <span className="mx-1 h-6 w-px bg-slate-200" />

          {/* Lists */}
          <button className="ql-list" value="ordered" title="Liste numérotée" />

          <span className="mx-1 h-6 w-px bg-slate-200" />

          {/* Custom buttons */}
          <button
            type="button"
            onClick={handleMagicWand}
            className={cn(
              toolbarButtonClass(hasGhostSuggestion || isLoadingSuggestion),
              (hasGhostSuggestion || isLoadingSuggestion) && "bg-emerald-100 text-emerald-700 border-emerald-200"
            )}
            title={hasGhostSuggestion ? "Valider la suggestion" : isLoadingSuggestion ? "Chargement..." : "Suggestion IA"}
            disabled={isLoadingSuggestion}
          >
            {hasGhostSuggestion ? (
              <Check className="h-4 w-4" />
            ) : isLoadingSuggestion ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
            ) : (
              <Wand2 className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyContent}
            className={toolbarButtonClass(copied)}
            title="Copier le contenu"
          >
            <Copy className="h-4 w-4" />
          </button>

          {copied && (
            <span className="ml-2 flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
              <Check className="h-3 w-3 text-green-600" />
              copié
            </span>
          )}
        </div>

        <div className="relative flex-1 overflow-y-auto">
          <div ref={editorRef} className="quill-editor-container" />

          {isLoadingSuggestion && (
            <div className="mx-5 mb-5 mt-3 space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200"></div>
              <div className="h-3 w-full animate-pulse rounded bg-slate-200"></div>
              <div className="h-3 w-2/3 animate-pulse rounded bg-slate-200"></div>
            </div>
          )}

          {ghostSuggestion && !isLoadingSuggestion && (
            <p className="mx-5 mb-5 mt-3 whitespace-pre-wrap text-sm text-slate-500 opacity-50">
              {ghostSuggestion}
              <span className="ml-2 text-[10px] uppercase tracking-wide text-slate-400">
                ↹↹ pour valider
              </span>
            </p>
          )}
        </div>
      </div>

      <style jsx global>{`
        @import url('https://cdn.quilljs.com/1.3.6/quill.snow.css');

        .quill-editor-container .ql-container {
          border: none !important;
          border-radius: 0 !important;
          font-family: inherit;
        }

        .quill-editor-container .ql-editor {
          min-height: 280px;
          padding: 1.25rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: rgb(15 23 42);
          border: none !important;
        }

        .quill-editor-container .ql-editor.ql-blank::before {
          color: rgb(148 163 184);
          font-style: normal;
          left: 1.25rem;
        }

        .quill-editor-container .ql-toolbar {
          display: none;
        }

        #toolbar button {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          border: 1px solid transparent;
          color: rgb(100 116 139);
          background-color: white;
          transition: all 0.2s;
          padding: 0;
        }

        #toolbar button:hover:not(:disabled) {
          background-color: rgb(248 250 252);
        }

        #toolbar button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        #toolbar button.ql-active {
          background-color: rgb(237 233 254);
          color: rgb(109 40 217);
          border-color: rgb(221 214 254);
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }

        #toolbar button svg {
          width: 16px;
          height: 16px;
        }

        .quill-editor-container .ql-editor h1 {
          font-size: 2em;
          font-weight: normal;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .quill-editor-container .ql-editor h2 {
          font-size: 1.5em;
          font-weight: normal;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .quill-editor-container .ql-editor h3 {
          font-size: 1.17em;
          font-weight: normal;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }

        .quill-editor-container .ql-editor ul,
        .quill-editor-container .ql-editor ol {
          padding-left: 1.5em;
          margin: 0.5em 0;
        }

        .quill-editor-container .ql-editor ul {
          list-style-type: disc;
        }

        .quill-editor-container .ql-editor ol {
          list-style-type: decimal;
        }

        .quill-editor-container .ql-editor strong {
          font-weight: bold;
        }

        .quill-editor-container .ql-editor em {
          font-style: italic;
        }

        .quill-editor-container .ql-editor u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
