import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useClientStore } from '@/store/useClientStore';
import { rulesService } from '@/services/rules.service';
import { masterService } from '@/services/master.service';
import { useToast } from '@/components/ui/toast';
import type { Dashboard, Vertical } from '@/types';

export function CompanyRules() {
  const { existingCompany, companyServices, setIsEdited } = useClientStore();
  const toast = useToast();

  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [selectedVertical, setSelectedVertical] = useState<Vertical | null>(null);
  const [rules, setRules] = useState<Record<string, unknown>[]>([]);
  const [changedRules, setChangedRules] = useState<Record<string, string>[]>([]);
  const [isFetchingRules, setIsFetchingRules] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [isEdited, setLocalIsEdited] = useState(false);

  const markEdited = (val: boolean) => {
    setLocalIsEdited(val);
    setIsEdited(val);
  };

  const verticals = companyServices?.map((s) => ({
    id: s.id,
    wm_vertical_id: s.wm_vertical_id,
    title: s.title,
  })) ?? [];

  // ── Fetch dashboards on mount ───────────────────────────────────
  useEffect(() => {
    if (!existingCompany?.dashboards) return;
    masterService.getDashboardMasterById({ dashboard_ids: existingCompany.dashboards }).then((res) => {
      const list: Dashboard[] = (res.data?.data ?? []).map((d: Record<string, unknown>) => ({
        id: d.id as number,
        code: d.code as number,
        title: d.title as string,
      }));
      setDashboards(list);
      if (list.length > 0) setSelectedDashboard(list[0]);
    });
  }, [existingCompany?.dashboards]);

  useEffect(() => {
    if (verticals.length > 0 && !selectedVertical) setSelectedVertical(verticals[0]);
  }, [companyServices]);

  // ── Fetch rules when dashboard/vertical changes ─────────────────
  const fetchRuleMaster = useCallback(async () => {
    try {
      const res = await rulesService.getRuleMaster();
      setRules(Object.values(res.data?.data ?? {}));
    } catch { /* ignore */ }
  }, []);

  const fetchRulesByClient = useCallback(async () => {
    if (!existingCompany || !selectedVertical || !selectedDashboard) return;
    setIsFetchingRules(true);
    try {
      const res = await rulesService.getRules({
        client_id: existingCompany.id,
        vertical_id: selectedVertical.wm_vertical_id,
        dashboard_id: selectedDashboard.code,
      });
      setChangedRules(JSON.parse(res.data?.data?.rules ?? '[]'));
    } catch {
      setChangedRules([]);
    } finally {
      setIsFetchingRules(false);
    }
  }, [existingCompany?.id, selectedVertical?.wm_vertical_id, selectedDashboard?.code]);

  useEffect(() => {
    fetchRuleMaster();
  }, []);

  useEffect(() => {
    fetchRulesByClient();
  }, [fetchRulesByClient]);

  const ruleMasters = useMemo(() => {
    const map: Record<string, any> = {};
    rules.forEach((section: any) => {
      if (Array.isArray(section)) {
        section.forEach((item: any) => {
          if (item.rules && Array.isArray(item.rules)) {
            item.rules.forEach((rule: any) => {
              map[rule.rule_code] = rule;
            });
          }
        });
      }
    });
    return map;
  }, [rules]);

  // ── Rule helpers ────────────────────────────────────────────────
  const getRuleIndex = (key: string) => changedRules.findIndex((r) => Object.keys(r)[0] === key);

  const checkRuleValue = (key: string): boolean => {
    const idx = getRuleIndex(key);
    if (idx > -1) {
      return changedRules[idx][key] === '1';
    } else {
      // Find in master
      if (ruleMasters[key]) {
        return ruleMasters[key].value === '1';
      }
      // Default fallback when not found in either
      return true;
    }
  };

  const setRule = (key: string, value: string) => {
    markEdited(true);
    setChangedRules((prev) => {
      const idx = prev.findIndex((r) => Object.keys(r)[0] === key);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { [key]: value };
        return updated;
      }
      return [...prev, { [key]: value }];
    });
  };

  // ── Save rules ──────────────────────────────────────────────────
  const saveRules = async () => {
    if (!existingCompany || !selectedVertical || !selectedDashboard) return;
    setIsSavingRules(true);
    try {
      await rulesService.setRulesByClient({
        client_id: existingCompany.id,
        service_id: selectedVertical.wm_vertical_id,
        dashboard_id: selectedDashboard.code,
        rules: JSON.stringify(changedRules),
      });
      markEdited(false);
      toast.success('Rules updated');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSavingRules(false);
    }
  };

  // ── Reset rules ─────────────────────────────────────────────────
  const resetRules = async () => {
    if (!existingCompany) return;
    try {
      await rulesService.resetRulesForClient({ client_id: existingCompany.id });
      toast.success(`Settings created for ${existingCompany.name}`);
      markEdited(false);
      fetchRulesByClient();
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-xs mb-1 block">Dashboard</Label>
          <Select
            value={selectedDashboard?.code?.toString() ?? ''}
            onValueChange={(v: string | null) => {
              if (!v) return;
              const d = dashboards.find((db) => db.code === Number(v));
              if (d) setSelectedDashboard(d);
            }}
          >
            <SelectTrigger className="h-8"><SelectValue>{selectedDashboard?.title ?? 'Select dashboard'}</SelectValue></SelectTrigger>
            <SelectContent>
              {dashboards.map((d) => (
                <SelectItem key={d.code} value={d.code.toString()}>{d.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs mb-1 block">Vertical</Label>
          <Select
            value={selectedVertical?.wm_vertical_id?.toString() ?? ''}
            onValueChange={(v: string | null) => {
              if (!v) return;
              const vert = verticals.find((vt) => vt.wm_vertical_id === Number(v));
              if (vert) setSelectedVertical(vert);
            }}
          >
            <SelectTrigger className="h-8"><SelectValue>{selectedVertical?.title ?? 'Select vertical'}</SelectValue></SelectTrigger>
            <SelectContent>
              {verticals.map((v) => (
                <SelectItem key={v.wm_vertical_id} value={v.wm_vertical_id.toString()}>{v.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Rules List ─────────────────────────────────────────── */}
      {isFetchingRules ? (
        <div className="text-sm text-muted-foreground text-center py-6">Loading rules...</div>
      ) : (
        <ScrollArea className="max-h-[500px]">
          <div className="space-y-3">
            {rules.map((section: any, sectionIdx: number) => {
              if (!Array.isArray(section) || section.length === 0) return null;
              // Filter items whose dashboard_id matches the selected dashboard
              const filteredItems = section.filter(
                (item: any) => item.dashboard_id === selectedDashboard?.id
              );
              if (filteredItems.length === 0) return null;
              const sectionTitle = filteredItems[0]?.title;
              return (
                <div key={sectionIdx} className="bg-muted/40 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-3 py-2 font-medium text-sm">{sectionTitle}</div>
                  <div className="divide-y">
                    {filteredItems.map((item: any, itemIdx: number) =>
                      item.rules?.map((rule: any, ruleIdx: number) => (
                        <div
                          key={`${sectionIdx}-${itemIdx}-${ruleIdx}`}
                          className="flex items-center justify-between px-3 py-2 bg-background text-sm"
                        >
                          <span className="text-neutral-700">{rule.rule_master_title}</span>
                          <Switch
                            checked={checkRuleValue(rule.rule_code)}
                            onCheckedChange={(checked) => setRule(rule.rule_code, checked ? '1' : '0')}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {/* ── Actions ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={resetRules}>
          Reset Rules
        </Button>
        {isEdited && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { markEdited(false); fetchRulesByClient(); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={saveRules} disabled={isSavingRules}>
              {isSavingRules ? 'Saving...' : 'Save Rules'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
