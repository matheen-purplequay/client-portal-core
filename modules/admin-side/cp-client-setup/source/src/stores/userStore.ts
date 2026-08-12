import type { UserData } from '@/types';

let currentUserData: UserData | null = null;

export function setUserData(data: UserData) {
  currentUserData = data;
}

export function getUserData(): UserData | null {
  return currentUserData;
}
