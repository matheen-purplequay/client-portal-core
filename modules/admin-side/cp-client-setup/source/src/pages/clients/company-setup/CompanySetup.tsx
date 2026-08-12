import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClientStore } from '@/store/useClientStore';
import { clientsService } from '@/services/clients.service';
import { teamsService } from '@/services/teams.service';
import { masterService } from '@/services/master.service';
import { getUserData } from '@/hooks/useUserData';
import { useToast } from '@/components/ui/toast';
import type { Dashboard, Vertical, EngagementVertical, PrimaryJobStatus, SecondaryJobStatus, MappedStatus } from '@/types';

interface Engagement {
  index: number;
  label: string;
}

const ENGAGEMENTS: Engagement[] = [
  { index: 1, label: 'Staff' },
  { index: 2, label: 'Hourly' },
  { index: 3, label: 'Agreed' },
];

const INDUSTRY_TYPES = [
  'Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing',
  'Education', 'Entertainment', 'Hospitality', 'Real Estate',
  'Transportation', 'Energy', 'Agriculture', 'Other',
];

const MASTER_COMPANIES: Record<number, string> = {
  1: 'Carisma Solutions',
  2: 'Purple Quay',
  3: 'Carisma Solutions - Purple Quay',
};

export function CompanySetup() {
  const { existingCompany, companyServices, isAdmin, setIsEdited, setExistingCompany, setCompanyServices, setDoesClientExists } = useClientStore();
  const toast = useToast();

  // ── Local state ─────────────────────────────────────────────────
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([]);
  const [selectedTestingDashboards, setSelectedTestingDashboards] = useState<string[]>([]);
  const [engagementVerticals, setEngagementVerticals] = useState<EngagementVertical[]>([]);
  const [selectedEngagement, setSelectedEngagement] = useState(ENGAGEMENTS[0]);
  const [industryType, setIndustryType] = useState('Finance');
  const [masterCompanyId, setMasterCompanyId] = useState(1);
  const [isEdited, setLocalIsEdited] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedVertical, setDraggedVertical] = useState<Vertical | null>(null);

  // ── Job Status ──────────────────────────────────────────────────
  const [primaryStatuses, setPrimaryStatuses] = useState<PrimaryJobStatus[]>([]);
  const [secondaryStatuses, setSecondaryStatuses] = useState<SecondaryJobStatus[]>([]);
  const [selectedSecondaryStatus, setSelectedSecondaryStatus] = useState<SecondaryJobStatus | null>(null);
  const [mappedStatuses, setMappedStatuses] = useState<Record<number, MappedStatus[]>>({});
  const [isMappingStatus, setIsMappingStatus] = useState(false);
  const [draggedStatus, setDraggedStatus] = useState<{ code: number; type: 'primary' | 'mapped' } | null>(null);

  const markEdited = (val: boolean) => {
    setLocalIsEdited(val);
    setIsEdited(val);
  };

  // ── Fetch dashboards & verticals on mount ───────────────────────
  useEffect(() => {
    masterService.getDashboardMaster().then((res) => {
      if (res.data?.data) setDashboards(res.data.data);
    });
    teamsService.getVerticals().then((res) => {
      if (res.data?.status) {
        const v = res.data.data
          .map(({ id, wm_vertical_id, title }: Vertical) => ({ id, wm_vertical_id, title }))
          .filter((v: Vertical) => v.wm_vertical_id !== 0);
        setVerticals(v);
      }
    });
  }, []);

  // ── When company changes, populate form ─────────────────────────
  useEffect(() => {
    if (!existingCompany) return;
    setSelectedDashboards(existingCompany.dashboards?.split(',') ?? []);
    setSelectedTestingDashboards(existingCompany.test_dashboards?.split(',') ?? []);
    setMasterCompanyId(existingCompany.master_company_id);
    setIndustryType(existingCompany.industry_type ?? 'Finance');
    markEdited(false);
    fetchJobStatus();
  }, [existingCompany?.id]);

  useEffect(() => {
    if (companyServices) setEngagementVerticals(companyServices);
  }, [companyServices]);

  // ── Fetch company ───────────────────────────────────────────────
  const fetchCompany = useCallback(async () => {
    if (!existingCompany) return;
    try {
      const res = await clientsService.getCompanyFromDashboard({ project_id: existingCompany.works_manager_client_id });
      const data = res.data;
      if (data.status) {
        setExistingCompany(data.data.company);
        setCompanyServices(data.data.engagementVerticals);
        setDoesClientExists(data.does_company_exists);
      }
    } catch { /* ignore */ }
  }, [existingCompany?.works_manager_client_id]);

  // ── Sync company ────────────────────────────────────────────────
  const syncCompanyDetails = async () => {
    if (!existingCompany) return;
    try {
      await clientsService.syncBasicCompanyDetails({ client_id: existingCompany.id });
      toast.success('Company details synced');
      fetchCompany();
    } catch {
      toast.error('Something went wrong while syncing');
    }
  };

  // ── Dashboard toggles ──────────────────────────────────────────
  const toggleDashboard = (code: number) => {
    markEdited(true);
    const str = code.toString();
    setSelectedDashboards((prev) =>
      prev.includes(str) ? prev.filter((d) => d !== str) : [...prev, str]
    );
  };

  const toggleTestingDashboard = (code: number) => {
    markEdited(true);
    const str = code.toString();
    setSelectedTestingDashboards((prev) =>
      prev.includes(str) ? prev.filter((d) => d !== str) : [...prev, str]
    );
  };

  // ── Drag & Drop verticals ─────────────────────────────────────
  const filteredEngagementVerticals = engagementVerticals.filter(
    (ev) => ev.engagement_id === selectedEngagement.index
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedVertical) return;
    const exists = engagementVerticals.some(
      (ev) => ev.wm_vertical_id === draggedVertical.wm_vertical_id && ev.engagement_id === selectedEngagement.index
    );
    if (!exists) {
      setEngagementVerticals((prev) => [
        ...prev,
        {
          ...draggedVertical,
          service_id: draggedVertical.id,
          engagement_id: selectedEngagement.index,
          order_number: 0,
        },
      ]);
      markEdited(true);
    }
    setDraggedVertical(null);
  };

  const handleRemoveDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedVertical) return;
    setEngagementVerticals((prev) =>
      prev.filter(
        (ev) => !(ev.wm_vertical_id === draggedVertical.wm_vertical_id && ev.engagement_id === selectedEngagement.index)
      )
    );
    markEdited(true);
    setDraggedVertical(null);
  };

  // ── Job Status ──────────────────────────────────────────────────
  const fetchJobStatus = async () => {
    if (!existingCompany) return;
    masterService.getPrimaryJobStatus().then((res) => setPrimaryStatuses(res.data?.data ?? []));
    masterService.getSecondaryJobStatus().then((res) => {
      const list = res.data?.data ?? [];
      setSecondaryStatuses(list);
      if (list.length > 0) setSelectedSecondaryStatus(list[0]);
    });
    fetchMappedStatuses();
  };

  const fetchMappedStatuses = async () => {
    if (!existingCompany) return;
    setIsMappingStatus(true);
    try {
      const res = await masterService.getMappedStatusList({ project_id: existingCompany.works_manager_client_id });
      setMappedStatuses(res.data?.data ?? {});
    } finally {
      setIsMappingStatus(false);
    }
  };

  const mapStatus = async (primaryCode: number) => {
    if (!existingCompany || !selectedSecondaryStatus) return;
    setIsMappingStatus(true);
    const user = getUserData();
    try {
      await masterService.mapPrimaryToSecondaryStatus({
        project_id: existingCompany.works_manager_client_id,
        primary_status: primaryCode,
        secondary_status: selectedSecondaryStatus.Code,
        user_id: user?.user_id,
      });
      fetchMappedStatuses();
    } finally {
      setIsMappingStatus(false);
    }
  };

  const removeStatusMapping = async (code: number) => {
    setIsMappingStatus(true);
    try {
      await masterService.removePrimaryStatusMapping({ code });
      fetchMappedStatuses();
    } finally {
      setIsMappingStatus(false);
    }
  };

  // ── Job Status Drag & Drop ─────────────────────────────────────
  const handleStatusDropToMapped = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedStatus || draggedStatus.type !== 'primary') return;
    mapStatus(draggedStatus.code);
    setDraggedStatus(null);
  };

  const handleStatusDropToAvailable = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedStatus || draggedStatus.type !== 'mapped') return;
    removeStatusMapping(draggedStatus.code);
    setDraggedStatus(null);
  };

  // ── Save ────────────────────────────────────────────────────────
  const updateCompanyDetails = async () => {
    if (selectedDashboards.length === 0) {
      toast.error('Please select dashboards');
      return;
    }
    setIsUpdating(true);
    try {
      const res = await clientsService.updateCompanyDetails({
        client_id: existingCompany!.id,
        dashboards: selectedDashboards.join(','),
        test_dashboards: selectedTestingDashboards.join(','),
        industry_type: industryType,
        engagementVerticals,
      });
      if (res.data.status) {
        toast.success('Company details updated');
        markEdited(false);
        fetchCompany();
      } else {
        toast.error(res.data.message ?? 'Something went wrong');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsUpdating(false);
    }
  };

  const showJobStatus = selectedDashboards.includes('0') || selectedDashboards.includes('3') ||
    selectedTestingDashboards.includes('0') || selectedTestingDashboards.includes('3');

  if (!existingCompany) return null;

  return (
    <div className="space-y-6">
      {/* ── Status badges ──────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-2 text-sm">
        {!companyServices?.length && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">No Verticals Added</Badge>
        )}
        {companyServices && companyServices.length > 0 && (
          <>
            <span className="text-green-600 text-xs">
              Last synced {existingCompany.updated_at ? new Date(existingCompany.updated_at).toLocaleDateString() : 'N/A'}
            </span>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={syncCompanyDetails}>
              Sync Now
            </Button>
          </>
        )}
      </div>

      {/* ── Basic Details ──────────────────────────────────────── */}
      <section>
        <h3 className="text-base font-medium">Basic Details</h3>
        <p className="text-sm text-muted-foreground mb-3">Choose industry type and parent company</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 block text-sm">Industry Type</Label>
            <Select value={industryType} onValueChange={(v) => { if (v) setIndustryType(v); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INDUSTRY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block text-sm">In Contract With</Label>
            <Select value={masterCompanyId.toString()} onValueChange={(v) => { if (v) setMasterCompanyId(Number(v)); }}>
              <SelectTrigger><SelectValue>{MASTER_COMPANIES[masterCompanyId] ?? 'Select company'}</SelectValue></SelectTrigger>
              <SelectContent>
                {Object.entries(MASTER_COMPANIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* ── Dashboards ─────────────────────────────────────────── */}
      <section>
        <h3 className="text-base font-medium">Dashboards</h3>
        <p className="text-sm text-muted-foreground mb-3">Choose dashboards available to this client</p>
        <div className="flex flex-wrap gap-2">
          {dashboards.map((d) => (
            <button
              key={d.code}
              onClick={() => toggleDashboard(d.code)}
              className={`px-3 py-1 rounded border-2 text-sm transition-all ${
                selectedDashboards.includes(d.code.toString())
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-transparent bg-muted hover:bg-accent'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
      </section>

      {/* ── Testing Dashboards ─────────────────────────────────── */}
      <section>
        <h3 className="text-base font-medium">Testing Dashboards</h3>
        <p className="text-sm text-muted-foreground mb-3">Choose testing dashboards available to this client</p>
        <div className="flex flex-wrap gap-2">
          {dashboards.map((d) => (
            <button
              key={d.code}
              onClick={() => toggleTestingDashboard(d.code)}
              className={`px-3 py-1 rounded border-2 text-sm transition-all ${
                selectedTestingDashboards.includes(d.code.toString())
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-transparent bg-muted hover:bg-accent'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>
      </section>

      <Separator />

      {/* ── Engagement Verticals (Drag & Drop) ─────────────────── */}
      <section>
        <h3 className="text-base font-medium">Engagement - Vertical Relation</h3>
        <p className="text-sm text-muted-foreground mb-3">Drag and drop verticals to appropriate engagements</p>
        <div className="grid grid-cols-2 gap-4">
          {/* Available Verticals */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Available Verticals</p>
            <ScrollArea
              className="h-[350px] rounded border bg-muted/30 p-2"
              onDrop={handleRemoveDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {verticals.map((v) => (
                <div
                  key={v.id}
                  draggable
                  onDragStart={() => setDraggedVertical(v)}
                  className="flex items-center gap-1 px-2 py-1 mb-1.5 bg-background rounded shadow-sm cursor-grab text-sm"
                >
                  <span className="text-muted-foreground text-xs">&#9776;</span>
                  {v.title}
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Engagement Drop Zone */}
          <div>
            <Tabs
              value={selectedEngagement.index.toString()}
              onValueChange={(v: string | null) => {
                if (!v) return;
                const eng = ENGAGEMENTS.find((e) => e.index === Number(v));
                if (eng) setSelectedEngagement(eng);
              }}
            >
              <TabsList className="mb-2">
                {ENGAGEMENTS.map((e) => (
                  <TabsTrigger key={e.index} value={e.index.toString()}>{e.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <ScrollArea
              className="h-[350px] rounded border-t-2 border-primary bg-muted/30 p-2"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {filteredEngagementVerticals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center gap-2">
                  <p>Drag and drop verticals from<br />Available Verticals to {selectedEngagement.label}.</p>
                </div>
              ) : (
                filteredEngagementVerticals.map((ev) => (
                  <div
                    key={`${ev.wm_vertical_id}-${ev.engagement_id}`}
                    draggable
                    onDragStart={() => setDraggedVertical({ id: ev.id, wm_vertical_id: ev.wm_vertical_id, title: ev.title })}
                    className="flex items-center gap-1 px-2 py-1 mb-1.5 bg-background rounded shadow-sm cursor-grab text-sm"
                  >
                    <span className="text-muted-foreground text-xs">&#9776;</span>
                    {ev.title}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        </div>
      </section>

      {/* ── Job Status Mapping ─────────────────────────────────── */}
      {showJobStatus && (
        <>
          <Separator />
          <section className="relative">
            <h3 className="text-base font-medium">Job Status</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Drag and drop statuses to map or click + / x to add and remove
            </p>

            {isMappingStatus && (
              <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded text-sm text-muted-foreground">
                Mapping job status...
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Primary / Available */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Available Status</p>
                <ScrollArea
                  className="h-[350px] rounded border bg-muted/30 p-2"
                  onDrop={handleStatusDropToAvailable}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {primaryStatuses.map((s) => (
                    <div
                      key={s.Code}
                      draggable
                      onDragStart={() => setDraggedStatus({ code: s.Code, type: 'primary' })}
                      onDragEnd={() => setDraggedStatus(null)}
                      className="flex items-center justify-start gap-1 px-2 py-1 mb-1.5 bg-background rounded shadow-sm cursor-grab text-sm"
                    >
                      <span className="text-muted-foreground text-xs">&#9776;</span>
                      <span>{s.Name}</span>
                    </div>
                  ))}
                </ScrollArea>
              </div>

              {/* Secondary / Mapped */}
              <div>
                <div className="mb-2">
                  <Label className="text-sm">Added Job Status</Label>
                  <Select
                    value={selectedSecondaryStatus?.Code?.toString() ?? ''}
                    onValueChange={(v: string | null) => {
                      if (!v) return;
                      const s = secondaryStatuses.find((ss) => ss.Code === Number(v));
                      if (s) setSelectedSecondaryStatus(s);
                    }}
                  >
                    <SelectTrigger className="mt-1"><SelectValue>{selectedSecondaryStatus?.Name ?? 'Select status'}</SelectValue></SelectTrigger>
                    <SelectContent>
                      {secondaryStatuses.map((s) => (
                        <SelectItem key={s.Code} value={s.Code.toString()}>{s.Name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ScrollArea
                  className="h-[306px] rounded border-t-2 border-primary bg-muted/30 p-2"
                  onDrop={handleStatusDropToMapped}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {selectedSecondaryStatus && (mappedStatuses[selectedSecondaryStatus.Code] as unknown as { code: number; primarystatus: string }[] | undefined)?.length ? (
                    (mappedStatuses[selectedSecondaryStatus.Code] as unknown as { code: number; primarystatus: string }[]).map((ms) => (
                      <div
                        key={ms.code}
                        draggable
                        onDragStart={() => setDraggedStatus({ code: ms.code, type: 'mapped' })}
                        onDragEnd={() => setDraggedStatus(null)}
                        className="flex items-center justify-start gap-1 px-2 py-1 mb-1.5 bg-background rounded shadow-sm cursor-grab text-sm"
                      >
                        <span className="text-muted-foreground text-xs">&#9776;</span>
                        <span>{ms.primarystatus}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm text-center gap-2">
                      <p>Drag and drop statuses from<br />Available Status to map them.</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ── Admin Debug View ───────────────────────────────────── */}
      {isAdmin && (
        <details className="text-xs border rounded bg-muted/30 overflow-hidden">
          <summary className="p-2 cursor-pointer font-medium text-center border-b bg-muted/50">System Admin View</summary>
          <div className="p-2 max-h-48 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{JSON.stringify(existingCompany, null, 2)}</pre>
          </div>
        </details>
      )}

      {/* ── Sticky Save Bar ────────────────────────────────────── */}
      {isEdited && (
        <div className="fixed bottom-0 left-0 right-0 bg-yellow-50/90 backdrop-blur-sm border rounded-md p-3 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-medium">Changes made</p>
            <p className="text-xs text-muted-foreground">Click Update to save or Cancel to reset</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { markEdited(false); fetchCompany(); }} disabled={isUpdating}>
              Cancel
            </Button>
            <Button size="sm" onClick={updateCompanyDetails} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update Changes'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
