import { cn } from "@/lib/utils";

export function AdminTableContainer({
  title,
  subtitle,
  children,
  viewMoreLink,
  viewMoreText = "VER MAS",
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  viewMoreLink?: string;
  viewMoreText?: string;
}) {
  return (
    <div className="bg-white border-2 border-slate-300 shadow-sm overflow-hidden">
      <div className="p-8 border-b-2 border-slate-300 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-wide">
            {title}
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            {subtitle}
          </p>
        </div>
        {viewMoreLink && (
          <a
            href={viewMoreLink}
            className="text-teal-700 hover:text-teal-900 font-bold text-sm transition-colors whitespace-nowrap ml-4 border-b-2 border-teal-700 pb-1"
          >
            {viewMoreText}
          </a>
        )}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

export function AdminTable({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <table className="w-full">
      {children}
    </table>
  );
}

export function AdminTableHeader({
  columns,
}: {
  columns: string[];
}) {
  return (
    <thead className="bg-slate-100 border-b-2 border-slate-300">
      <tr>
        {columns.map((col) => (
          <th
            key={col}
            className="px-6 py-4 text-left text-xs font-black text-slate-900 uppercase tracking-wider"
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function AdminTableBody({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <tbody className="divide-y divide-slate-200">
      {children}
    </tbody>
  );
}

export function AdminTableRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-200">
      {children}
    </tr>
  );
}

export function AdminTableCell({
  children,
  bold = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <td className={cn("px-6 py-4 text-sm", bold ? "font-bold text-slate-900" : "text-slate-700")}>
      {children}
    </td>
  );
}

type BadgeColor = "teal" | "amber" | "blue";

const badgeStyles: Record<BadgeColor, string> = {
  teal: "bg-teal-100 text-teal-700 border-teal-300",
  amber: "bg-amber-100 text-amber-700 border-amber-300",
  blue: "bg-blue-100 text-blue-700 border-blue-300",
};

export function AdminBadge({
  children,
  color = "teal",
}: {
  children: React.ReactNode;
  color?: BadgeColor;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-2",
        badgeStyles[color]
      )}
    >
      {children}
    </span>
  );
}
