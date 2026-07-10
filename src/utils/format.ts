import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";

// ============================================================
// DATE FORMATTING
// ============================================================

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "—";
  return format(parsed, "MMM dd, yyyy");
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "—";
  return format(parsed, "MMM dd, yyyy · h:mm a");
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  const parsed = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(parsed)) return "—";
  return formatDistanceToNow(parsed, { addSuffix: true });
}

export function formatMonth(date: string | Date): string {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return format(parsed, "MMM yyyy");
}

// ============================================================
// NUMBER FORMATTING
// ============================================================

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercentage(value: number, total: number): string {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ============================================================
// STRING UTILITIES
// ============================================================

export function truncate(str: string, length: number = 80): string {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ============================================================
// AVATAR / STORAGE
// ============================================================

export function getAvatarUrl(url: string | null | undefined): string | undefined {
  return url ?? undefined;
}

export function buildStorageUrl(bucket: string, path: string): string {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// ============================================================
// MISC
// ============================================================

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function parseError(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return "An unexpected error occurred";
}
