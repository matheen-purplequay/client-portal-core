import { useEffect, useState, useCallback } from 'react';
import { Separator } from '@/components/ui/separator';
import { useClientStore } from '@/store/useClientStore';
import { userService } from '@/services/user.service';
import { teamsService } from '@/services/teams.service';
import { splitName, getUserData } from '@/hooks/useUserData';
import { useToast } from '@/components/ui/toast';
import type { ClientUser, Role, WMClientUser } from '@/types';
import { defaultClientUser } from '@/types';
import { ClientSetupHeader } from './components/ClientSetupHeader';
import { AddUserForm } from './components/AddUserForm';
import { ClientUserList } from './components/ClientUserList';
import { ClientUserEdit } from './components/ClientUserEdit';

export function ClientSetup() {
  const { existingCompany } = useClientStore();
  const toast = useToast();

  const [clientUsers, setClientUsers] = useState<ClientUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ClientUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newUser, setNewUser] = useState<ClientUser>(defaultClientUser());
  const [searchTerm, setSearchTerm] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [editingUser, setEditingUser] = useState<ClientUser | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [wmClientUsers, setWmClientUsers] = useState<WMClientUser[]>([]);
  const [selectedWMUser, setSelectedWMUser] = useState<WMClientUser | null>(null);
  const [selectedWMUserId, setSelectedWMUserId] = useState('');

  useEffect(() => {
    const user = getUserData();
    if (user?.role === 'admin' || user?.role === 'group_director') {
      setCanDelete(true);
      setCanEdit(true);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await teamsService.getRoles({ type: ['client'], category: ['management', 'employee'] });
      if (res.data?.status) {
        const list = res.data.data.map(({ id, title, code }: Role) => ({ id, title, code }));
        setRoles(list);
        if (list.length > 0) setNewUser((u) => ({ ...u, role: list[0].code }));
      }
    } catch { /* ignore */ }
  }, []);

  const fetchClientUsers = useCallback(async () => {
    if (!existingCompany) return;
    setIsFetchingUsers(true);
    try {
      const res = await userService.getClientUsers({ company_id: existingCompany.id });
      setClientUsers(res.data?.data ?? []);
      setFilteredUsers(res.data?.data ?? []);
    } finally {
      setIsFetchingUsers(false);
    }
  }, [existingCompany?.id]);

  const fetchWMClientUsers = useCallback(async () => {
    try {
      const res = await userService.getWMClientUsers(existingCompany?.id ?? 0);
      if (res.data?.data) setWmClientUsers(res.data.data);
      else if (Array.isArray(res.data)) setWmClientUsers(res.data);
    } catch { /* ignore */ }
  }, []);

  const handleWMUserChange = (cid: string) => {
    setSelectedWMUserId(cid);
    const user = wmClientUsers.find((u) => u.cid.toString() === cid);
    if (user) {
      setSelectedWMUser(user);
      const name = splitName(user.Contactname);
      setNewUser((u) => ({
        ...u,
        first_name: name.firstName,
        middle_name: name.middleName,
        last_name: name.lastName,
        email: user.Emailaddress,
      }));
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchClientUsers();
    fetchWMClientUsers();
  }, [existingCompany?.id]);

  // ── Search filter ───────────────────────────────────────────────
  useEffect(() => {
    if (!searchTerm) {
      setFilteredUsers(clientUsers);
    } else {
      const st = searchTerm.toLowerCase();
      setFilteredUsers(
        clientUsers.filter(
          (u) =>
            `${u.first_name} ${u.middle_name} ${u.last_name}`.toLowerCase().includes(st) ||
            u.email.toLowerCase().includes(st)
        )
      );
    }
  }, [searchTerm, clientUsers]);

  // ── Save new user ──────────────────────────────────────────────
  const saveUser = async () => {
    if (!selectedWMUser || !newUser.role) {
      toast.error('Please select a user and role');
      return;
    }
    setIsSaving(true);
    try {
      await userService.generateAccess({
        first_name: newUser.first_name,
        middle_name: newUser.middle_name,
        last_name: newUser.last_name,
        company_id: existingCompany!.id,
        email: newUser.email,
        role: newUser.role,
      });
      toast.success('User created');
      setNewUser(defaultClientUser());
      setSelectedWMUser(null);
      setSelectedWMUserId('');
      setAddingNew(false);
      fetchClientUsers();
    } catch {
      toast.error('Something went wrong while saving user');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Update user ─────────────────────────────────────────────────
  const updateUser = async (user: ClientUser) => {
    if (!user.first_name || !user.email || !user.role) {
      toast.error('First name, email, and role are required');
      return;
    }
    setIsSaving(true);
    try {
      await userService.updateClientUser({
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        user_id: user.user_id,
        is_active: user.is_active ? 1 : 0,
        hide_in_selection: user.hide_in_selection ? 1 : 0,
      });
      toast.success('User updated');
      setEditingUser(null);
      fetchClientUsers();
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Remove user ─────────────────────────────────────────────────
  const removeUser = async (user: ClientUser) => {
    if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) return;
    try {
      await userService.removeClientUser({ client_id: user.user_id });
      toast.success('User removed');
      fetchClientUsers();
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleCancelAdd = () => {
    setAddingNew(false);
    setNewUser(defaultClientUser());
    setSelectedWMUser(null);
    setSelectedWMUserId('');
  };

  return (
    <div className="space-y-4">
      <ClientSetupHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        addingNew={addingNew}
        onToggleAddingNew={() => setAddingNew(!addingNew)}
      />

      {addingNew && (
        <AddUserForm
          wmClientUsers={wmClientUsers}
          selectedWMUser={selectedWMUser}
          selectedWMUserId={selectedWMUserId}
          roles={roles}
          newUser={newUser}
          isSaving={isSaving}
          onWMUserChange={handleWMUserChange}
          onRoleChange={(role) => setNewUser((u) => ({ ...u, role }))}
          onSave={saveUser}
          onCancel={handleCancelAdd}
        />
      )}

      <Separator />

      <ClientUserList
        users={filteredUsers}
        roles={roles}
        isFetching={isFetchingUsers}
        canEdit={canEdit}
        canDelete={canDelete}
        onStartEdit={setEditingUser}
        onRemove={removeUser}
      />

      <ClientUserEdit
        user={editingUser}
        companyId={existingCompany?.id ?? 0}
        roles={roles}
        wmClientUsers={wmClientUsers}
        isSaving={isSaving}
        onClose={() => setEditingUser(null)}
        onSave={updateUser}
      />
    </div>
  );
}
