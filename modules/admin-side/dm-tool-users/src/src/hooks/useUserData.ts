import { getUserData as getUserFromStore } from '@/stores/userStore';
import type { UserData } from '@/types';

export function getUserData(): UserData | null {
  return getUserFromStore();
}

export function isAdmin(): boolean {
  const user = getUserData();
  return user?.role === 'admin';
}
