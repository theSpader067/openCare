"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FDRType } from "@/types/fdrs";

interface FDRModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: FDRType;
  details?: string;
  onSave: (details: string) => void;
}

export function FDRModal({ isOpen, onClose, type, details = "", onSave }: FDRModalProps) {
  const [localDetails, setLocalDetails] = React.useState(details);

  React.useEffect(() => {
    setLocalDetails(details);
  }, [details]);

  const getContent = () => {
    switch (type) {
      case "alcool":
        return {
          title: "Détails - Alcool",
          description:
            "Veuillez documenter la consommation d'alcool du patient, incluant la quantité et la fréquence.",
        };
      case "HTA":
        return {
          title: "Détails - HTA (Hypertension Artérielle)",
          description:
            "Documentez les antécédents d'hypertension, les valeurs de tension artérielle actuelles et le traitement si applicable.",
        };
      case "dyslipidémie":
        return {
          title: "Détails - Dyslipidémie",
          description:
            "Documentez le type de dyslipidémie, les valeurs de lipides sanguins et le traitement si applicable.",
        };
      case "diabète":
        return {
          title: "Détails - Diabète",
          description:
            "Documentez le type de diabète, les valeurs de glycémie et le traitement si applicable.",
        };
      default:
        return { title: "Détails", description: "" };
    }
  };

  const content = getContent();

  return (
    <Modal open={isOpen} onClose={onClose} title={content.title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{content.description}</p>
        <textarea
          value={localDetails}
          onChange={(e) => setLocalDetails(e.target.value)}
          placeholder="Entrez les détails ici..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-32"
        />
        <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave(localDetails);
              onClose();
            }}
          >
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
