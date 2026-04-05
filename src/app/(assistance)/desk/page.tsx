"use client";

import { useState, useMemo } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Users,
  BedDouble,
  DoorOpen,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Search,
  Eye,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type ActivityType = "Consultation" | "Geste" | "Exploration" | "Opération";
type PaymentMethod = "Espèces" | "Carte" | "Assurance" | "Virement";
type PaymentStatus = "Payé" | "Partiel" | "En attente";
type ViewMode = "day" | "week" | "month";

interface Appointment {
  id: string;
  patientName: string;
  patientId: string;
  doctor: string;
  service: string;
  type: ActivityType;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  status: "confirmed" | "pending" | "cancelled";
}

interface Admission {
  id: string;
  patientName: string;
  patientDob: string;
  patientPhone: string;
  insurance: string;
  reason: string;
  room: string;
  admissionDate: string;
  status: "active" | "discharged";
}

interface Payment {
  id: string;
  patientName: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  service: string;
  date: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "apt-1",
    patientName: "Marie Dupont",
    patientId: "P001",
    doctor: "Dr. Martin",
    service: "Cardiologie",
    type: "Consultation",
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: 30,
    status: "confirmed",
  },
  {
    id: "apt-2",
    patientName: "Jean Leclerc",
    patientId: "P002",
    doctor: "Dr. Dupont",
    service: "Pédiatrie",
    type: "Exploration",
    date: new Date().toISOString().split("T")[0],
    time: "10:30",
    duration: 45,
    status: "confirmed",
  },
  {
    id: "apt-3",
    patientName: "Sophie Bernard",
    patientId: "P003",
    doctor: "Dr. Leroy",
    service: "Orthopédie",
    type: "Geste",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    duration: 60,
    status: "confirmed",
  },
  {
    id: "apt-4",
    patientName: "Pierre Martin",
    patientId: "P004",
    doctor: "Dr. Blanc",
    service: "Neurologie",
    type: "Consultation",
    date: new Date().toISOString().split("T")[0],
    time: "15:30",
    duration: 30,
    status: "pending",
  },
  {
    id: "apt-5",
    patientName: "Isabelle Petit",
    patientId: "P005",
    doctor: "Dr. Martin",
    service: "Cardiologie",
    type: "Opération",
    date: new Date().toISOString().split("T")[0],
    time: "16:00",
    duration: 120,
    status: "confirmed",
  },
  {
    id: "apt-6",
    patientName: "Claude Garcia",
    patientId: "P006",
    doctor: "Dr. Dupont",
    service: "Général",
    type: "Consultation",
    date: new Date().toISOString().split("T")[0],
    time: "17:00",
    duration: 30,
    status: "confirmed",
  },
];

const MOCK_ADMISSIONS: Admission[] = [
  {
    id: "adm-1",
    patientName: "Marie Dupont",
    patientDob: "1965-03-15",
    patientPhone: "06 12 34 56 78",
    insurance: "Assurance Maladie",
    reason: "Insuffisance cardiaque",
    room: "C-101",
    admissionDate: "2025-02-20",
    status: "active",
  },
  {
    id: "adm-2",
    patientName: "Jean Leclerc",
    patientDob: "1972-07-22",
    patientPhone: "06 98 76 54 32",
    insurance: "Mutuelle Plus",
    reason: "Fracture du bras",
    room: "O-205",
    admissionDate: "2025-02-18",
    status: "active",
  },
  {
    id: "adm-3",
    patientName: "Sophie Bernard",
    patientDob: "1980-11-05",
    patientPhone: "06 55 66 77 88",
    insurance: "Assurance Maladie",
    reason: "Hospitalisation de jour",
    room: "G-102",
    admissionDate: "2025-02-25",
    status: "active",
  },
  {
    id: "adm-4",
    patientName: "Pierre Martin",
    patientDob: "1958-01-10",
    patientPhone: "06 11 22 33 44",
    insurance: "Ancien Combattant",
    reason: "Suivi post-opératoire",
    room: "N-301",
    admissionDate: "2025-02-19",
    status: "active",
  },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: "pay-1",
    patientName: "Marie Dupont",
    amount: 450,
    method: "Assurance",
    status: "Payé",
    service: "Cardiologie",
    date: "2025-02-25",
  },
  {
    id: "pay-2",
    patientName: "Jean Leclerc",
    amount: 200,
    method: "Carte",
    status: "Partiel",
    service: "Pédiatrie",
    date: "2025-02-24",
  },
  {
    id: "pay-3",
    patientName: "Sophie Bernard",
    amount: 150,
    method: "Espèces",
    status: "En attente",
    service: "Orthopédie",
    date: "2025-02-25",
  },
  {
    id: "pay-4",
    patientName: "Pierre Martin",
    amount: 300,
    method: "Virement",
    status: "En attente",
    service: "Neurologie",
    date: "2025-02-23",
  },
];

