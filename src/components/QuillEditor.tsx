"use client";

import { useEffect, useRef, useState } from "react";
import "quill/dist/quill.snow.css";

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function QuillEditor({ value, onChange, readOnly = false }: QuillEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    // Only initialize once
    if (isInitializedRef.current || !containerRef.current) return;

    // Import Quill dynamically to avoid SSR issues
    import("quill").then(({ default: Quill }) => {
      if (!containerRef.current || isInitializedRef.current) return;

      // Create editor div inside container
      const editorDiv = document.createElement("div");
      containerRef.current.appendChild(editorDiv);

      // Initialize Quill with explicit modules
      const quill = new Quill(editorDiv, {
        theme: "snow",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline", "strike"],
            ["blockquote", "code-block"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        },
        readOnly,
      });

      editorRef.current = quill;
      isInitializedRef.current = true;

      // Set initial content
      if (value) {
        quill.root.innerHTML = value;
      }

      // Handle changes
      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        onChange(html);
      });
    });

    return () => {
      // Cleanup on unmount
      if (editorRef.current) {
        editorRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col">
      <style>{`
        .quill-editor-wrapper .ql-toolbar {
          border: 1px solid #e2e8f0 !important;
          border-radius: 0.375rem 0.375rem 0 0;
          background-color: #f8fafc;
        }
        .quill-editor-wrapper .ql-container {
          border: 1px solid #e2e8f0 !important;
          border-top: none !important;
          border-radius: 0 0 0.375rem 0.375rem;
          font-size: 0.875rem;
          height: calc(100% - 42px);
        }
        .quill-editor-wrapper .ql-editor {
          padding: 1.5rem;
          min-height: 600px;
        }
        .quill-editor-wrapper .ql-editor h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .quill-editor-wrapper .ql-editor h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .quill-editor-wrapper .ql-editor h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.375rem;
        }
        .quill-editor-wrapper .ql-editor p {
          margin: 0.25rem 0;
          line-height: 1.6;
        }
        .quill-editor-wrapper .ql-editor ul,
        .quill-editor-wrapper .ql-editor ol {
          margin: 0.25rem 0;
          padding-left: 1.5rem;
        }
        .quill-editor-wrapper .ql-editor li {
          margin: 0;
          line-height: 1.6;
        }
        .quill-editor-wrapper .ql-editor h1,
        .quill-editor-wrapper .ql-editor h2,
        .quill-editor-wrapper .ql-editor h3 {
          margin: 0.5rem 0 0.25rem 0;
        }
        .quill-editor-wrapper .ql-editor blockquote {
          margin: 0.25rem 0;
          padding-left: 1rem;
        }
      `}</style>
      <div className="quill-editor-wrapper w-full h-full" ref={containerRef} />
    </div>
  );
}
