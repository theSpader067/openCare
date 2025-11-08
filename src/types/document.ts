/**
 * Shared types for document-like pages (comptes-rendus, ordonnances, avis)
 * These types define the common structure for pages with list + detail pattern
 */

export type Patient = {
  id: string;
  fullName: string;
  [key: string]: any; // Allow page-specific patient fields
};

export type DocumentItem = {
  id: string;
  title: string;
  date: string;
  patient?: Patient;
  createdAt: string;
  createdBy: string;
  [key: string]: any; // Allow page-specific fields
};

export type ListItemDisplayField = {
  label: string;
  value: string | number;
  className?: string;
};

export type CreateFormField = {
  name: string;
  label: string;
  type: "text" | "date" | "number" | "textarea" | "select" | "custom";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: Array<{ value: string; label: string }>;
  className?: string;
};

export type DetailSectionConfig = {
  title: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "info";
  fields: {
    label: string;
    value: string | React.ReactNode;
    inline?: boolean;
  }[];
};
