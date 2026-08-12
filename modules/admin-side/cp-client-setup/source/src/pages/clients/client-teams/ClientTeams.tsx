import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useClientStore } from '@/store/useClientStore';
import { teamsService } from '@/services/teams.service';
import { useToast } from '@/components/ui/toast';
import type { TeamsPayload, TeamsData, Vertical, Role } from '@/types';
import { defaultTeamsPayload } from '@/types';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

export function ClientTeams() {
  const { existingCompany } = useClientStore();
  const toast = useToast();

  const [teams, setTeams] = useState<TeamsData[]>([]);
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selfUsers, setSelfUsers] = useState<Record<string, unknown>[]>([]);
  const [teamPayload, setTeamPayload] = useState<TeamsPayload>(defaultTeamsPayload());
  const [isGettingTeams, setIsGettingTeams] = useState(false);
  const [isSavingTeam, setIsSavingTeam] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedVerticalId, setSelectedVerticalId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  const fetchTeams = useCallback(async () => {
    if (!existingCompany) return;
    setIsGettingTeams(true);
    try {
      const res = await teamsService.getTeams({ client_id: existingCompany.works_manager_client_id });
      if (res.data?.status) setTeams(res.data.data ?? []);
    } finally {
      setIsGettingTeams(false);
    }
  }, [existingCompany?.works_manager_client_id]);

  const fetchVerticals = useCallback(async () => {
    try {
      const res = await teamsService.getVerticals();
      if (res.data?.status) {
        const list = res.data.data.map(({ id, wm_vertical_id, title }: Vertical) => ({ id, wm_vertical_id, title }));
        setVerticals(list);
        if (list.length > 0) setSelectedVerticalId(list[0].wm_vertical_id.toString());
      }
    } catch { /* ignore */ }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await teamsService.getRoles({ type: ['self'], category: ['management', 'employee'] });
      if (res.data?.status) {
        const list = res.data.data.map(({ id, title, code }: Role) => ({ id, title, code }));
        setRoles(list);
        if (list.length > 0) setSelectedRoleId(list[0].id.toString());
      }
    } catch { /* ignore */ }
  }, []);

  const fetchSelfUsers = useCallback(async () => {
    try {
      const res = await teamsService.getSelfUsers({});
      if (res.data?.data) {
        setSelfUsers(res.data.data);
        if (res.data.data.length > 0) {
          const user = res.data.data[0];
          setSelectedUserId((user.id as number).toString());
          setTeamPayload((p) => ({
            ...p,
            email: user.email as string,
            name: user.name as string,
            wm_user_id: user.wm_user_id as number,
          }));
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchVerticals();
    fetchRoles();
    fetchTeams();
    fetchSelfUsers();
  }, [existingCompany?.id]);

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    const user = selfUsers.find((u) => (u.id as number).toString() === userId);
    if (user) {
      setTeamPayload((p) => ({
        ...p,
        email: user.email as string,
        name: user.name as string,
        wm_user_id: user.wm_user_id as number,
      }));
    }
  };

  const saveTeam = async () => {
    if (!existingCompany) return;
    const emailExists = teams.some((t) => t.email === teamPayload.email);
    if (emailExists) {
      toast.warning('Team member for selected vertical already exists');
      return;
    }

    setIsSavingTeam(true);
    const payload: TeamsPayload = {
      ...teamPayload,
      client_id: existingCompany.works_manager_client_id,
      vertical_id: Number(selectedVerticalId),
      role_id: Number(selectedRoleId),
    };

    try {
      await teamsService.addToTeam(payload);
      toast.success('Team member added');
      setTeamPayload(defaultTeamsPayload());
      setShowAddForm(false);
      fetchTeams();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSavingTeam(false);
    }
  };

  const toggleStatus = async (teamId: number) => {
    try {
      await teamsService.toggleStatusTeamMember({ team_id: teamId });
      fetchTeams();
    } catch {
      toast.error('Something went wrong');
    }
  };

  const deleteMember = async (teamId: number) => {
    if (!confirm('Are you sure you want to permanently delete this team member?')) return;
    try {
      const res = await teamsService.deleteTeamMember({ team_id: teamId });
      if (res.data?.status) {
        toast.success('Team member deleted');
        fetchTeams();
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {teams.length} team member{teams.length !== 1 ? 's' : ''}
        </h3>
        <Button size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Cancel' : '+ Add Team Member'}
        </Button>
      </div>

      {/* ── Add Team Member Form ───────────────────────────────── */}
      {showAddForm && (
        <div className="border rounded-md p-4 bg-muted/20 space-y-3">
          <h4 className="text-sm font-medium">Add User To Team</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">User</Label>
              <Select value={selectedUserId} onValueChange={(v: string | null) => { if (v) handleUserChange(v); }}>
                <SelectTrigger className="h-8"><SelectValue>{selfUsers.find((u) => (u.id as number).toString() === selectedUserId)?.name as string ?? 'Select user'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {selfUsers.map((u) => (
                    <SelectItem key={u.id as number} value={(u.id as number).toString()}>
                      {u.name as string}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Vertical</Label>
              <Select value={selectedVerticalId} onValueChange={(v: string | null) => { if (v) setSelectedVerticalId(v); }}>
                <SelectTrigger className="h-8"><SelectValue>{verticals.find((v) => v.wm_vertical_id.toString() === selectedVerticalId)?.title ?? 'Select vertical'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {verticals.map((v) => (
                    <SelectItem key={v.wm_vertical_id} value={v.wm_vertical_id.toString()}>
                      {v.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={selectedRoleId} onValueChange={(v: string | null) => { if (v) setSelectedRoleId(v); }}>
                <SelectTrigger className="h-8"><SelectValue>{roles.find((r) => r.id.toString() === selectedRoleId)?.title ?? 'Select role'}</SelectValue></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id.toString()}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Hierarchy / Order</Label>
              <Input
                type="number"
                value={teamPayload.heirarchy}
                onChange={(e) => setTeamPayload((p) => ({ ...p, heirarchy: Number(e.target.value) }))}
                className="h-8"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button size="sm" onClick={saveTeam} disabled={isSavingTeam}>
              {isSavingTeam ? 'Adding...' : 'Add to Team'}
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* ── Team List ──────────────────────────────────────────── */}
      {isGettingTeams ? (
        <div className="text-sm text-muted-foreground text-center py-6">Loading team members...</div>
      ) : teams.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6">No team members</div>
      ) : (
        <div className="divide-y border rounded-md overflow-hidden">
          {teams.map((member) => (
            <div key={member.id} className="px-4 py-2.5 flex items-center justify-between gap-3 text-sm">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <Badge variant="outline" className="text-xs shrink-0 border-primary">{member.role?.title}</Badge>
              <Badge variant="outline" className="text-xs shrink-0">{member.vertical?.title}</Badge>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleStatus(member.id)}>
                  <div className="flex items-center gap-1">
                    {member.status === 'active' ? <><EyeOff strokeWidth={1.5} /> Hide</> : <> <Eye className='text-red-500' strokeWidth={1.5} /> <span className="text-red-500">Show</span></>}
                  </div>
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => deleteMember(member.id)}>
                  <Trash2 strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
