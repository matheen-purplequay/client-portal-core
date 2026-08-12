import { Button } from '@/components/ui/button';
import { Combobox, ComboboxContent, ComboboxItem, ComboboxTrigger, ComboboxValue } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ClientUser, Role, WMClientUser } from '@/types';

interface AddUserFormProps {
  wmClientUsers: WMClientUser[];
  selectedWMUser: WMClientUser | null;
  selectedWMUserId: string;
  roles: Role[];
  newUser: ClientUser;
  isSaving: boolean;
  onWMUserChange: (cid: string) => void;
  onRoleChange: (role: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function AddUserForm({
  wmClientUsers,
  selectedWMUser,
  roles,
  newUser,
  isSaving,
  onWMUserChange,
  onRoleChange,
  onSave,
  onCancel,
}: AddUserFormProps) {
  return (
    <div className="border rounded-md p-4 bg-muted/20 space-y-3">
      <h4 className="text-sm font-medium">Add New User</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs">User</Label>
          <Combobox
            items={wmClientUsers}
            itemToStringLabel={(u: WMClientUser) => u.Contactname}
            value={selectedWMUser}
            onValueChange={(u: WMClientUser | null) => { if (u) onWMUserChange(u.cid.toString()); }}
            isItemEqualToValue={(a: WMClientUser, b: WMClientUser) => a.cid === b.cid}
          >
            <ComboboxTrigger className="h-8">
              <ComboboxValue placeholder="Select user">
                {(u: WMClientUser | null) => u?.Contactname ?? 'Select user'}
              </ComboboxValue>
            </ComboboxTrigger>
            <ComboboxContent>
              {(u: WMClientUser) => (
                <ComboboxItem key={u.cid} value={u}>
                  {u.Contactname}
                </ComboboxItem>
              )}
            </ComboboxContent>
          </Combobox>
        </div>
        <div>
          <Label className="text-xs">Role</Label>
          <Select value={newUser.role} onValueChange={(v: string | null) => { if (v) onRoleChange(v); }}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.id} value={r.code}>{r.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {selectedWMUser && (
        <div className="rounded-md bg-muted/40 px-3 py-2 space-y-1">
          <p className="text-xs"><span className="text-muted-foreground">Name:</span> {selectedWMUser.Contactname}</p>
          <p className="text-xs"><span className="text-muted-foreground">Email:</span> {selectedWMUser.Emailaddress}</p>
          <p className="text-xs"><span className="text-muted-foreground">Designation:</span> {selectedWMUser.Designation}</p>
        </div>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Create User'}
        </Button>
      </div>
    </div>
  );
}
