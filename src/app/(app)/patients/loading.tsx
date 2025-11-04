import { Spinner } from "@/components/ui/spinner";

export default function PatientsLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label="Chargement des dossiers patients..." />
    </div>
  );
}
