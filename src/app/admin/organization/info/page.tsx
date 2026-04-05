"use client";

import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Clock,
  Users,
  FileText,
  Save,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/admin/admin-header";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  taxId: string;
  registrationNumber: string;
  establishmentType: string;
  operatingHours: string;
  description: string;
}

export default function OrganizationInfoPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "Hôpital Central de Casablanca",
    email: "contact@hopital-central.ma",
    phone: "+212 522 123 456",
    website: "www.hopital-central.ma",
    address: "123 Rue de la Santé",
    city: "Casablanca",
    zipCode: "20000",
    country: "Morocco",
    taxId: "1234567890",
    registrationNumber: "HOP-2024-001",
    establishmentType: "Hôpital Privé",
    operatingHours: "24/7",
    description: "Centre hospitalier leader en soins médicaux et chirurgicaux",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleCancel = () => {
    setHasChanges(false);
    setSaved(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <AdminHeader
        title="Organisation"
        subtitle="Gérez les informations de votre établissement médical"
      />

      <div className="space-y-4">

        {/* Success Alert */}
        {saved && (
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg animate-in fade-in">
            <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-800">
              <p className="font-semibold">Changements enregistrés</p>
              <p>Les informations de votre établissement ont été mises à jour avec succès</p>
            </div>
          </div>
        )}

        {/* Warning Alert */}
        {hasChanges && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Modifications non enregistrées</p>
              <p>N'oubliez pas d'enregistrer vos modifications avant de quitter</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Info Cards */}
        <div className="lg:col-span-1 space-y-4">
          {/* Organization Overview Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 shadow-lg">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-indigo-200 opacity-20 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-600">Établissement</h3>
                  <p className="text-lg font-bold text-slate-900">{formData.name}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-slate-200 pt-4">
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Type</p>
                    <p className="text-sm font-semibold text-slate-900">{formData.establishmentType}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-slate-500">Horaires</p>
                    <p className="text-sm font-semibold text-slate-900">{formData.operatingHours}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <Mail className="h-5 w-5 text-blue-600" />
              Contact
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500">Email</p>
                <p className="mt-1 text-sm font-medium text-slate-900 break-all">
                  {formData.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Téléphone</p>
                <p className="mt-1 text-sm font-medium text-slate-900">{formData.phone}</p>
              </div>
              {formData.website && (
                <div>
                  <p className="text-xs font-medium text-slate-500">Site Web</p>
                  <p className="mt-1 text-sm font-medium text-blue-600">{formData.website}</p>
                </div>
              )}
            </div>
          </div>

          {/* Location Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <MapPin className="h-5 w-5 text-red-600" />
              Localisation
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">{formData.address}</p>
              <p className="text-sm text-slate-600">
                {formData.zipCode} {formData.city}
              </p>
              <p className="text-sm text-slate-600">{formData.country}</p>
            </div>
          </div>

          {/* Legal Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
              <FileText className="h-5 w-5 text-amber-600" />
              Identité Légale
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-slate-500">N° ID Fiscal</p>
                <p className="mt-1 text-sm font-medium text-slate-900 font-mono">{formData.taxId}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">N° Enregistrement</p>
                <p className="mt-1 text-sm font-medium text-slate-900 font-mono">
                  {formData.registrationNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  Informations Générales
                </CardTitle>
                <CardDescription>Détails fondamentaux de votre établissement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nom de l'établissement <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Hôpital Central"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Type d'établissement
                    </label>
                    <select
                      name="establishmentType"
                      value={formData.establishmentType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      <option>Hôpital Privé</option>
                      <option>Hôpital Public</option>
                      <option>Clinique Privée</option>
                      <option>Centre Médical</option>
                      <option>Cabinet de Groupe</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Décrivez brièvement votre établissement..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Section */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Coordonnées
                </CardTitle>
                <CardDescription>Moyens de contact de votre établissement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@hopital.com"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Téléphone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+212 5XX XXX XXX"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Site Web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="www.hopital.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Horaires d'ouverture
                  </label>
                  <input
                    type="text"
                    name="operatingHours"
                    value={formData.operatingHours}
                    onChange={handleChange}
                    placeholder="24/7 ou 08:00-17:00"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Section */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  Adresse
                </CardTitle>
                <CardDescription>Localisation de votre établissement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Rue <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="123 Rue de la Santé"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Ville <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Casablanca"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Code Postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="20000"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Pays
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                    >
                      <option>Morocco</option>
                      <option>France</option>
                      <option>Belgium</option>
                      <option>Canada</option>
                      <option>Tunisia</option>
                      <option>Algeria</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Information Section */}
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Identité Légale
                </CardTitle>
                <CardDescription>Numéros d'identification fiscale et légale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      N° ID Fiscal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={formData.taxId}
                      onChange={handleChange}
                      placeholder="1234567890"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      N° Enregistrement
                    </label>
                    <input
                      type="text"
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="REG-2024-001"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white font-mono"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur py-4 px-4 rounded-lg border border-slate-200 shadow-lg">
              <Button
                type="submit"
                className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold"
              >
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les modifications
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!hasChanges}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
