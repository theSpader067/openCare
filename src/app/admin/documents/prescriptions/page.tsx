"use client";

import { Plus, Eye, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PrescriptionsDesignPage() {
  const templates = [
    {
      id: 1,
      name: "Ordonnance Standard",
      description: "Modèle par défaut pour toutes les ordonnances",
      active: true,
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Ordonnance Chirurgicale",
      description: "Template spécifique pour les recommandations post-opératoires",
      active: false,
      createdAt: "2024-02-01",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Design des Ordonnances</h1>
          <p className="text-slate-600 mt-1">
            Créez et personnalisez vos modèles d'ordonnances
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Modèle
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
                {template.active && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-semibold">
                    Actif
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-slate-500 mb-4">
                Créé le {new Date(template.createdAt).toLocaleDateString("fr-FR")}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Aperçu
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit2 className="h-4 w-4 mr-2" />
                  Éditer
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Section */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Éditeur de Template</CardTitle>
          <CardDescription>Personnalisez le design de vos documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-slate-100 rounded border-2 border-dashed border-slate-300 flex items-center justify-center">
            <p className="text-slate-500">Sélectionnez un modèle pour l'éditer</p>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base">📋 À savoir</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700 space-y-2">
          <p>
            Vous pouvez créer plusieurs templates d'ordonnances et choisir celui à utiliser selon
            le contexte.
          </p>
          <p>
            Seul un modèle peut être "actif" à la fois - c'est celui qui sera utilisé par défaut.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
