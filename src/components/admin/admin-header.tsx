export function AdminHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="space-y-4 pb-8 border-b-4 border-slate-300">
      <div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {title}
        </h1>
        <div className="h-2 w-48 bg-gradient-to-r from-teal-600 to-amber-600 mt-3"></div>
      </div>
      <p className="text-sm font-medium text-slate-700 max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
}
