"use client";

import { useState } from "react";
import { SmartEditor } from "@/components/editor/smart-editor";

export default function EditorPage() {
  const [content, setContent] = useState(
    "",
  );

  return (
    <div className="flex flex-1 flex-col">
      <SmartEditor value={content} onChange={setContent} />
    </div>
  );
}

