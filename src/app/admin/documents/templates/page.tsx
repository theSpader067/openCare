"use client";

import {
  FileText,
  Upload,
  Save,
  X,
  Eye,
  Plus,
  Settings,
  Download,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface DocumentTemplate {
  id: string;
  name: string;
  type: "ordonnance" | "rapport" | "facture" | "attestation";
  icon: React.ReactNode;
  color: string;
}

interface TemplateDesign {
  title: string;
  headerText: string;
  footerText: string;
  companyInfo: string;
  logoUrl: string;
  colors: {
    primary: string;
    accent: string;
  };
}

const DOCUMENT_TYPES: DocumentTemplate[] = [
  {
    id: "1",
    name: "Ordonnances",
    type: "ordonnance",
    icon: <FileText className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "2",
    name: "Rapports Médicaux",
    type: "rapport",
    icon: <FileText className="h-6 w-6" />,
    color: "from-purple-500 to-indigo-500",
  },
  {
    id: "3",
    name: "Factures",
    type: "facture",
    icon: <FileText className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "4",
    name: "Attestations",
    type: "attestation",
    icon: <FileText className="h-6 w-6" />,
    color: "from-amber-500 to-orange-500",
  },
];

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(DOCUMENT_TYPES[0]);
  const [templateDesign, setTemplateDesign] = useState<TemplateDesign>({
    title: "Ordonnance Médicale",
    headerText: "Hôpital Central de Casablanca",
    footerText: "Document à usage médical - Confidentiel",
    companyInfo: "123 Rue de la Santé\n20000 Casablanca\nTél: +212 5XX XXX XXX",
    logoUrl: "",
    colors: { primary: "#4F46E5", accent: "#06B6D4" },
  });
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState(true);

  const handleInputChange = (field: keyof TemplateDesign, value: string) => {
    setTemplateDesign((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorType: "primary" | "accent", value: string) => {
    setTemplateDesign((prev) => ({
      ...prev,
      colors: { ...prev.colors, [colorType]: value },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Templates de Documents</h1>
        <p className="text-slate-600">Créez et personnalisez les modèles de vos documents imprimables</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column - Document Type Selector */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 px-2">Types de Documents</h2>
          <div className="space-y-2">
            {DOCUMENT_TYPES.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedTemplate(doc)}
                className={`w-full rounded-xl border-2 transition-all p-4 text-left ${
                  selectedTemplate.id === doc.id
                    ? `border-indigo-500 bg-gradient-to-br ${doc.color} text-white shadow-lg`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={selectedTemplate.id === doc.id ? "text-white" : "text-slate-600"}>
                    {doc.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{doc.name}</h3>
                    <p className={`text-xs mt-1 ${selectedTemplate.id === doc.id ? "text-white/80" : "text-slate-500"}`}>
                      Personnalisable
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Main Design Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Section - Information & Settings */}
          <div className="space-y-6">
            {/* Template Header */}
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${selectedTemplate.color} p-8 text-white shadow-xl`}>
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white opacity-10 blur-3xl" />
              <div className="relative space-y-2">
                <p className="text-sm text-white/80">Template en édition</p>
                <h2 className="text-3xl font-bold">{selectedTemplate.name}</h2>
              </div>
            </div>

            {/* Design Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Information Section */}
              <Card className="shadow-md border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Titre du Document
                    </label>
                    <input
                      type="text"
                      value={templateDesign.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      En-tête
                    </label>
                    <textarea
                      value={templateDesign.headerText}
                      onChange={(e) => handleInputChange("headerText", e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Informations Établissement
                    </label>
                    <textarea
                      value={templateDesign.companyInfo}
                      onChange={(e) => handleInputChange("companyInfo", e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pied de page
                    </label>
                    <input
                      type="text"
                      value={templateDesign.footerText}
                      onChange={(e) => handleInputChange("footerText", e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Design Colors & Media */}
              <div className="space-y-4">
                {/* Colors Card */}
                <Card className="shadow-md border-slate-200">
                  <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-base">Couleurs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Couleur Principale
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={templateDesign.colors.primary}
                          onChange={(e) => handleColorChange("primary", e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={templateDesign.colors.primary}
                          onChange={(e) => handleColorChange("primary", e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Couleur Accent
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={templateDesign.colors.accent}
                          onChange={(e) => handleColorChange("accent", e.target.value)}
                          className="w-12 h-12 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={templateDesign.colors.accent}
                          onChange={(e) => handleColorChange("accent", e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Media Upload Card */}
                <Card className="shadow-md border-slate-200">
                  <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                    <CardTitle className="text-base">Logo & Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-6">
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-6 w-6 text-slate-400" />
                          <p className="text-sm text-slate-600">Cliquez pour télécharger des images</p>
                        </div>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-700">
                          Images téléchargées ({uploadedImages.length})
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={img}
                                alt={`uploaded-${idx}`}
                                className="w-full h-20 object-cover rounded-lg"
                              />
                              <button
                                onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold">
                <Save className="h-4 w-4 mr-2" />
                Enregistrer le Template
              </Button>
              <Button className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Bottom Section - Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Aperçu du Document</h3>
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? "Mode édition" : "Mode aperçu"}
              </Button>
            </div>

            {/* Document Preview */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-lg overflow-hidden">
              <div
                className="p-12 space-y-6"
                style={{
                  backgroundColor: "#ffffff",
                  borderTop: `4px solid ${templateDesign.colors.primary}`,
                }}
              >
                {/* Logo Area */}
                {uploadedImages.length > 0 && (
                  <div className="flex justify-center mb-6">
                    <img
                      src={uploadedImages[0]}
                      alt="logo"
                      className="h-16 object-contain"
                    />
                  </div>
                )}

                {/* Header */}
                <div
                  className="text-center border-b-2 pb-4"
                  style={{ borderColor: templateDesign.colors.accent }}
                >
                  <h1
                    className="text-3xl font-bold mb-2"
                    style={{ color: templateDesign.colors.primary }}
                  >
                    {templateDesign.title}
                  </h1>
                  <p
                    className="text-sm whitespace-pre-line"
                    style={{ color: templateDesign.colors.primary }}
                  >
                    {templateDesign.headerText}
                  </p>
                </div>

                {/* Content Area */}
                <div className="min-h-[300px] space-y-4">
                  <p className="text-slate-700 whitespace-pre-line text-sm">
                    {templateDesign.companyInfo}
                  </p>
                  <div className="h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                    Contenu du document
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="text-center border-t-2 pt-4 text-sm"
                  style={{ color: templateDesign.colors.primary, borderColor: templateDesign.colors.accent }}
                >
                  {templateDesign.footerText}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
