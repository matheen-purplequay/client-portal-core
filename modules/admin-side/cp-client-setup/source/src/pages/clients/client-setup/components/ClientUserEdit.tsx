import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContactMapping } from './ContactMapping';
import type { ClientUser, Role, WMClientUser } from '@/types';

interface ClientUserEditProps {
  user: ClientUser | null;
  companyId: number;
  roles: Role[];
  wmClientUsers: WMClientUser[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (user: ClientUser) => void;
}

export function ClientUserEdit({ user, companyId, roles, wmClientUsers, isSaving, onClose, onSave }: ClientUserEditProps) {
  const [draft, setDraft] = useState<ClientUser | null>(user);
  const [isMappingSaving, setIsMappingSaving] = useState(false);

  useEffect(() => {
    setDraft(user);
  }, [user]);

  const open = user !== null;

  const updateField = <K extends keyof ClientUser>(key: K, value: ClientUser[K]) => {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isMappingSaving) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        {draft && (
          <Tabs defaultValue="details">
            <TabsList className="w-full">
              <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
              <TabsTrigger value="contact-mapping" className="flex-1">Contact Mapping</TabsTrigger>
            </TabsList>

            {/* ── Details ──────────────────────────────────────────────────── */}
            <TabsContent value="details" className="space-y-3 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">First name</Label>
                  <Input value={draft.first_name} onChange={(e) => updateField('first_name', e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Middle name</Label>
                  <Input value={draft.middle_name} onChange={(e) => updateField('middle_name', e.target.value)} className="h-8" />
                </div>
                <div>
                  <Label className="text-xs">Last name</Label>
                  <Input value={draft.last_name} onChange={(e) => updateField('last_name', e.target.value)} className="h-8" />
                </div>
              </div>

              <div>
                <Label className="text-xs">Email</Label>
                <Input value={draft.email} onChange={(e) => updateField('email', e.target.value)} className="h-8" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Role</Label>
                  <Select value={draft.role} onValueChange={(v: string | null) => { if (v) updateField('role', v); }}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r.id} value={r.code}>{r.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Status</Label>
                  <div className="flex items-center gap-2 h-8">
                    <Switch checked={draft.is_active} onCheckedChange={(v) => updateField('is_active', v)} />
                    <span className="text-xs">{draft.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs">Client Portal - Contact Dropdown Selection</Label>
                <div className="flex items-center gap-2 h-8">
                  <Switch checked={!draft.hide_in_selection} onCheckedChange={(v) => updateField('hide_in_selection', !v)} />
                  <span className="text-xs">{draft.hide_in_selection ? 'Hidden' : 'Visible'}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
                <Button size="sm" onClick={() => draft && onSave(draft)} disabled={isSaving || !draft}>
                  {isSaving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </TabsContent>

            {/* ── Contact Mapping ───────────────────────────────────────────── */}
            <TabsContent value="contact-mapping" className="pt-2">
              <ContactMapping companyId={companyId} userEmail={draft.email} allContacts={wmClientUsers} onSavingChange={setIsMappingSaving} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
