"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WYSIWYGEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function WYSIWYGEditor({
  value,
  onChange,
  placeholder = "Entrez votre contenu...",
  className,
}: WYSIWYGEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, UnderlineExt],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("border border-violet-200 rounded-xl overflow-hidden shadow-sm relative", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 bg-slate-50 border-b border-violet-200 p-2 sticky top-0 z-10">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={cn(
            "p-2 rounded-lg transition",
            editor.isActive("bold")
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          )}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={cn(
            "p-2 rounded-lg transition",
            editor.isActive("italic")
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          )}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          onClick={() => {
            if (editor.can().chain().focus().toggleMark("underline").run()) {
              editor.chain().focus().toggleMark("underline").run();
            }
          }}
          className={cn(
            "p-2 rounded-lg transition",
            editor.isActive("underline")
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          )}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="w-px bg-slate-200" />

        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={cn(
            "p-2 rounded-lg transition",
            editor.isActive("heading", { level: 2 })
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          )}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-2 rounded-lg transition",
            editor.isActive("bulletList")
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          )}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "p-2 rounded-lg transition",
            editor.isActive("orderedList")
              ? "bg-indigo-100 text-indigo-700"
              : "bg-white text-slate-600 hover:bg-slate-100"
          )}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white p-4 relative [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px]">
        {!editor.getText() && (
          <div className="absolute pointer-events-none text-slate-400 text-sm top-4 left-4">
            {placeholder}
          </div>
        )}
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none [&_p]:m-1 [&_p:first-child]:mt-0 [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-lg [&_h2:first-child]:mt-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:my-2 [&_li]:m-0 [&_strong]:font-bold [&_em]:italic [&_u]:underline"
        />
      </div>
    </div>
  );
}
