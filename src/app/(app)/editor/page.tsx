"use client";

import { useState } from "react";
import { SmartEditor } from "@/components/editor/smart-editor";

export default function EditorPage() {
  const [content, setContent] = useState(
    "<p><strong>Brief du service :</strong> préparer le compte-rendu post-op pour M. Durand.</p><p>Noter les constantes du jour, l'évolution des douleurs et les prochaines actions de coordination.</p>",
  );

  return (
    <div className="flex flex-1 flex-col">
      <SmartEditor value={content} onChange={setContent} />
    </div>
  );
}

