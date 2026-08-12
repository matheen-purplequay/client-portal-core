import { getUserData as getUserFromStore } from '@/stores/userStore';
import type { UserData } from '@/types';

export function getUserData(): UserData | null {
  return getUserFromStore();
}

export function isAdmin(): boolean {
  const user = getUserData();
  return user?.role === 'admin';
}

export function splitName(fullName: string) {
  if (!fullName) return { firstName: '', middleName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], middleName: '', lastName: '' };
  if (parts.length === 2) return { firstName: parts[0], middleName: '', lastName: parts[1] };
  if (parts.length === 3) return { firstName: parts[0], middleName: parts[1], lastName: parts[2] };
  return { firstName: parts.slice(0, -1).join(' '), middleName: '', lastName: parts[parts.length - 1] };
}
