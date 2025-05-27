import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Định dạng ngày tháng theo định dạng Việt Nam
 * @param dateString Chuỗi ngày tháng cần định dạng
 * @returns Chuỗi ngày tháng đã được định dạng
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}