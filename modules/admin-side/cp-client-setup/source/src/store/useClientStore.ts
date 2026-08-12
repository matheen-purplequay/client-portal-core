import { create } from 'zustand';
import type { Company, EngagementVertical, WMClient } from '@/types';

interface ClientStore {
  // Client list
  clients: Company[];
  wmClients: WMClient[];
  selectedClient: Company | null;
  existingCompany: Company | null;
  companyServices: EngagementVertical[];
  doesClientExists: boolean;

  // Loading
  isFetchingClients: boolean;
  isFetchingClient: boolean;

  // Sync mode
  isSyncMode: boolean;

  // Edit state — prevents client switching when child has unsaved changes
  isEdited: boolean;

  // Admin
  isAdmin: boolean;

  // Active tab
  activeTab: string;

  // Actions
  setClients: (clients: Company[]) => void;
  setWMClients: (clients: WMClient[]) => void;
  setSelectedClient: (client: Company | null) => void;
  setExistingCompany: (company: Company | null) => void;
  setCompanyServices: (services: EngagementVertical[]) => void;
  setDoesClientExists: (exists: boolean) => void;
  setIsFetchingClients: (val: boolean) => void;
  setIsFetchingClient: (val: boolean) => void;
  setIsSyncMode: (val: boolean) => void;
  setIsEdited: (val: boolean) => void;
  setIsAdmin: (val: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export const useClientStore = create<ClientStore>((set) => ({
  clients: [],
  wmClients: [],
  selectedClient: null,
  existingCompany: null,
  companyServices: [],
  doesClientExists: false,
  isFetchingClients: false,
  isFetchingClient: false,
  isSyncMode: false,
  isEdited: false,
  isAdmin: false,
  activeTab: 'setup',

  setClients: (clients) => set({ clients }),
  setWMClients: (wmClients) => set({ wmClients }),
  setSelectedClient: (selectedClient) => set({ selectedClient }),
  setExistingCompany: (existingCompany) => set({ existingCompany }),
  setCompanyServices: (companyServices) => set({ companyServices }),
  setDoesClientExists: (doesClientExists) => set({ doesClientExists }),
  setIsFetchingClients: (isFetchingClients) => set({ isFetchingClients }),
  setIsFetchingClient: (isFetchingClient) => set({ isFetchingClient }),
  setIsSyncMode: (isSyncMode) => set({ isSyncMode }),
  setIsEdited: (isEdited) => set({ isEdited }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));
