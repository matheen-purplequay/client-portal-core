import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxValue,
} from '@/components/ui/combobox';
import { useToast } from '@/components/ui/toast';
import { userService } from '@/services/user.service';
import { teamsService } from '@/services/teams.service';
import { SyncUserConfirmDialog } from '@/components/SyncUserConfirmDialog';
import type {
  PortalUser,
  Role,
  WMInternalUser,
  GenerateInternalAccessPayload,
} from '@/types';

const WORKS_MANAGER_CLIENT_ID = 8;

export function UserList() {
  const toast = useToast();

  // Data
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [wmInternalUsers, setWmInternalUsers] = useState<WMInternalUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  // Loading state
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [isFetchingWMUsers, setIsFetchingWMUsers] = useState(false);
  const [isGeneratingAccess, setIsGeneratingAccess] = useState(false);

  // UI state
  const [isSyncMode, setIsSyncMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PortalUser | null>(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [wmUserSearchTerm, setWmUserSearchTerm] = useState('');

  // Per-row role selection in WM sync list (keyed by Uid)
  const [pendingRoleByUid, setPendingRoleByUid] = useState<Record<number, number>>({});

  // Confirmation dialog
  const [confirmTarget, setConfirmTarget] = useState<{ user: WMInternalUser; role: Role } | null>(null);

  // ── Fetchers ───────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsFetchingUsers(true);
    try {
      const res = await userService.getUsers({ works_manager_client_id: WORKS_MANAGER_CLIENT_ID });
      const data = res.data;
      if (data.status) {
        setUsers(data.data);
        if (data.data.length > 0) setSelectedUser(data.data[0]);
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setIsFetchingUsers(false);
    }
  }, []);

  const fetchWMInternalUsers = useCallback(async () => {
    setIsFetchingWMUsers(true);
    try {
      const res = await userService.getWMInternalUsers();
      const data = res.data;
      if (data.status) setWmInternalUsers(data.data);
    } finally {
      setIsFetchingWMUsers(false);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await teamsService.getRoles({
        type: ['self'],
        category: ['management', 'employee'],
      });
      const data = res.data;
      if (data.status) {
        setRoles(data.data.map((r: Role) => ({ id: r.id, title: r.title, code: r.code })));
      }
    } catch {
      setRoles([]);
    }
  }, []);

  // ── Init ───────────────────────────────────────────────────────
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchWMInternalUsers();
  }, [fetchUsers, fetchRoles, fetchWMInternalUsers]);

  // ── Filters ────────────────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    if (!userSearchTerm) return users;
    const q = userSearchTerm.toLowerCase();
    return users.filter(
      (u) =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [users, userSearchTerm]);

  const filteredWMUsers = useMemo(() => {
    if (!wmUserSearchTerm) return wmInternalUsers;
    const q = wmUserSearchTerm.toLowerCase();
    return wmInternalUsers.filter(
      (u) =>
        u.Firstname?.toLowerCase().includes(q) ||
        u.Lastname?.toLowerCase().includes(q) ||
        u.NewOfficialEmailID?.toLowerCase().includes(q),
    );
  }, [wmInternalUsers, wmUserSearchTerm]);

  // ── Existing-in-portal lookup (used to hide role dropdown) ─────
  const existingStaffIds = useMemo(
    () =>
      new Set(
        users
          .map((u) => u.staff_id)
          .filter((id): id is number => typeof id === 'number'),
      ),
    [users],
  );

  const existingEmails = useMemo(
    () =>
      new Set(
        users
          .map((u) => u.email?.toLowerCase())
          .filter((e): e is string => !!e),
      ),
    [users],
  );

  const isAlreadyInPortal = useCallback(
    (wm: WMInternalUser) =>
      existingStaffIds.has(wm.Uid) ||
      (!!wm.NewOfficialEmailID && existingEmails.has(wm.NewOfficialEmailID.toLowerCase())),
    [existingStaffIds, existingEmails],
  );

  // ── Sync user flow ─────────────────────────────────────────────
  const handleRoleChange = (uid: number, roleId: string) => {
    const idNum = Number(roleId);
    setPendingRoleByUid((prev) => ({ ...prev, [uid]: idNum }));
    const wmUser = wmInternalUsers.find((u) => u.Uid === uid);
    const role = roles.find((r) => r.id === idNum);
    if (wmUser && role) setConfirmTarget({ user: wmUser, role });
  };

  const handleConfirmSync = async () => {
    if (!confirmTarget) return;
    const { user, role } = confirmTarget;

    const payload: GenerateInternalAccessPayload = {
      first_name: user.Firstname,
      last_name: user.Lastname,
      email: user.NewOfficialEmailID,
      password: 'password',
      staff_id: user.Uid,
      wm_user_id: 0,
      wm_user_employee_id: user.NewEmworks_manager_client_id,
      company_id: 1,
      role: role.code,
    };

    setIsGeneratingAccess(true);
    try {
      const res = await userService.generateInternalAccess(payload);
      if (res.data?.status) {
        toast.success('Internal user access created');
        setConfirmTarget(null);
        setPendingRoleByUid((prev) => {
          const next = { ...prev };
          delete next[user.Uid];
          return next;
        });
        fetchUsers();
      } else {
        toast.error('Could not create access. Please try again.');
      }
    } catch {
      toast.error('Could not create access. Please try again.');
    } finally {
      setIsGeneratingAccess(false);
    }
  };

  const handleCancelSync = () => {
    if (confirmTarget) {
      setPendingRoleByUid((prev) => {
        const next = { ...prev };
        delete next[confirmTarget.user.Uid];
        return next;
      });
    }
    setConfirmTarget(null);
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="p-4 w-full">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">
                {isSyncMode ? 'Sync from Works Manager' : 'Internal Users'}
              </CardTitle>
              <CardDescription>
                {isSyncMode
                  ? 'Pick a Works Manager user, choose a role, and confirm to add them.'
                  : 'Existing Carisma internal users.'}
              </CardDescription>
            </div>
            <div className="flex gap-1 border rounded-md p-0.5">
              <Button
                variant={!isSyncMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsSyncMode(false)}
              >
                Portal
              </Button>
              <Button
                variant={isSyncMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setIsSyncMode(true)}
              >
                Works Manager
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-12 gap-4">
            {/* ── Left: Existing portal users ─────────────────── */}
            <div className="col-span-4">
              <div className="border rounded-md overflow-hidden">
                <div className="sticky top-0 bg-background z-10 border-b px-2 py-1.5 flex items-center gap-1">
                  <Input
                    placeholder="Search user"
                    value={userSearchTerm}
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                    className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={fetchUsers}
                    title="Refresh"
                  >
                    <span className="text-sm">&#8635;</span>
                  </Button>
                </div>
                <ScrollArea className="h-[550px]">
                  {isFetchingUsers ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      Loading users...
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                      No users found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {filteredUsers.map((u) => (
                        <button
                          key={u.id ?? u.user_id}
                          onClick={() => setSelectedUser(u)}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            selectedUser?.id === u.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-accent'
                          }`}
                        >
                          <div className="truncate font-medium">
                            {u.first_name} {u.last_name}
                          </div>
                          <div className="truncate text-xs opacity-70">{u.email}</div>
                          <div className="truncate text-xs opacity-70">
                            {u.role?.split('_').join(' ')}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>

            {/* ── Right: WM sync OR selected user info ───────── */}
            <div className="col-span-8">
              {isSyncMode ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="sticky top-0 bg-background z-10 border-b px-2 py-1.5 flex items-center gap-1">
                    <Input
                      placeholder="Search Works Manager user"
                      value={wmUserSearchTerm}
                      onChange={(e) => setWmUserSearchTerm(e.target.value)}
                      className="border-0 shadow-none focus-visible:ring-0 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={fetchWMInternalUsers}
                      title="Refresh"
                    >
                      <span className="text-sm">&#8635;</span>
                    </Button>
                  </div>
                  <ScrollArea className="h-[550px]">
                    {isFetchingWMUsers ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        Fetching users from Works Manager...
                      </div>
                    ) : filteredWMUsers.length === 0 ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
                        No users found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredWMUsers.map((u, i) => (
                          <div
                            key={u.Uid}
                            className={`flex items-center justify-between gap-3 px-3 py-2 text-sm ${
                              i % 2 === 0 ? 'bg-muted/30' : ''
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {u.Firstname} {u.Lastname}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {u.NewOfficialEmailID}
                              </div>
                            </div>
                            {isAlreadyInPortal(u) ? (
                              <span className="text-xs text-muted-foreground w-[160px] text-right">
                                Already in portal
                              </span>
                            ) : (
                              <Combobox
                                items={roles}
                                itemToStringLabel={(r: Role) => r.title}
                                isItemEqualToValue={(a: Role, b: Role) => a.id === b.id}
                                value={roles.find((r) => r.id === pendingRoleByUid[u.Uid]) ?? null}
                                onValueChange={(r: Role | null) => {
                                  if (r) handleRoleChange(u.Uid, r.id.toString());
                                }}
                              >
                                <ComboboxTrigger size="sm" className="w-[160px]">
                                  <ComboboxValue placeholder="Add as...">
                                    {(r: Role | null) => r?.title ?? 'Add as...'}
                                  </ComboboxValue>
                                </ComboboxTrigger>
                                <ComboboxContent>
                                  {(r: Role) => (
                                    <ComboboxItem key={r.id} value={r}>
                                      {r.title}
                                    </ComboboxItem>
                                  )}
                                </ComboboxContent>
                              </Combobox>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              ) : selectedUser ? (
                <div className="border rounded-md p-4">
                  <div className="text-lg font-medium">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {selectedUser.role?.split('_').join(' ')}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground gap-2 py-12">
                  <span>&larr;</span> Select a user from the list
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <SyncUserConfirmDialog
        open={!!confirmTarget}
        user={confirmTarget?.user ?? null}
        role={confirmTarget?.role ?? null}
        isSubmitting={isGeneratingAccess}
        onConfirm={handleConfirmSync}
        onCancel={handleCancelSync}
      />
    </div>
  );
}
