import { Spinner } from "@/components/ui/spinner";

export default function SettingsLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label="Chargement des paramètres..." />
    </div>
  );
}