const DOCTORS = [
  "Dr. Martin",
  "Dr. Dupont",
  "Dr. Leroy",
  "Dr. Blanc",
];

const SERVICES = [
  "Cardiologie",
  "Pédiatrie",
  "Orthopédie",
  "Neurologie",
  "Général",
];

const ACTIVITY_TYPES: ActivityType[] = [
  "Consultation",
  "Geste",
  "Exploration",
  "Opération",
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTime(hours: number, minutes: number = 0): string {
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getActivityColor(type: ActivityType) {
  switch (type) {
    case "Consultation":
      return "bg-cyan-100 border-l-4 border-cyan-500 text-cyan-900";
    case "Geste":
      return "bg-emerald-100 border-l-4 border-emerald-500 text-emerald-900";
    case "Exploration":
      return "bg-purple-100 border-l-4 border-purple-500 text-purple-900";
    case "Opération":
      return "bg-rose-100 border-l-4 border-rose-500 text-rose-900";
  }
}

function getActivityBgColor(type: ActivityType) {
  switch (type) {
    case "Consultation":
      return "bg-cyan-50 hover:bg-cyan-100";
    case "Geste":
      return "bg-emerald-50 hover:bg-emerald-100";
    case "Exploration":
      return "bg-purple-50 hover:bg-purple-100";
    case "Opération":
      return "bg-rose-50 hover:bg-rose-100";
  }
}

function getPaymentStatusColor(status: PaymentStatus) {
  switch (status) {
    case "Payé":
      return "bg-green-100 text-green-800";
    case "Partiel":
      return "bg-yellow-100 text-yellow-800";
    case "En attente":
      return "bg-slate-100 text-slate-800";
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

function AssistanceSidebar({
  todayAppointmentCount,
  activeAdmissionCount,
  todayDischargeCount,
  pendingPaymentCount,
  onAppointmentClick,
  onAdmissionClick,
  onDischargeClick,
  onPaymentClick,
}: {
  todayAppointmentCount: number;
  activeAdmissionCount: number;
  todayDischargeCount: number;
  pendingPaymentCount: number;
  onAppointmentClick: () => void;
  onAdmissionClick: () => void;
  onDischargeClick: () => void;
  onPaymentClick: () => void;
}) {
  return (
    <aside className="w-72 bg-gradient-to-b from-white to-slate-50 border-r border-slate-200 flex flex-col overflow-y-auto">
      {/* Today's Summary */}
      <div className="p-6 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Résumé du jour
        </h2>

        {/* Stat Boxes */}
        <div className="space-y-3">
          {/* Appointments */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-500 flex items-center justify-center shadow-md">
                  <CalendarDays className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">
                    Rendez-vous
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {todayAppointmentCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Admissions */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-600 flex items-center justify-center shadow-md">
                  <BedDouble className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">
                    Admissions actives
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {activeAdmissionCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Discharges */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-500 flex items-center justify-center shadow-md">
                  <DoorOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">
                    Sorties aujourd'hui
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {todayDischargeCount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payments */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-600 flex items-center justify-center shadow-md">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium">
                    Paiements en attente
                  </p>
                  <p className="text-lg font-bold text-slate-900">
                    {pendingPaymentCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="px-6">
        <div className="border-t border-slate-200"></div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 space-y-3 flex-1">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          Actions rapides
        </h2>

        <button
          onClick={onAppointmentClick}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Rendez-vous
        </button>

        <button
          onClick={onAdmissionClick}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          Admission
        </button>

        <button
          onClick={onDischargeClick}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <DoorOpen className="h-5 w-5" />
          Sortie Patient
        </button>

        <button
          onClick={onPaymentClick}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <CreditCard className="h-5 w-5" />
          Paiement
        </button>
      </div>
    </aside>
  );
}

function AppointmentBlock({
  appointment,
  isDayView,
}: {
  appointment: Appointment;
  isDayView: boolean;
}) {
  const bgColor = getActivityColor(appointment.type);

  if (isDayView) {
    return (
      <div
        className={cn(
          "p-2 rounded border-l-4 text-sm font-medium cursor-pointer hover:shadow-md transition-shadow",
          bgColor
        )}
      >
        <p className="font-bold text-xs">{appointment.time}</p>
        <p className="truncate">{appointment.patientName}</p>
        <p className="text-xs opacity-75">{appointment.doctor}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "px-2 py-1 rounded text-xs font-medium cursor-pointer hover:shadow-md transition-shadow",
        bgColor
      )}
    >
      <p className="truncate">{appointment.patientName}</p>
      <p className="text-xs opacity-75">{appointment.time}</p>
    </div>
  );
}

function DayView({ appointments }: { appointments: Appointment[] }) {
  const doctors = [...new Set(appointments.map((a) => a.doctor))];
  const timeSlots = Array.from({ length: 27 }, (_, i) => {
    const hour = 7 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return { hour, minute, label: formatTime(hour, minute) };
  });

  const dayAppointments = appointments.filter(
    (a) =>
      a.date === new Date().toISOString().split("T")[0] &&
      a.status !== "cancelled"
  );

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white border-b border-slate-200">
          <tr>
            <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-slate-600">
              Heure
            </th>
            {doctors.map((doctor) => (
              <th
                key={doctor}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 border-l border-slate-200"
              >
                {doctor}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot, idx) => (
            <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="w-16 px-4 py-2 text-xs font-medium text-slate-600">
                {slot.label}
              </td>
              {doctors.map((doctor) => {
                const apt = dayAppointments.find(
                  (a) =>
                    a.doctor === doctor &&
                    parseInt(a.time.split(":")[0]) === slot.hour &&
                    parseInt(a.time.split(":")[1]) === slot.minute
                );
                return (
                  <td
                    key={`${doctor}-${slot.label}`}
                    className="px-2 py-2 border-l border-slate-200"
                  >
                    {apt && <AppointmentBlock appointment={apt} isDayView />}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function WeekView({ appointments }: { appointments: Appointment[] }) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + (i - date.getDay()));
    return date;
  });

  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = 7 + i;
    return { hour, label: formatTime(hour) };
  });

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white border-b border-slate-200">
          <tr>
            <th className="w-16 px-4 py-3 text-left text-xs font-semibold text-slate-600">
              Heure
            </th>
            {days.map((day) => (
              <th
                key={day.toISOString()}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 border-l border-slate-200"
              >
                <div className="text-center">
                  <p>{day.toLocaleDateString("fr-FR", { weekday: "short" })}</p>
                  <p className="text-slate-500">
                    {day.getDate()}/{day.getMonth() + 1}
                  </p>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={slot.hour} className="border-b border-slate-200 hover:bg-slate-50">
              <td className="w-16 px-4 py-2 text-xs font-medium text-slate-600">
                {slot.label}
              </td>
              {days.map((day) => {
                const dateStr = day.toISOString().split("T")[0];
                const aptsForSlot = appointments.filter(
                  (a) =>
                    a.date === dateStr &&
                    parseInt(a.time.split(":")[0]) === slot.hour &&
                    a.status !== "cancelled"
                );

                return (
                  <td
                    key={`${dateStr}-${slot.hour}`}
                    className="px-2 py-2 border-l border-slate-200"
                  >
                    <div className="space-y-1">
                      {aptsForSlot.slice(0, 2).map((apt) => (
                        <AppointmentBlock
                          key={apt.id}
                          appointment={apt}
                          isDayView={false}
                        />
                      ))}
                      {aptsForSlot.length > 2 && (
                        <p className="text-xs text-slate-500 font-medium">
                          +{aptsForSlot.length - 2} autres
                        </p>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthView({ appointments }: { appointments: Appointment[] }) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 gap-2 p-4">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center font-semibold text-slate-600 text-sm"
          >
            {day}
          </div>
        ))}

        {days.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const aptsForDay = appointments.filter(
            (a) => a.date === dateStr && a.status !== "cancelled"
          );
          const isCurrentMonth = day.getMonth() === month;

          return (
            <div
              key={dateStr}
              className={cn(
                "min-h-24 p-2 rounded border",
                isCurrentMonth
                  ? "bg-white border-slate-200 hover:bg-slate-50"
                  : "bg-slate-50 border-slate-100"
              )}
            >
              <p
                className={cn(
                  "text-sm font-semibold mb-1",
                  isCurrentMonth ? "text-slate-900" : "text-slate-400"
                )}
              >
                {day.getDate()}
              </p>
              {aptsForDay.length > 0 && (
                <div className="space-y-1">
                  <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                    {aptsForDay.length} rdv
                  </Badge>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarView({
  appointments,
  viewMode,
  onViewModeChange,
  onAddAppointmentClick,
}: {
  appointments: Appointment[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddAppointmentClick: () => void;
}) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendrier</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aujourd'hui: {dateStr}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Switcher */}
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onViewModeChange("day")}
              className={cn(
                "px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200",
                viewMode === "day"
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-900"
              )}
            >
              Jour
            </button>
            <button
              onClick={() => onViewModeChange("week")}
              className={cn(
                "px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200",
                viewMode === "week"
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-900"
              )}
            >
              Semaine
            </button>
            <button
              onClick={() => onViewModeChange("month")}
              className={cn(
                "px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200",
                viewMode === "month"
                  ? "bg-slate-700 text-white shadow-md"
                  : "text-slate-700 hover:text-slate-900"
              )}
            >
              Mois
            </button>
          </div>

          {/* Action Button */}
          <button
            onClick={onAddAppointmentClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white bg-slate-700 hover:bg-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            Rendez-vous
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === "day" && <DayView appointments={appointments} />}
      {viewMode === "week" && <WeekView appointments={appointments} />}
      {viewMode === "month" && <MonthView appointments={appointments} />}
    </div>
  );
}

// ============================================================================
// MODALS
// ============================================================================

function NewAppointmentModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (appointment: Appointment) => void;
}) {
  // Modal styling will be applied via Modal component props
  const [form, setForm] = useState({
    patientName: "",
    patientId: "",
    doctor: DOCTORS[0],
    service: SERVICES[0],
    type: ACTIVITY_TYPES[0] as ActivityType,
    date: new Date().toISOString().split("T")[0],
    time: "09:00",
    duration: 30,
    notes: "",
  });

  const handleSave = () => {
    if (!form.patientName || !form.date || !form.time) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      patientName: form.patientName,
      patientId: form.patientId || `P${Date.now()}`,
      doctor: form.doctor,
      service: form.service,
      type: form.type,
      date: form.date,
      time: form.time,
      duration: form.duration,
      notes: form.notes || undefined,
      status: "confirmed",
    };

    onSave(newAppointment);
    setForm({
      patientName: "",
      patientId: "",
      doctor: DOCTORS[0],
      service: SERVICES[0],
      type: ACTIVITY_TYPES[0],
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      duration: 30,
      notes: "",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouveau rendez-vous"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-slate-700 hover:bg-slate-800 text-white shadow-md hover:shadow-lg">
            Confirmer le rendez-vous
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Patient Info */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Nom du patient
          </label>
          <input
            type="text"
            placeholder="Entrez le nom du patient"
            value={form.patientName}
            onChange={(e) =>
              setForm({ ...form, patientName: e.target.value })
            }
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
          />
        </div>

        {/* Médecin & Service */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Médecin
            </label>
            <select
              value={form.doctor}
              onChange={(e) => setForm({ ...form, doctor: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
            >
              {DOCTORS.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Service
            </label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
            >
              {SERVICES.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Activity Type */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Type d'activité
          </label>
          <div className="grid grid-cols-2 gap-3">
            {ACTIVITY_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, type })}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                  form.type === type
                    ? "ring-2 ring-slate-400 bg-slate-200 text-slate-800"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Heure
            </label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Durée
            </label>
            <select
              value={form.duration}
              onChange={(e) =>
                setForm({ ...form, duration: parseInt(e.target.value) })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition"
            >
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>1h</option>
              <option value={90}>1h30</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Notes (optionnel)
          </label>
          <textarea
            placeholder="Ajoutez des notes supplémentaires..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

function NewAdmissionModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (admission: Admission) => void;
}) {
  const [form, setForm] = useState({
    patientName: "",
    patientDob: "",
    patientPhone: "",
    insurance: "",
    reason: "",
    service: SERVICES[0],
    room: "",
    admissionDate: new Date().toISOString().split("T")[0],
  });

  const handleSave = () => {
    if (
      !form.patientName ||
      !form.patientDob ||
      !form.room ||
      !form.insurance
    ) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const newAdmission: Admission = {
      id: `adm-${Date.now()}`,
      patientName: form.patientName,
      patientDob: form.patientDob,
      patientPhone: form.patientPhone,
      insurance: form.insurance,
      reason: form.reason,
      room: form.room,
      admissionDate: form.admissionDate,
      status: "active",
    };

    onSave(newAdmission);
    setForm({
      patientName: "",
      patientDob: "",
      patientPhone: "",
      insurance: "",
      reason: "",
      service: SERVICES[0],
      room: "",
      admissionDate: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nouvelle admission"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-slate-700 hover:bg-slate-800 text-white shadow-md hover:shadow-lg">
            Enregistrer l'admission
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Patient Info - 2 cols */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Nom du patient"
              value={form.patientName}
              onChange={(e) =>
                setForm({ ...form, patientName: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Date de naissance
            </label>
            <input
              type="date"
              value={form.patientDob}
              onChange={(e) =>
                setForm({ ...form, patientDob: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={form.patientPhone}
              onChange={(e) =>
                setForm({ ...form, patientPhone: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Assurance / Couverture
            </label>
            <input
              type="text"
              placeholder="Ex: Assurance Maladie"
              value={form.insurance}
              onChange={(e) =>
                setForm({ ...form, insurance: e.target.value })
              }
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Motif d'admission
          </label>
          <textarea
            placeholder="Décrivez le motif d'admission..."
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition resize-none"
          />
        </div>

        {/* Service & Room */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Service
            </label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
            >
              {SERVICES.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Chambre / Lit
            </label>
            <input
              type="text"
              placeholder="Ex: C-101"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            />
          </div>
        </div>

        {/* Admission Date */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Date d'admission
          </label>
          <input
            type="date"
            value={form.admissionDate}
            onChange={(e) =>
              setForm({ ...form, admissionDate: e.target.value })
            }
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
          />
        </div>
      </div>
    </Modal>
  );
}

function DischargeModal({
  open,
  onClose,
  onSave,
  admissions,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (id: string, discharge: Partial<Admission>) => void;
  admissions: Admission[];
}) {
  const [form, setForm] = useState({
    patientId: "",
    notes: "",
    followUp: false,
    followUpDate: "",
    followUpDoctor: DOCTORS[0],
  });

  const selectedAdmission = admissions.find((a) => a.id === form.patientId);

  const handleSave = () => {
    if (!form.patientId) {
      alert("Veuillez sélectionner un patient");
      return;
    }

    onSave(form.patientId, {
      status: "discharged",
    });

    setForm({
      patientId: "",
      notes: "",
      followUp: false,
      followUpDate: "",
      followUpDoctor: DOCTORS[0],
    });
    onClose();
  };

  const activeAdmissions = admissions.filter((a) => a.status === "active");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Sortie patient"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-slate-700 hover:bg-slate-800 text-white shadow-md hover:shadow-lg">
            Enregistrer la sortie
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Patient Select */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Patient (admissions actives)
          </label>
          <select
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
          >
            <option value="">Sélectionnez un patient</option>
            {activeAdmissions.map((adm) => (
              <option key={adm.id} value={adm.id}>
                {adm.patientName} - Chambre {adm.room}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Patient Info */}
        {selectedAdmission && (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
            <p className="text-sm text-slate-900">
              <span className="font-semibold">Chambre:</span>{" "}
              {selectedAdmission.room}
            </p>
            <p className="text-sm text-slate-900">
              <span className="font-semibold">Admission:</span>{" "}
              {selectedAdmission.admissionDate}
            </p>
          </div>
        )}

        {/* Discharge Notes */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Notes de sortie
          </label>
          <textarea
            placeholder="Observations, recommandations..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition resize-none"
          />
        </div>

        {/* Follow-up */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.followUp}
              onChange={(e) =>
                setForm({ ...form, followUp: e.target.checked })
              }
              className="w-4 h-4 rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-900">
              Programmer un suivi
            </span>
          </label>

          {form.followUp && (
            <div className="grid grid-cols-2 gap-4 ml-6">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Date de suivi
                </label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) =>
                    setForm({ ...form, followUpDate: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Médecin de suivi
                </label>
                <select
                  value={form.followUpDoctor}
                  onChange={(e) =>
                    setForm({ ...form, followUpDoctor: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
                >
                  {DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function PaymentModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payment: Payment) => void;
}) {
  const [form, setForm] = useState({
    patientName: "",
    service: SERVICES[0],
    amount: "",
    method: "Carte" as PaymentMethod,
    status: "Payé" as PaymentStatus,
  });

  const handleSave = () => {
    if (!form.patientName || !form.amount || !form.service) {
      alert("Veuillez remplir tous les champs requis");
      return;
    }

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      patientName: form.patientName,
      service: form.service,
      amount: parseFloat(form.amount),
      method: form.method,
      status: form.status,
      date: new Date().toISOString().split("T")[0],
    };

    onSave(newPayment);
    setForm({
      patientName: "",
      service: SERVICES[0],
      amount: "",
      method: "Carte",
      status: "Payé",
    });
    onClose();
  };

  const paymentMethods: PaymentMethod[] = [
    "Espèces",
    "Carte",
    "Assurance",
    "Virement",
  ];
  const paymentStatuses: PaymentStatus[] = ["Payé", "Partiel", "En attente"];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Enregistrement paiement"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} className="bg-slate-700 hover:bg-slate-800 text-white shadow-md hover:shadow-lg">
            Enregistrer le paiement
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Patient Name */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Nom du patient
          </label>
          <input
            type="text"
            placeholder="Entrez le nom du patient"
            value={form.patientName}
            onChange={(e) =>
              setForm({ ...form, patientName: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
          />
        </div>

        {/* Service & Amount */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Service / Prestation
            </label>
            <select
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            >
              {SERVICES.map((svc) => (
                <option key={svc} value={svc}>
                  {svc}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Montant (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-500/20 outline-none transition"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Mode de paiement
          </label>
          <div className="grid grid-cols-2 gap-3">
            {paymentMethods.map((method) => (
              <button
                key={method}
                onClick={() => setForm({ ...form, method })}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                  form.method === method
                    ? "ring-2 ring-slate-400 bg-slate-200 text-slate-800"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-slate-900 mb-2">
            Statut du paiement
          </label>
          <div className="grid grid-cols-3 gap-3">
            {paymentStatuses.map((status) => (
              <button
                key={status}
                onClick={() => setForm({ ...form, status })}
                className={cn(
                  "px-4 py-2 rounded-xl font-medium text-sm transition-all",
                  form.status === status
                    ? "ring-2 ring-slate-400 bg-slate-200 text-slate-800"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function DeskPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(
    MOCK_APPOINTMENTS
  );
  const [admissions, setAdmissions] = useState<Admission[]>(MOCK_ADMISSIONS);
  const [payments, setPayments] = useState<Payment[]>(MOCK_PAYMENTS);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [newAppointmentModalOpen, setNewAppointmentModalOpen] = useState(false);
  const [newAdmissionModalOpen, setNewAdmissionModalOpen] = useState(false);
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  // Calculate stats
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => a.date === today && a.status !== "cancelled"
      ).length,
    [appointments]
  );
  const activeAdmissions = useMemo(
    () => admissions.filter((a) => a.status === "active").length,
    [admissions]
  );
  const todayDischarges = useMemo(
    () => payments.filter((p) => p.date === today).length,
    [payments]
  );
  const pendingPayments = useMemo(
    () => payments.filter((p) => p.status === "En attente").length,
    [payments]
  );

  // Handlers
  const handleAddAppointment = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
  };

  const handleAddAdmission = (admission: Admission) => {
    setAdmissions([...admissions, admission]);
  };

  const handleDischargePatient = (id: string, discharge: Partial<Admission>) => {
    setAdmissions(
      admissions.map((a) => (a.id === id ? { ...a, ...discharge } : a))
    );
  };

  const handleAddPayment = (payment: Payment) => {
    setPayments([...payments, payment]);
  };

  return (
    <div className="flex h-full gap-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Sidebar */}
      <AssistanceSidebar
        todayAppointmentCount={todayAppointments}
        activeAdmissionCount={activeAdmissions}
        todayDischargeCount={todayDischarges}
        pendingPaymentCount={pendingPayments}
        onAppointmentClick={() => setNewAppointmentModalOpen(true)}
        onAdmissionClick={() => setNewAdmissionModalOpen(true)}
        onDischargeClick={() => setDischargeModalOpen(true)}
        onPaymentClick={() => setPaymentModalOpen(true)}
      />

      {/* Calendar */}
      <CalendarView
        appointments={appointments}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddAppointmentClick={() => setNewAppointmentModalOpen(true)}
      />

      {/* Modals */}
      <NewAppointmentModal
        open={newAppointmentModalOpen}
        onClose={() => setNewAppointmentModalOpen(false)}
        onSave={handleAddAppointment}
      />

      <NewAdmissionModal
        open={newAdmissionModalOpen}
        onClose={() => setNewAdmissionModalOpen(false)}
        onSave={handleAddAdmission}
      />

      <DischargeModal
        open={dischargeModalOpen}
        onClose={() => setDischargeModalOpen(false)}
        onSave={handleDischargePatient}
        admissions={admissions}
      />

      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSave={handleAddPayment}
      />
    </div>
  );
}
