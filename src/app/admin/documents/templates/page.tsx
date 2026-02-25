"use client";

import { FileText, Upload, Save, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

interface DocumentTemplate {
  id: string;
  name: string;
  type: "ordonnance" | "rapport" | "facture" | "attestation";
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface TemplateDesign {
  title: string;
  footerText: string;
  companyInfo: string;
  headerImage: string | null;
  logoImage: string | null;
}

const DOCUMENT_TYPES: DocumentTemplate[] = [
  {
    id: "1",
    name: "Ordonnances",
    type: "ordonnance",
    icon: <FileText className="h-5 w-5" />,
    color: "#4F46E5",
    description: "Prescriptions médicales",
  },
  {
    id: "2",
    name: "Rapports",
    type: "rapport",
    icon: <FileText className="h-5 w-5" />,
    color: "#4F46E5",
    description: "Comptes rendus",
  },
  {
    id: "3",
    name: "Bilans",
    type: "facture",
    icon: <FileText className="h-5 w-5" />,
    color: "#4F46E5",
    description: "Bilan de santé",
  },
  {
    id: "4",
    name: "Factures",
    type: "attestation",
    icon: <FileText className="h-5 w-5" />,
    color: "#4F46E5",
    description: "Facturation",
  },
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(
    DOCUMENT_TYPES[0]
  );
  const [templateDesign, setTemplateDesign] = useState<TemplateDesign>({
    title: "Ordonnance Médicale",
    footerText: "Document à usage médical - Confidentiel",
    companyInfo: "123 Rue de la Santé\n20000 Casablanca\nTél: +212 5XX XXX XXX",
    headerImage: null,
    logoImage: null,
  });

  const handleInputChange = (field: keyof TemplateDesign, value: string) => {
    setTemplateDesign((prev) => ({ ...prev, [field]: value }));
  };

  const handleHeaderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateDesign((prev) => ({
          ...prev,
          headerImage: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateDesign((prev) => ({
          ...prev,
          logoImage: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">
          Modèles de Documents
        </h1>
        <p className="text-slate-600">
          Créez et personnalisez les modèles de vos documents imprimables
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Document Type Selection */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">Types de Documents</h2>
              </div>
              <div className="divide-y divide-slate-200">
                {DOCUMENT_TYPES.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedTemplate(doc)}
                    className={`w-full text-left px-6 py-3 transition-colors flex items-start gap-3 ${
                      selectedTemplate.id === doc.id
                        ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 transition-colors ${
                        selectedTemplate.id === doc.id
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {doc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium text-sm ${
                          selectedTemplate.id === doc.id
                            ? "text-indigo-600"
                            : "text-slate-900"
                        }`}
                      >
                        {doc.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Design Area */}
        <div className="lg:col-span-3 space-y-8">
          {/* Toned Down Header Card */}
          <div className="rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 text-white shadow-lg">
            <div className="space-y-2">
              <p className="text-indigo-100 text-sm font-medium">
                Configuration en cours
              </p>
              <h2 className="text-3xl font-bold">{selectedTemplate.name}</h2>
              <p className="text-indigo-100 text-sm">
                Adaptez votre template aux informations de votre établissement
              </p>
            </div>
          </div>

          {/* Information Section */}
          <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-900">
                    Informations du Document
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Remplissez les détails de votre modèle
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-8">
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Titre Principal
                </label>
                <input
                  type="text"
                  value={templateDesign.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-slate-50 to-white"
                  placeholder="Ex: Ordonnance Médicale"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Informations de l'Établissement
                </label>
                <textarea
                  value={templateDesign.companyInfo}
                  onChange={(e) => handleInputChange("companyInfo", e.target.value)}
                  rows={5}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-slate-50 to-white resize-none"
                  placeholder="Adresse, téléphone, numéro SIRET, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-900 mb-3">
                  Pied de Page
                </label>
                <input
                  type="text"
                  value={templateDesign.footerText}
                  onChange={(e) => handleInputChange("footerText", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-gradient-to-r from-slate-50 to-white"
                  placeholder="Ex: Confidentiel"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Header Image Upload */}
            <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300 group">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Image d'En-tête
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">Remplace le titre</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 group/upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeaderImageUpload}
                    className="hidden"
                    id="header-upload"
                  />
                  <label htmlFor="header-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-slate-100 rounded-full group-hover/upload:bg-indigo-100 group-hover/upload:scale-110 transition-all duration-300">
                        <Upload className="h-6 w-6 text-slate-600 group-hover/upload:text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Cliquez pour télécharger
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                {templateDesign.headerImage && (
                  <div className="relative group/image">
                    <img
                      src={templateDesign.headerImage}
                      alt="header"
                      className="w-full h-28 object-cover rounded-xl border-2 border-indigo-200 shadow-md group-hover/image:shadow-lg transition-shadow duration-200"
                    />
                    <button
                      onClick={() =>
                        setTemplateDesign((prev) => ({
                          ...prev,
                          headerImage: null,
                        }))
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Logo Image Upload */}
            <Card className="shadow-lg border-slate-200 hover:shadow-xl transition-shadow duration-300 group">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-slate-900">
                      Logo Central
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Filigrane discret
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 group/upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoImageUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-slate-100 rounded-full group-hover/upload:bg-indigo-100 group-hover/upload:scale-110 transition-all duration-300">
                        <Upload className="h-6 w-6 text-slate-600 group-hover/upload:text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          Cliquez pour télécharger
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
                {templateDesign.logoImage && (
                  <div className="relative group/image">
                    <img
                      src={templateDesign.logoImage}
                      alt="logo"
                      className="w-full h-28 object-contain rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-slate-50 to-white shadow-md group-hover/image:shadow-lg transition-shadow duration-200"
                    />
                    <button
                      onClick={() =>
                        setTemplateDesign((prev) => ({
                          ...prev,
                          logoImage: null,
                        }))
                      }
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          <button className="w-full group relative px-8 py-4 text-white font-bold text-lg rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-600 group-hover:to-indigo-700 transition-all duration-300" />
            <div className="relative flex items-center justify-center gap-2">
              <Save className="h-5 w-5" />
              Enregistrer le Template
            </div>
          </button>

          {/* Document Preview */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-slate-900">
              Aperçu du Document
            </h3>
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden" style={{ aspectRatio: "210 / 297" }}>
              <div
                className="p-16 space-y-8 relative h-full"
                style={{
                  backgroundColor: "#ffffff",
                  borderTop: "6px solid #4F46E5",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Background Watermark Logo */}
                {templateDesign.logoImage && (
                  <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ opacity: 0.08 }}
                  >
                    <img
                      src={templateDesign.logoImage}
                      alt="logo-watermark"
                      className="h-80 object-contain"
                    />
                  </div>
                )}

                {/* Header Section */}
                <div className="relative z-10">
                  {templateDesign.headerImage ? (
                    <div className="mb-8">
                      <img
                        src={templateDesign.headerImage}
                        alt="header"
                        className="w-full h-40 object-cover rounded-lg shadow-md border border-slate-200"
                      />
                    </div>
                  ) : (
                    <div className="mb-8">
                      <div className="inline-block">
                        <h1 className="text-4xl font-bold text-slate-900 mb-1">
                          {templateDesign.title}
                        </h1>
                        <div className="h-1 w-24 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full" />
                      </div>
                    </div>
                  )}

                  {/* Company Info */}
                  <p className="text-slate-700 whitespace-pre-line text-sm font-medium leading-relaxed mb-12 bg-gradient-to-r from-slate-50 to-transparent p-6 rounded-lg border border-slate-200">
                    {templateDesign.companyInfo}
                  </p>
                </div>

                {/* Content Area */}
                <div className="relative z-10 flex-1 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-50 to-slate-100/50 shadow-inner">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold">Contenu du document</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="relative z-10 text-center border-t border-slate-200 pt-6">
                  <p className="text-slate-600 text-sm font-medium">
                    {templateDesign.footerText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
