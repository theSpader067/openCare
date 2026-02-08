"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TabacData } from "@/types/fdrs";

interface TabacModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TabacData) => void;
  initialData?: TabacData;
}

export function TabacModal({ isOpen, onClose, onSave, initialData }: TabacModalProps) {
  const [duréeExposition, setDuréeExposition] = useState(
    initialData?.duréeExposition || ""
  );
  const [quantitéPaquetAnnée, setQuantitéPaquetAnnée] = useState(
    initialData?.quantitéPaquetAnnée || ""
  );
  const [fagerstromScore, setFagerstromScore] = useState(
    initialData?.fagerstromScore || 0
  );
  const [activeTab, setActiveTab] = useState<"info" | "fagerstrom">("info");

  const handleSave = () => {
    onSave({
      duréeExposition,
      quantitéPaquetAnnée,
      fagerstromScore,
      évaluationDépendance: `Score Fagerstrom: ${fagerstromScore}`,
    });
    onClose();
  };

  const fagerstromQuestions = [
    {
      label: "Combien de temps après votre réveil fumez-vous votre première cigarette?",
      options: [
        { text: "Après 30 min", points: 0 },
        { text: "Entre 6-30 min", points: 1 },
        { text: "Entre 5-6 min", points: 2 },
        { text: "Immédiatement", points: 3 },
      ],
    },
    {
      label: "Trouvez-vous difficile de ne pas fumer dans les endroits où c'est interdit?",
      options: [
        { text: "Non", points: 0 },
        { text: "Oui", points: 1 },
      ],
    },
    {
      label: "Quelle cigarette vous serait la plus difficile à abandonner?",
      options: [
        { text: "Une autre", points: 0 },
        { text: "La première du matin", points: 1 },
      ],
    },
    {
      label: "Combien de cigarettes fumez-vous généralement par jour?",
      options: [
        { text: "10 ou moins", points: 0 },
        { text: "11-20", points: 1 },
        { text: "21-30", points: 2 },
        { text: "31 ou plus", points: 3 },
      ],
    },
    {
      label: "Fumez-vous davantage le matin que l'après-midi?",
      options: [
        { text: "Non", points: 0 },
        { text: "Oui", points: 1 },
      ],
    },
    {
      label: "Fumez-vous même quand vous êtes malade?",
      options: [
        { text: "Non", points: 0 },
        { text: "Oui", points: 1 },
      ],
    },
  ];

  return (
    <Modal open={isOpen} onClose={onClose} title="Évaluation - Tabagisme">
      <div className="space-y-6">
        {/* Tabs - Clean Pill Shape Style */}
        <div className="flex gap-4 bg-white p-1 border border-slate-200 rounded-full inline-flex">
          <button
            onClick={() => setActiveTab("info")}
            className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2 ${
              activeTab === "info"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab("fagerstrom")}
            className={`px-6 py-2.5 text-sm font-bold uppercase tracking-wider transition-all rounded-full border-2 ${
              activeTab === "fagerstrom"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-transparent text-slate-700 border-transparent hover:text-slate-900"
            }`}
          >
            Test de Fagerstrom
          </button>
        </div>

        {/* Info Tab */}
        {activeTab === "info" && (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Durée d'exposition (années)
                </label>
                <input
                  type="text"
                  value={duréeExposition}
                  onChange={(e) => setDuréeExposition(e.target.value)}
                  placeholder="ex: 20"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantité en paquet-année
                </label>
                <input
                  type="text"
                  value={quantitéPaquetAnnée}
                  onChange={(e) => setQuantitéPaquetAnnée(e.target.value)}
                  placeholder="ex: 30"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Comment calculer: (nombre de cigarettes par jour ÷ 20) × années de consommation
            </p>

            {/* Paquet-année explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    Comment calculer les paquet-années?
                  </h4>
                  <p className="text-sm text-blue-800 mb-2">
                    Formule: (nombre de cigarettes par jour ÷ 20) × années de consommation
                  </p>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Exemple:</strong> Une personne qui fume 20 cigarettes par jour pendant 30 ans
                  </p>
                  <p className="text-sm text-blue-800">
                    (20 ÷ 20) × 30 = <strong>30 paquet-années</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fagerstrom Test Tab */}
        {activeTab === "fagerstrom" && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                <strong>Score Fagerstrom actuel:</strong> {fagerstromScore}/10
              </p>
              <p className="text-xs text-amber-800 mt-2">
                0-3: Dépendance très faible | 4-6: Dépendance faible-modérée | 7-10: Dépendance élevée
              </p>
            </div>

            <div className="space-y-4">
              {fagerstromQuestions.map((q, idx) => (
                <div key={idx} className="border border-slate-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-slate-900 mb-3">
                    {idx + 1}. {q.label}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className="flex items-center gap-2">
                        <input type="radio" name={`q${idx}`} className="rounded" />
                        <span className="text-sm text-slate-700">{opt.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Enregistrer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
