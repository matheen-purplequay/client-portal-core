import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useClientStore } from '@/store/useClientStore';
import { clientsService } from '@/services/clients.service';
import { getUserData, isAdmin } from '@/hooks/useUserData';
import { useToast } from '@/components/ui/toast';
import type { Company, WMClient } from '@/types';

import { CompanySetup } from '../company-setup/CompanySetup';
import { CompanyRules } from '../company-rules/CompanyRules';
import { ClientSetup } from '../client-setup/ClientSetup';
import { ClientTeams } from '../client-teams/ClientTeams';
import { ClientReviewers } from '../client-reviewers/ClientReviewers';

const TABS = [
  { key: 'setup', label: 'Setup' },
  { key: 'settings', label: 'Settings' },
  { key: 'users', label: 'Users' },
  { key: 'teams', label: 'Teams' },
  { key: 'reviewers', label: 'Reviewers' },
] as const;

export function ClientMaster() {
  const store = useClientStore();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSyncMode, setIsSyncMode] = useState(false);
  const [wmClients, setWmClients] = useState<WMClient[]>([]);
  const [filteredWMClients, setFilteredWMClients] = useState<WMClient[]>([]);
  const [isFetchingWMClients, setIsFetchingWMClients] = useState(false);
  const [isSyncingClient, setIsSyncingClient] = useState(false);
  const [wmSearchTerm, setWmSearchTerm] = useState('');

  // ── Fetch Portal clients ────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    const user = getUserData();
    if (!user) return;
    store.setIsFetchingClients(true);
    try {
      const res = await clientsService.getCPClients({ user_id: user.user_id });
      const data = res.data;
      if (data.status) {
        store.setClients(data.companies);
        if (data.companies.length > 0) {
          store.setSelectedClient(data.companies[0]);
          setCurrentIndex(0);
          fetchCompany(data.companies[0]);
        }
      }
    } finally {
      store.setIsFetchingClients(false);
    }
  }, []);

  // ── Fetch company details for selected client ───────────────────
  const fetchCompany = useCallback(async (client: Company) => {
    store.setIsFetchingClient(true);
    store.setExistingCompany(null);
    try {
      const res = await clientsService.getCompanyFromDashboard({ project_id: client.works_manager_client_id });
      const data = res.data;
      if (data.status) {
        store.setExistingCompany(data.data.company);
        store.setSelectedClient(data.data.company);
        store.setCompanyServices(data.data.engagementVerticals);
        store.setDoesClientExists(data.does_company_exists);
      } else {
        store.setDoesClientExists(data.does_company_exists ?? false);
        store.setExistingCompany(null);
      }
    } finally {
      store.setIsFetchingClient(false);
    }
  }, []);

  // ── Fetch WM clients ────────────────────────────────────────────
  const fetchWMClients = useCallback(async () => {
    setIsFetchingWMClients(true);
    try {
      const res = await clientsService.getAllClientsFromWM();
      const data = res.data;
      if (data.status && data.data.length > 0) {
        setWmClients(data.data);
        setFilteredWMClients(data.data);
      }
    } finally {
      setIsFetchingWMClients(false);
    }
  }, []);

  // ── Sync client from WM ─────────────────────────────────────────
  const copyCompanyFromWM = async (projectId: number, clientName: string, companyId: number, masterCompanyName: string) => {
    if (companyId === 0) return;
    if (!confirm(`Are you sure you want to sync client ${clientName} to ${masterCompanyName}?`)) return;

    setIsSyncingClient(true);
    try {
      await clientsService.addCompanyDetails({
        project_id: projectId,
        dashboards: '1',
        test_dashboards: '1',
        master_company_id: companyId,
        industry_type: 'Finance',
        client_type: 'client',
        engagementVerticals: [
          { wm_vertical_id: 1, title: 'Business Services', id: 1, engagement_id: 1, order_number: 0, service_id: 1 },
        ],
      });
      toast.success('Selected client synced to Client Portal database');
      setWmClients((prev) => prev.filter((c) => c.Pid !== projectId));
      setFilteredWMClients((prev) => prev.filter((c) => c.Pid !== projectId));
      setIsSyncMode(false);
      fetchClients();
    } catch {
      toast.error('Could not sync selected client');
    } finally {
      setIsSyncingClient(false);
    }
  };

  // ── Init ────────────────────────────────────────────────────────
  useEffect(() => {
    store.setIsAdmin(isAdmin());
    fetchClients();
  }, []);

  // ── Search filter ───────────────────────────────────────────────
  const filteredClients = searchTerm
    ? store.clients.filter((c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : store.clients;

  // ── Reset selection when searching ──────────────────────────────
  useEffect(() => {
    if (searchTerm) {
      store.setSelectedClient(null);
      setCurrentIndex(-1);
    }
  }, [searchTerm]);

  // ── WM Search filter ────────────────────────────────────────────
  useEffect(() => {
    if (wmSearchTerm) {
      setFilteredWMClients(wmClients.filter((c) => c.ClientName.toLowerCase().includes(wmSearchTerm.toLowerCase())));
    } else {
      setFilteredWMClients(wmClients);
    }
  }, [wmSearchTerm, wmClients]);

  const handleSyncModeToggle = (mode: boolean) => {
    setIsSyncMode(mode);
    if (mode) fetchWMClients();
  };

  const handleSelectClient = (client: Company, index: number) => {
    if (store.isEdited) return;
    store.setSelectedClient(client);
    setCurrentIndex(index);
    fetchCompany(client);
  };

  const resetSearch = () => {
    setSearchTerm('');
    if (store.clients.length > 0) {
      store.setSelectedClient(store.clients[0]);
      setCurrentIndex(0);
      fetchCompany(store.clients[0]);
    }
  };

  const renderTabContent = () => {
    if (!store.existingCompany) return null;

    switch (store.activeTab) {
      case 'setup':
        return <CompanySetup />;
      case 'settings':
        return <CompanyRules />;
      case 'users':
        return <ClientSetup />;
      case 'teams':
        return <ClientTeams />;
      case 'reviewers':
        return <ClientReviewers />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 w-full">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {isSyncMode ? 'Sync from Works Manager' : 'Client Management'}
              </CardTitle>
              <CardDescription>
                {isSyncMode
                  ? 'Add clients from Works Manager to Portal.'
                  : 'Choose a client to manage everything.'}
              </CardDescription>
            </div>
            <div className="flex gap-1 border rounded-md p-0.5">
              <Button
                variant={!isSyncMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSyncModeToggle(false)}
              >
                Portal
              </Button>
              <Button
                variant={isSyncMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSyncModeToggle(true)}
              >
                Works Manager
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            {/* ── Client Sidebar ─────────────────────────────────── */}
            <div className={`col-span-4 rounded-md overflow-hidden ${store.isEdited ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className='border rounded-md overflow-hidden'>
                <div className="sticky top-0 rounded border-b bg-background z-10 px-2 py-1.5 flex items-center gap-1">
                  <Input
                    placeholder="Search client"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8"
                  />
                  {searchTerm && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={resetSearch}>
                      <span className="text-sm">x</span>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={fetchClients} title="Refresh">
                    <span className="text-sm">&#8635;</span>
                  </Button>
                </div>
                <ScrollArea className="h-150">
                  {store.isFetchingClients ? (
                    <div className="flex items-center justify-center h-full py-8 text-muted-foreground text-sm">
                      Loading clients...
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredClients.map((c, i) => (
                        <button
                          key={c.id ?? i}
                          onClick={() => handleSelectClient(c, i)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            currentIndex === i ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* ── Main Content ────────────────────────────────────── */}
            <div className="col-span-8">
              {isSyncMode ? (
                /* ── WM Sync View ──────────────────────────────── */
                <div className={`border rounded-md ${isSyncingClient ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="sticky top-0 bg-background z-10 border-b px-2 py-1.5 flex items-center gap-1">
                    <Input
                      placeholder="Search WM client"
                      value={wmSearchTerm}
                      onChange={(e) => setWmSearchTerm(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 h-8"
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={fetchWMClients} title="Refresh">
                      <span className="text-sm">&#8635;</span>
                    </Button>
                  </div>
                  <ScrollArea className="h-[500px]">
                    {isFetchingWMClients ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        Loading Works Manager clients...
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredWMClients.map((c, i) => (
                          <div key={c.Pid} className={`flex items-center justify-between px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-muted/30' : ''}`}>
                            <span>{c.ClientName}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyCompanyFromWM(c.Pid, c.ClientName, 1, 'Carisma Solutions')}
                            >
                              Add to Portal
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              ) : (
                /* ── Portal Client Management ──────────────────── */
                <>
                  {store.selectedClient ? (
                    <div>
                      {store.doesClientExists && (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <h2 className="text-lg font-medium">{store.selectedClient.name}</h2>
                            {store.isEdited && (
                              <Badge variant="destructive" className="text-xs">Unsaved changes</Badge>
                            )}
                          </div>
                          <Tabs
                            value={store.activeTab}
                            onValueChange={store.setActiveTab}
                            className={`${store.isEdited ? 'opacity-50 pointer-events-none' : ''} transition-all duration-300`}
                          >
                            <TabsList>
                              {TABS.map((tab) => (
                                <TabsTrigger key={tab.key} value={tab.key}>
                                  <div className={`transition-all duration-300 ${store.activeTab === tab.key ? 'text-primary px-2' : 'text-muted-foreground'}`}>{tab.label}</div>
                                </TabsTrigger>
                              ))}
                            </TabsList>
                          </Tabs>
                          <Separator className="my-3" />
                        </>
                      )}

                      {store.isFetchingClient ? (
                        <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                          Loading company details...
                        </div>
                      ) : (
                        renderTabContent()
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground gap-2 py-12">
                      <span>&larr;</span> Choose a client from the list...
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
