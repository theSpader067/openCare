import { Spinner } from "@/components/ui/spinner";

export default function MessagesLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner label="Chargement des messages..." />
    </div>
  );
}
