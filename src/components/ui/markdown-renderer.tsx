"use client";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown to HTML renderer
 * Supports: headings (# ## ###), bold (**text**), lists (- and 1.), line breaks
 */
export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
  const html = content
    // Headings
    .replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold text-slate-800 mt-3 mb-2">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-base font-bold text-slate-900 mt-4 mb-2">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="text-lg font-bold text-slate-900 mt-4 mb-2">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Lists (unordered and ordered - combined)
    .replace(/^\s*[-•]\s+(.*?)$/gm, '<li class="ml-4 text-slate-700">$1</li>')
    .replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="ml-4 text-slate-700">$1</li>')
    // Line breaks
    .split('\n')
    .map((line) => {
      if (line.match(/^<(h[1-3]|li)/)) return line;
      if (line.trim() === '') return '<div class="h-2"></div>';
      if (!line.match(/^</)) return `<p class="text-sm text-slate-700 leading-relaxed">${line}</p>`;
      return line;
    })
    .join('\n');

  return (
    <div
      className={`prose prose-sm max-w-none text-slate-700 space-y-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
